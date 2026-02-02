'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ArrowLeft, Calendar, Clock, User, Dog as DogIcon, Search, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { searchDogs, createDogWithOwner, createBooking } from '@/lib/actions/booking'
import { buildLocalDateTimeISO } from '@/lib/utils/date'

interface DogResult {
  id: string
  name: string
  breed: string | null
  customer: {
    id: string
    name: string
    phone: string | null
  } | null
}

type FlowStep = 'search' | 'create-dog' | 'booking'

const SERVICE_OPTIONS = [
  'Full Groom',
  'Bath and tidy',
  'Bath and dry',
  'Bath/tidy/de-shed',
  'Nail trim',
  'Puppy Groom',
]

const TIME_OPTIONS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
]

export function NewAppointmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledDate = searchParams.get('date') || ''
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Flow state
  const [step, setStep] = useState<FlowStep>('search')
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DogResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Selected dog state (for existing dogs)
  const [selectedDog, setSelectedDog] = useState<DogResult | null>(null)

  // New dog form state
  const [newDogName, setNewDogName] = useState('')
  const [newDogBreed, setNewDogBreed] = useState('')
  const [newDogWeight, setNewDogWeight] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [isCreatingDog, setIsCreatingDog] = useState(false)

  // Booking form state
  const [appointmentDate, setAppointmentDate] = useState(prefilledDate)
  const [appointmentTime, setAppointmentTime] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setIsDropdownOpen(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle selecting an existing dog
  const handleSelectDog = (dog: DogResult) => {
    setSelectedDog(dog)
    setSearchQuery(dog.name)
    setIsDropdownOpen(false)
    setStep('booking')
    setError(null)
  }

  // Handle clicking "Create New Dog"
  const handleCreateNewDog = () => {
    setNewDogName(searchQuery)
    setStep('create-dog')
    setIsDropdownOpen(false)
    setError(null)
  }

  // Handle saving new dog
  const handleSaveNewDog = async () => {
    if (!newDogName.trim()) {
      setError('Dog name is required')
      return
    }
    if (!ownerName.trim()) {
      setError('Owner name is required')
      return
    }

    setIsCreatingDog(true)
    setError(null)

    const result = await createDogWithOwner({
      dog: {
        name: newDogName.trim(),
        breed: newDogBreed.trim() || undefined,
        weight: newDogWeight || undefined,
      },
      owner: {
        name: ownerName.trim(),
        phone: ownerPhone.trim() || undefined,
        email: ownerEmail.trim() || undefined,
      },
    })

    if (result.success && result.dogId && result.customerId) {
      // Set the newly created dog as selected
      setSelectedDog({
        id: result.dogId,
        name: newDogName.trim(),
        breed: newDogBreed.trim() || null,
        customer: {
          id: result.customerId,
          name: ownerName.trim(),
          phone: ownerPhone.trim() || null,
        },
      })
      setStep('booking')
    } else {
      setError(result.error || 'Failed to create dog')
    }

    setIsCreatingDog(false)
  }

  // Handle toggling a service
  const handleToggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!selectedDog || !selectedDog.customer) {
      setError('No dog selected')
      return
    }
    if (!appointmentDate) {
      setError('Please select a date')
      return
    }
    if (!appointmentTime) {
      setError('Please select a time')
      return
    }
    if (selectedServices.length === 0) {
      setError('Please select at least one service')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Build a UTC ISO string from the user's local date/time selection
    const scheduledAt = buildLocalDateTimeISO(appointmentDate, appointmentTime)
    if (!scheduledAt) {
      setError('Invalid date or time')
      setIsSubmitting(false)
      return
    }

    const result = await createBooking({
      dogId: selectedDog.id,
      customerId: selectedDog.customer.id,
      scheduledAt,
      services: selectedServices,
      notes: notes.trim() || undefined,
    })

    if (result.success) {
      router.push(`/calendar${appointmentDate ? `?date=${appointmentDate}` : ''}`)
    } else {
      setError(result.error || 'Failed to create appointment')
      setIsSubmitting(false)
    }
  }

  // Handle going back to search
  const handleBackToSearch = () => {
    setStep('search')
    setSelectedDog(null)
    setSearchQuery('')
    setSearchResults([])
    setNewDogName('')
    setNewDogBreed('')
    setNewDogWeight('')
    setOwnerName('')
    setOwnerPhone('')
    setOwnerEmail('')
    setError(null)
  }

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

      <Card>
        <div className="p-6 space-y-6">
          {/* STEP 1: Dog Search (Always visible at top when in search mode) */}
          {step === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DogIcon className="w-4 h-4 inline mr-1" />
                  Search for Dog
                </label>
                <div className="relative" ref={dropdownRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => searchQuery.length >= 2 && setIsDropdownOpen(true)}
                    placeholder="Type dog name to search..."
                    className="pl-10 text-lg py-3"
                    autoFocus
                  />

                  {/* Dropdown */}
                  {isDropdownOpen && searchQuery.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">Searching...</div>
                      ) : (
                        <>
                          {searchResults.map((dog) => (
                            <button
                              key={dog.id}
                              type="button"
                              onClick={() => handleSelectDog(dog)}
                              className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <DogIcon className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {dog.name}
                                    {dog.breed && (
                                      <span className="text-gray-500 font-normal"> ({dog.breed})</span>
                                    )}
                                  </p>
                                  {dog.customer && (
                                    <p className="text-sm text-gray-500">Owner: {dog.customer.name}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}

                          {/* Create New Dog Option */}
                          <button
                            type="button"
                            onClick={handleCreateNewDog}
                            className="w-full p-4 text-left hover:bg-rose-50 bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Plus className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-green-700">
                                  Create New Dog: "{searchQuery}"
                                </p>
                                <p className="text-sm text-gray-500">Add a new dog to the system</p>
                              </div>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Start typing a dog's name to search, or create a new dog
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Create New Dog Form */}
          {step === 'create-dog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Create New Dog
                </h3>
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to search
                </button>
              </div>

              {/* Dog Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DogIcon className="w-4 h-4 text-rose-600" />
                  Dog Details
                </div>

                <div>
                  <label htmlFor="create-dog-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Dog Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="create-dog-name"
                    name="create-dog-name"
                    autoComplete="off"
                    value={newDogName}
                    onChange={(e) => setNewDogName(e.target.value)}
                    placeholder="e.g. Max"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="create-dog-breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                    <Input
                      id="create-dog-breed"
                      name="create-dog-breed"
                      autoComplete="off"
                      value={newDogBreed}
                      onChange={(e) => setNewDogBreed(e.target.value)}
                      placeholder="e.g. Golden Retriever"
                    />
                  </div>
                  <div>
                    <label htmlFor="create-dog-weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <Input
                      id="create-dog-weight"
                      name="create-dog-weight"
                      type="number"
                      autoComplete="off"
                      value={newDogWeight}
                      onChange={(e) => setNewDogWeight(e.target.value)}
                      placeholder="e.g. 25"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Owner Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-600" />
                  Owner Details
                </div>

                <div>
                  <label htmlFor="create-owner-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="create-owner-name"
                    name="create-owner-name"
                    autoComplete="off"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. John Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="create-owner-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      id="create-owner-phone"
                      name="create-owner-phone"
                      type="tel"
                      autoComplete="off"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="e.g. 0400 000 000"
                    />
                  </div>
                  <div>
                    <label htmlFor="create-owner-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      id="create-owner-email"
                      name="create-owner-email"
                      type="email"
                      autoComplete="off"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="e.g. john@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackToSearch}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveNewDog}
                  disabled={isCreatingDog}
                  className="flex-1"
                >
                  {isCreatingDog ? 'Saving...' : 'Next: Book Appointment'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Booking Form (for existing or newly created dog) */}
          {step === 'booking' && selectedDog && (
            <div className="space-y-6">
              {/* Selected Dog Display */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Booking for</h3>
                  <button
                    type="button"
                    onClick={handleBackToSearch}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Change dog
                  </button>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                      <DogIcon className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {selectedDog.name}
                        {selectedDog.breed && (
                          <span className="text-gray-500 font-normal text-base">
                            {' '}
                            ({selectedDog.breed})
                          </span>
                        )}
                      </p>
                      {selectedDog.customer && (
                        <p className="text-gray-600">
                          <User className="w-4 h-4 inline mr-1" />
                          Owner: {selectedDog.customer.name}
                          {selectedDog.customer.phone && ` • ${selectedDog.customer.phone}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
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
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                  >
                    <option value="">Select time...</option>
                    {TIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_OPTIONS.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleToggleService(service)}
                      className={`p-3 text-sm rounded-lg border text-left transition-colors ${
                        selectedServices.includes(service)
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes..."
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Link href="/calendar" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="button"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Appointment'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
