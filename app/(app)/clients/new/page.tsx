'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, User, Mail, Dog, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient_action } from '@/lib/actions/clients'

export default function CreateClientPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
  })
  const [dogs, setDogs] = useState([{ name: '', breed: '', weight: '', notes: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDogChange = (index: number, field: string, value: string) => {
    const newDogs = [...dogs]
    newDogs[index] = { ...newDogs[index], [field]: value }
    setDogs(newDogs)
  }

  const addDog = () => {
    setDogs([...dogs, { name: '', breed: '', weight: '', notes: '' }])
  }

  const removeDog = (index: number) => {
    if (dogs.length > 1) {
      setDogs(dogs.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await createClient_action(formData, dogs)

    if (result.success) {
      router.push('/clients')
    } else {
      setError(result.error || 'Failed to create client')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
            <p className="text-gray-500">Add a new pet parent and their dogs</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Surname *
                      </label>
                      <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dogs Section */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Dog className="w-5 h-5" />
                    Dogs ({dogs.length})
                  </h3>
                  <Button type="button" variant="secondary" onClick={addDog}>
                    <Dog className="w-4 h-4 mr-2" />
                    Add Another Dog
                  </Button>
                </div>
                <div className="space-y-6">
                  {dogs.map((dog, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Dog #{index + 1}</h4>
                        {dogs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDog(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dog Name *
                          </label>
                          <input
                            type="text"
                            value={dog.name}
                            onChange={(e) => handleDogChange(index, 'name', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                            placeholder="Buddy"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Breed
                          </label>
                          <input
                            type="text"
                            value={dog.breed}
                            onChange={(e) => handleDogChange(index, 'breed', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                            placeholder="Golden Retriever"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weight (lbs)
                          </label>
                          <input
                            type="number"
                            value={dog.weight}
                            onChange={(e) => handleDogChange(index, 'weight', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                            placeholder="50"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes / Concerns
                        </label>
                        <input
                          type="text"
                          value={dog.notes}
                          onChange={(e) => handleDogChange(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                          placeholder="Anxious, nail sensitive, allergies, etc."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Save Client</h3>
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Client'}
                  </Button>
                  <Link href="/clients" className="block">
                    <Button type="button" variant="secondary" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">After Creating</h3>
                <div className="space-y-3">
                  <Button type="button" variant="secondary" className="w-full justify-start" disabled>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule First Appointment
                  </Button>
                  <Button type="button" variant="secondary" className="w-full justify-start" disabled>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Welcome Message
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Available after client is created</p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
