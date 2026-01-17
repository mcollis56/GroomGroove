'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Check, Clock, Dog as DogIcon, User, Calendar as CalendarIcon, X } from 'lucide-react'
import CalendarGrid from './CalendarGrid'
import { formatTime as safeFormatTime, safeParseDate } from '@/lib/utils/date'

interface Appointment {
  id: string
  scheduled_at: string
  services: string[]
  notes: string | null
  status: string
  customer: { name: string } | null
  dog: { name: string } | null
}

interface Dog {
  id: string
  name: string
  customer?: { name: string }
}

function formatTime(isoString: string): string {
  return safeFormatTime(isoString)
}

function formatDateForDisplay(dateStr: string): string {
  const date = safeParseDate(dateStr + 'T12:00:00')
  if (!date) return 'Invalid Date'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getDateFromISO(isoString: string): string {
  return isoString.split('T')[0]
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'info' | 'success'> = {
    pending_confirmation: 'default',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'default'
  }
  const labels: Record<string, string> = {
    pending_confirmation: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
}

export default function CalendarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedDate = searchParams.get('date')
  const supabase = createClient()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dogs, setDogs] = useState<Dog[]>([])
  const [datesWithAppointments, setDatesWithAppointments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookingMode, setIsBookingMode] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    time: '09:00',
    dogId: '',
    service: 'Full Groom'
  })

  // Services options
  const serviceOptions = [
    'Full Groom',
    'Bath & Brush',
    'Nail Trim',
    'Ear Cleaning',
    'Teeth Brushing',
    'Deshedding',
    'Puppy Cut'
  ]

  // Time options
  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      // Load appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          services,
          notes,
          status,
          customer:customers(name),
          dog:dogs(name)
        `)
        .order('scheduled_at', { ascending: true })

      if (appointmentsError) {
        console.error('Failed to fetch appointments:', appointmentsError)
      } else {
        const allAppointments: Appointment[] = (appointmentsData || []).map(appt => ({
          ...appt,
          customer: Array.isArray(appt.customer) ? appt.customer[0] : appt.customer,
          dog: Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
        }))
        
        setAppointments(allAppointments)
        
        // Get dates that have appointments (for calendar indicators)
        const dates = [...new Set(allAppointments.map(appt => getDateFromISO(appt.scheduled_at)))]
        setDatesWithAppointments(dates)
      }

      // Load dogs for dropdown
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select(`
          id,
          name,
          customer:customers(name)
        `)
        .order('name', { ascending: true })

      if (dogsError) {
        console.error('Failed to fetch dogs:', dogsError)
      } else {
        const dogsList: Dog[] = (dogsData || []).map(dog => ({
          ...dog,
          customer: Array.isArray(dog.customer) ? dog.customer[0] : dog.customer
        }))
        setDogs(dogsList)
        
        // Set default dog if available
        if (dogsList.length > 0 && !bookingForm.dogId) {
          setBookingForm(prev => ({ ...prev, dogId: dogsList[0].id }))
        }
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? appointments.filter(appt => getDateFromISO(appt.scheduled_at) === selectedDate)
    : []

  // Handle date selection from calendar
  const handleDateSelect = (date: string) => {
    router.push(`/calendar?date=${date}`)
    setIsBookingMode(false) // Exit booking mode when selecting new date
  }

  // Handle quick booking form submission
  const handleQuickBooking = async () => {
    if (!selectedDate || !bookingForm.dogId || !bookingForm.time) {
      alert('Please select a date, dog, and time')
      return
    }

    try {
      const scheduledAt = `${selectedDate}T${bookingForm.time}:00`
      
      const { error } = await supabase
        .from('appointments')
        .insert([{
          scheduled_at: scheduledAt,
          services: [bookingForm.service],
          status: 'confirmed',
          dog_id: bookingForm.dogId
        }])

      if (error) throw error

      // Refresh appointments
      const { data: newAppointments } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          services,
          notes,
          status,
          customer:customers(name),
          dog:dogs(name)
        `)
        .order('scheduled_at', { ascending: true })

      if (newAppointments) {
        const updatedAppointments: Appointment[] = newAppointments.map(appt => ({
          ...appt,
          customer: Array.isArray(appt.customer) ? appt.customer[0] : appt.customer,
          dog: Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
        }))
        setAppointments(updatedAppointments)
        
        // Update dates with appointments
        const dates = [...new Set(updatedAppointments.map(appt => getDateFromISO(appt.scheduled_at)))]
        setDatesWithAppointments(dates)
      }

      // Reset form and exit booking mode
      setBookingForm({
        time: '09:00',
        dogId: dogs.length > 0 ? dogs[0].id : '',
        service: 'Full Groom'
      })
      setIsBookingMode(false)
      
      alert('Appointment booked successfully!')
    } catch (error: any) {
      console.error('Booking error:', error)
      alert('Failed to book appointment: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500">Schedule and manage appointments</p>
        </div>
        <Button href="/calendar/new" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Main Content - Calendar and Day Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Grid - Left Panel */}
        <CalendarGrid
          selectedDate={selectedDate}
          datesWithAppointments={datesWithAppointments}
          onDateSelect={handleDateSelect}
        />

        {/* Day Manager - Right Panel */}
        <Card>
          {selectedDate ? (
            <div className="h-full flex flex-col">
              {/* Day Manager Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDateForDisplay(selectedDate)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {!isBookingMode && (
                  <Button
                    onClick={() => setIsBookingMode(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {isBookingMode ? (
                  // Quick Booking Form
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Quick Booking</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsBookingMode(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Time Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Time
                        </label>
                        <select
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>

                      {/* Dog Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <DogIcon className="w-4 h-4 inline mr-1" />
                          Dog
                        </label>
                        <select
                          value={bookingForm.dogId}
                          onChange={(e) => setBookingForm({...bookingForm, dogId: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select a dog...</option>
                          {dogs.map(dog => (
                            <option key={dog.id} value={dog.id}>
                              {dog.name} {dog.customer?.name ? `(${dog.customer.name})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Service Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service
                        </label>
                        <select
                          value={bookingForm.service}
                          onChange={(e) => setBookingForm({...bookingForm, service: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          {serviceOptions.map(service => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => setIsBookingMode(false)}
                          variant="ghost"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleQuickBooking}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Appointments List
                  <>
                    {selectedDateAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDateAppointments.map((appt) => (
                          <div
                            key={appt.id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    {formatTime(appt.scheduled_at)}
                                  </span>
                                  <StatusBadge status={appt.status} />
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <DogIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{appt.dog?.name || 'Unknown Dog'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500">{appt.customer?.name || 'Unknown Owner'}</span>
                                  </div>
                                  <div className="text-gray-600 mt-2">
                                    {appt.services?.join(', ') || 'No services'}
                                  </div>
                                  {appt.notes && (
                                    <div className="text-gray-500 text-xs mt-2 italic">
                                      {appt.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Checkout button for non-completed appointments */}
                              {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                                <a href={`/checkout/${appt.id}`}>
                                  <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                    <Check className="w-4 h-4" />
                                    Complete
                                  </button>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-lg mb-2">No appointments scheduled</p>
                        <p className="text-sm mb-4">Click &quot;Book Appointment&quot; to add one</p>
                        <Button
                          onClick={() => setIsBookingMode(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-lg mb-2">Select a date</p>
              <p className="text-sm">Click on a day in the calendar to view appointments</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
