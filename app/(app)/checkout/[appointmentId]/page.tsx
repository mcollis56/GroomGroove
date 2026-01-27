'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Printer, Mail, Calendar, MessageSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { completeCheckout } from '@/lib/actions/checkout'
import { getAppointmentForCheckout, markAppointmentCompleted } from '@/lib/actions/appointments'
import { safeParseDate } from '@/lib/utils/date'

// Service prices in cents - centralized pricing
const SERVICE_PRICES: Record<string, number> = {
  'Full Groom': 8500,
  'Bath & Brush': 4500,
  'Nail Trim': 2500,
  'De-shedding': 6500,
  'Teeth Cleaning': 3500,
  'Ear Cleaning': 2000,
}

interface AppointmentData {
  id: string
  scheduled_at: string
  services: string[]
  notes: string | null
  status: string
  customer: { id: string; name: string; email: string | null; phone: string | null } | null
  dog: { id: string; name: string; breed: string | null } | null
}

type Step = 'review' | 'payment' | 'receipt'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string

  // Core state
  const [appointment, setAppointment] = useState<AppointmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('review')
  const [isProcessing, setIsProcessing] = useState(false)

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const [scheduleNext, setScheduleNext] = useState(true)
  const [nextDate, setNextDate] = useState('')
  const [nextTime, setNextTime] = useState('10:00')
  const [reminderWeeks, setReminderWeeks] = useState(6)

  // Receipt state
  const [receiptNumber, setReceiptNumber] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Calculate default next date
  const getDefaultNextDate = useCallback((weeks: number) => {
    const date = new Date()
    date.setDate(date.getDate() + weeks * 7)
    return date.toISOString().split('T')[0]
  }, [])

  // Load appointment data
  useEffect(() => {
    let mounted = true

    async function loadAppointment() {
      try {
        setError(null)
        const data = await getAppointmentForCheckout(appointmentId)

        if (!mounted) return

        if (!data) {
          setError('Appointment not found')
          setLoading(false)
          return
        }

        // Validate appointment has required data
        if (!data.customer?.id || !data.dog?.id) {
          setError('Appointment is missing customer or dog information')
          setLoading(false)
          return
        }

        // Check if already completed
        if (data.status === 'completed') {
          setError('This appointment has already been completed')
          setLoading(false)
          return
        }

        if (data.status === 'cancelled') {
          setError('This appointment was cancelled')
          setLoading(false)
          return
        }

  

        setAppointment(data)
        setNextDate(getDefaultNextDate(reminderWeeks))
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        console.error('Failed to load appointment:', err)
        setError('Failed to load appointment data')
        setLoading(false)
      }
    }

    loadAppointment()

    return () => {
      mounted = false
    }
  }, [appointmentId, getDefaultNextDate, reminderWeeks])

  // Calculate total - handle empty services array
  const totalCents = (appointment?.services || []).reduce((sum, service) => {
    return sum + (SERVICE_PRICES[service] || 0)
  }, 0)

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatTime12h = (time24: string) => {
    const hour = parseInt(time24.split(':')[0])
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:00 ${ampm}`
  }

  // Step 1: Mark service complete
  const handleCompleteService = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const result = await markAppointmentCompleted(appointmentId)
      if (result.success) {
        setStep('payment')
      } else {
        setError(result.error || 'Failed to complete appointment')
      }
    } catch (err) {
      console.error('Error completing service:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 2: Process payment
  const handleProcessPayment = async () => {
    if (isProcessing) return
    if (!appointment?.customer?.id || !appointment?.dog?.id) {
      setError('Missing customer or dog information')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Build next appointment data
      let reminderDate: string | undefined
      let nextAppointment: { scheduledAt: string; services: string[] } | undefined

      if (scheduleNext && nextDate && nextTime) {
        // Create date in local time manually to avoid timezone weirdness
        const [year, month, day] = nextDate.split('-').map(Number);
        const [hour, minute] = nextTime.split(':').map(Number);
        const localDate = new Date(year, month - 1, day, hour, minute);
        
        if (!isNaN(localDate.getTime())) {
          nextAppointment = {
            scheduledAt: localDate.toISOString(), 
            services: appointment.services || [],
          }
          
          // Reminder 1 week before
          const reminder = new Date(localDate);
          reminder.setDate(reminder.getDate() - 7);
          reminderDate = reminder.toISOString().split('T')[0];
        }
      }

      console.log("Submitting checkout:", { totalCents, nextAppointment });

      const result = await completeCheckout({
        customerId: appointment.customer.id,
        dogId: appointment.dog.id,
        completedAppointmentId: appointmentId,
        services: appointment.services || [],
        amountCents: totalCents,
        nextAppointment,
        reminderDate,
      })

      if (result.success) {
        setReceiptNumber(result.receiptNumber || `GG-${Date.now()}`)
        setStep('receipt')
      } else {
        console.error("Checkout failed:", result.error);
        setError(result.error || 'Payment processing failed')
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      setError('An unexpected error occurred during payment')
    } finally {
      setIsProcessing(false)
    }
  }


  const handlePrint = () => {
    window.print()
  }

  const handleEmailReceipt = async () => {
    if (!appointment?.customer?.email) {
      setError('No email address on file')
      return
    }
    // In production, this would call an API to send the email
    setEmailSent(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading appointment...</p>
        </div>
      </div>
    )
  }

  // Error state - no appointment
  if (error && !appointment) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">Cannot Complete Checkout</p>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button href="/calendar">Back to Calendar</Button>
          </div>
        </Card>
      </div>
    )
  }

  // No appointment found
  if (!appointment) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Appointment not found</p>
            <Button href="/calendar">Back to Calendar</Button>
          </div>
        </Card>
      </div>
    )
  }

  const services = appointment.services || []

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/calendar">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500">
            {appointment.dog?.name || 'Unknown Dog'} - {appointment.customer?.name || 'Unknown Customer'}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {(['review', 'payment', 'receipt'] as Step[]).map((s, i) => {
          const stepIndex = ['review', 'payment', 'receipt'].indexOf(step)
          const isComplete = stepIndex > i
          const isCurrent = step === s

          return (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isCurrent ? 'bg-blue-600 text-white' :
                  isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {isComplete ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-12 h-0.5 mx-1 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Review Services */}
      {step === 'review' && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Review Services</h2>

          {services.length > 0 ? (
            <div className="space-y-3 mb-6">
              {services.map((service) => (
                <div key={service} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{service}</span>
                  <span className="text-gray-600">{formatCurrency(SERVICE_PRICES[service] || 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg mb-6">
              <p className="text-yellow-800">No services recorded for this appointment</p>
            </div>
          )}

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
          </div>

          {appointment.notes && (
            <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Notes:</strong> {appointment.notes}
              </p>
            </div>
          )}

          <Button
            onClick={handleCompleteService}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400"
          >
            <Check className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Mark Service Complete'}
          </Button>
        </Card>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Payment</h2>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-1 block">💳</span>
                <span className="font-medium">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-1 block">💵</span>
                <span className="font-medium">Cash</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Amount Due</span>
              <span className="text-green-600">{formatCurrency(totalCents)}</span>
            </div>
          </div>

          {/* Schedule Next Appointment */}
          <div className="mb-6">
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 cursor-pointer"
              />
              <span className="font-medium">Schedule Next Appointment</span>
            </label>

            {scheduleNext && (
              <div className="pl-8 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Return in weeks</label>
                  <select
                    value={reminderWeeks}
                    onChange={(e) => {
                      const weeks = parseInt(e.target.value)
                      setReminderWeeks(weeks)
                      setNextDate(getDefaultNextDate(weeks))
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  >
                    <option value={4}>4 weeks</option>
                    <option value={6}>6 weeks</option>
                    <option value={8}>8 weeks</option>
                    <option value={12}>12 weeks</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Time</label>
                    <select
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    >
                      <option value="08:00">8:00 AM</option>
                      <option value="08:30">8:30 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="09:30">9:30 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="10:30">10:30 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="16:30">4:30 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS reminder will be sent 1 week before</span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isProcessing ? 'Processing...' : `Complete Payment - ${formatCurrency(totalCents)}`}
          </Button>
        </Card>
      )}

      {/* Step 3: Receipt */}
      {step === 'receipt' && (
        <div className="space-y-4">
          <Card className="print:shadow-none">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Complete!</h2>
              <p className="text-gray-500">Receipt #{receiptNumber}</p>
            </div>

            <div className="border-t border-b py-4 my-4">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">GroomGroove</h3>
                <p className="text-sm text-gray-500">Professional Dog Grooming</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span>{appointment.customer?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dog</span>
                  <span>{appointment.dog?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t space-y-2">
                {services.map((service) => (
                  <div key={service} className="flex justify-between text-sm">
                    <span>{service}</span>
                    <span>{formatCurrency(SERVICE_PRICES[service] || 0)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total Paid</span>
                  <span>{formatCurrency(totalCents)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Payment Method</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
              </div>

              {scheduleNext && nextDate && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Next Appointment</span>
                  </div>
                  <p className="text-sm mt-1">
                    {(safeParseDate(nextDate + 'T12:00:00'))?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) ?? 'Invalid date'} at {formatTime12h(nextTime)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Confirmation SMS will be sent. Reminder 1 week before.
                  </p>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              Thank you for choosing GroomGroove!
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 print:hidden">
            <Button onClick={handlePrint} variant="secondary" className="flex items-center justify-center">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={handleEmailReceipt}
              variant="secondary"
              disabled={!appointment.customer?.email || emailSent}
              className="flex items-center justify-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailSent ? 'Sent!' : appointment.customer?.email ? 'Email Receipt' : 'No Email'}
            </Button>
          </div>

          <Button href="/calendar" className="w-full print:hidden bg-blue-600 hover:bg-blue-700">
            Back to Calendar
          </Button>
        </div>
      )}
    </div>
  )
}
