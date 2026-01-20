'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Dog as DogIcon, Clock, ArrowLeft, Plus } from 'lucide-react'
import { searchDogs, createBooking } from '@/lib/actions/booking'
import NewDogForm from './NewDogForm'

interface Dog {
  id: string
  name: string
  breed: string | null
  customer: {
    id: string
    name: string
    phone: string | null
  } | null
}

interface QuickBookModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  onSuccess: () => void
}

type Step = 'search' | 'new-dog' | 'select-service'

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

export default function QuickBookModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}: QuickBookModalProps) {
  const [step, setStep] = useState<Step>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Dog[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [selectedService, setSelectedService] = useState('Full Groom')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('search')
      setSearchQuery('')
      setSearchResults([])
      setSelectedDog(null)
      setSelectedService('Full Groom')
      setSelectedTime('09:00')
      setError(null)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchDogs(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDogSelect = (dog: Dog) => {
    setSelectedDog(dog)
    setStep('select-service')
    setError(null)
  }

  const handleAddNewDog = () => {
    setStep('new-dog')
    setError(null)
  }

  const handleNewDogCreated = (dogId: string, customerId: string, dogName: string) => {
    // After creating dog, go to service selection
    setSelectedDog({
      id: dogId,
      name: dogName,
      breed: null,
      customer: { id: customerId, name: '', phone: null },
    })
    setStep('select-service')
  }

  const handleBookAppointment = async () => {
    if (!selectedDog || !selectedDog.customer) {
      setError('No dog selected')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const scheduledAt = `${selectedDate}T${selectedTime}:00`

    const result = await createBooking({
      dogId: selectedDog.id,
      customerId: selectedDog.customer.id,
      scheduledAt,
      services: [selectedService],
    })

    if (result.success) {
      onSuccess()
      onClose()
    } else {
      setError(result.error || 'Failed to book appointment')
    }

    setIsSubmitting(false)
  }

  const handleBack = () => {
    if (step === 'select-service') {
      setSelectedDog(null)
      setStep('search')
    } else if (step === 'new-dog') {
      setStep('search')
    }
    setError(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Appointment" size="md">
      <div className="p-6">
        {/* Date display */}
        <div className="mb-6 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">Booking for</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(selectedDate)}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Search for dog */}
        {step === 'search' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Dog
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type dog name..."
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Search results */}
            {searchQuery.length >= 2 && (
              <div className="space-y-2">
                {isSearching ? (
                  <p className="text-sm text-gray-500 py-4 text-center">Searching...</p>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map((dog) => (
                      <button
                        key={dog.id}
                        onClick={() => handleDogSelect(dog)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-rose-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <DogIcon className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{dog.name}</p>
                            <p className="text-sm text-gray-500">
                              {dog.breed || 'Unknown breed'}
                              {dog.customer && ` • ${dog.customer.name}`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-gray-500 mb-4">No dogs found matching "{searchQuery}"</p>
                    <Button onClick={handleAddNewDog} className="bg-rose-600 hover:bg-rose-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Dog
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Add new dog prompt when no search */}
            {searchQuery.length < 2 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  Or add a new dog to the system
                </p>
                <Button onClick={handleAddNewDog} variant="secondary" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Dog
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: New dog form */}
        {step === 'new-dog' && (
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to search
            </button>
            <NewDogForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedService={selectedService}
              onSuccess={(dogId, customerId, dogName) => handleNewDogCreated(dogId, customerId, dogName)}
              onCancel={handleBack}
              bookImmediately={true}
              onBookingComplete={() => {
                onSuccess()
                onClose()
              }}
            />
          </div>
        )}

        {/* Step 3: Select service and time */}
        {step === 'select-service' && selectedDog && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to search
            </button>

            {/* Selected dog */}
            <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <DogIcon className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedDog.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedDog.breed || 'Unknown breed'}
                    {selectedDog.customer?.name && ` • ${selectedDog.customer.name}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Time selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Service selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map((service) => (
                  <button
                    key={service}
                    onClick={() => setSelectedService(service)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      selectedService === service
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleBookAppointment}
                disabled={isSubmitting}
                className="flex-1 bg-rose-600 hover:bg-rose-700"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
