'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Calendar, Clock, User, Dog, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createAppointment } from '@/lib/actions/appointments'

interface Customer {
  id: string
  name: string
}

interface DogOption {
  id: string
  name: string
  breed: string | null
  customer_id: string
}

interface NewAppointmentFormProps {
  customers: Customer[]
  dogs: DogOption[]
}

export function NewAppointmentForm({ customers, dogs }: NewAppointmentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledDate = searchParams.get('date') || ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointmentDate, setAppointmentDate] = useState(prefilledDate)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  // Filter dogs by selected customer
  const filteredDogs = useMemo(() => {
    if (!selectedCustomerId) return dogs
    return dogs.filter(dog => dog.customer_id === selectedCustomerId)
  }, [selectedCustomerId, dogs])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const customerId = formData.get('customer') as string
    const dogId = formData.get('dog') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const notes = formData.get('notes') as string

    if (!date || !time) {
      setError('Please select both date and time')
      setIsSubmitting(false)
      return
    }

    // Collect selected services
    const services: string[] = []
    formData.getAll('services').forEach((service) => {
      services.push(service as string)
    })

    if (services.length === 0) {
      setError('Please select at least one service')
      setIsSubmitting(false)
      return
    }

    // Combine date and time into ISO datetime
    const dateTimeString = `${date}T${time}:00`
    const parsedDate = new Date(dateTimeString)

    if (isNaN(parsedDate.getTime())) {
      setError('Invalid date or time value')
      setIsSubmitting(false)
      return
    }

    const scheduledAt = parsedDate.toISOString()

    const result = await createAppointment({
      customerId,
      dogId,
      scheduledAt,
      services,
      notes: notes || undefined
    })

    if (result.success) {
      router.push(`/calendar${appointmentDate ? `?date=${appointmentDate}` : ''}`)
    } else {
      setError(result.error || 'Failed to create appointment')
      setIsSubmitting(false)
    }
  }

  const hasNoData = customers.length === 0

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/calendar">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Appointment</h1>
        <p className="text-gray-500">Schedule a new grooming appointment</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {hasNoData ? (
        <Card className="p-8 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No humans yet</h3>
          <p className="text-gray-500 mb-4">Add a human before scheduling appointments.</p>
          <Button href="/clients/new">Add New Human</Button>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Human
                </label>
                <select
                  name="customer"
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                >
                  <option value="">Select human...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Dog className="w-4 h-4 inline mr-1" />
                  Dog
                </label>
                <select
                  name="dog"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                >
                  <option value="">Select dog...</option>
                  {filteredDogs.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name}{dog.breed ? ` (${dog.breed})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCustomerId && filteredDogs.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">No dogs for this human. Add one first.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <select
                  name="time"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                >
                  <option value="">Select time...</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
              <div className="grid grid-cols-2 gap-2">
                {['Full Groom', 'Bath & Brush', 'Nail Trim', 'De-shedding', 'Teeth Cleaning', 'Ear Cleaning'].map((service) => (
                  <label key={service} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" name="services" value={service} className="rounded text-rose-600" />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Any special instructions or notes..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Appointment'}
              </Button>
              <Link href="/calendar">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
