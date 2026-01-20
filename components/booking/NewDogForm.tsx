'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dog as DogIcon, User, Clock } from 'lucide-react'
import { createDogWithOwner, createDogWithOwnerAndBook } from '@/lib/actions/booking'

interface NewDogFormProps {
  // For booking flow
  selectedDate?: string
  selectedTime?: string
  selectedService?: string
  bookImmediately?: boolean
  onBookingComplete?: () => void
  // For standalone use
  onSuccess: (dogId: string, customerId: string, dogName: string) => void
  onCancel: () => void
}

const SERVICE_OPTIONS = [
  'Full Groom',
  'Bath and tidy',
  'Bath and dry',
  'Bath/tidy/de-shed',
  'Nail trim',
  'Puppy Groom',
]

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
]

export default function NewDogForm({
  selectedDate,
  selectedTime: initialTime = '09:00',
  selectedService: initialService = 'Full Groom',
  bookImmediately = false,
  onBookingComplete,
  onSuccess,
  onCancel,
}: NewDogFormProps) {
  // Dog fields
  const [dogName, setDogName] = useState('')
  const [breed, setBreed] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')

  // Owner fields
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')

  // Booking fields (only used if bookImmediately is true)
  const [selectedService, setSelectedService] = useState(initialService)
  const [selectedTime, setSelectedTime] = useState(initialTime)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!dogName.trim()) {
      setError('Dog name is required')
      return
    }
    if (!ownerName.trim()) {
      setError('Owner name is required')
      return
    }

    setIsSubmitting(true)

    if (bookImmediately && selectedDate) {
      // Create dog with owner AND book appointment
      const scheduledAt = `${selectedDate}T${selectedTime}:00`

      const result = await createDogWithOwnerAndBook({
        dog: {
          name: dogName.trim(),
          breed: breed.trim() || undefined,
          weight: weight || undefined,
          notes: notes.trim() || undefined,
        },
        owner: {
          name: ownerName.trim(),
          phone: ownerPhone.trim() || undefined,
          email: ownerEmail.trim() || undefined,
        },
        appointment: {
          scheduledAt,
          services: [selectedService],
        },
      })

      if (result.success && result.dogId) {
        onBookingComplete?.()
      } else {
        setError(result.error || 'Failed to create dog and booking')
      }
    } else {
      // Just create dog with owner
      const result = await createDogWithOwner({
        dog: {
          name: dogName.trim(),
          breed: breed.trim() || undefined,
          weight: weight || undefined,
          notes: notes.trim() || undefined,
        },
        owner: {
          name: ownerName.trim(),
          phone: ownerPhone.trim() || undefined,
          email: ownerEmail.trim() || undefined,
        },
      })

      if (result.success && result.dogId && result.customerId) {
        onSuccess(result.dogId, result.customerId, dogName.trim())
      } else {
        setError(result.error || 'Failed to create dog')
      }
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Dog Details - Top Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <DogIcon className="w-5 h-5 text-blue-600" />
          Dog Details
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dog Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              placeholder="e.g. Luna"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <Input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Golden Retriever"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the dog..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Owner Details - Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          Owner Details
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="e.g. 0400 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="e.g. sarah@email.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details - Only shown if booking immediately */}
      {bookImmediately && selectedDate && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Appointment
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SERVICE_OPTIONS.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting
            ? 'Saving...'
            : bookImmediately
            ? 'Save & Book'
            : 'Save Dog'}
        </Button>
      </div>
    </form>
  )
}
