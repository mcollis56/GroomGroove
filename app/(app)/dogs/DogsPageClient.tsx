'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Dog } from 'lucide-react'
import { DogDetailModal } from '@/components/DogDetailModal'
import type { GroomingPreferences } from '@/lib/actions/dogs'

interface DogWithOwner {
  id: string
  name: string
  breed: string | null
  weight: number | null
  notes: string | null
  created_at: string
  grooming_preferences: GroomingPreferences
  customer: { id: string; name: string; phone: string | null } | null
  appointment_count: number
  last_visit: string | null
}

interface DogsPageClientProps {
  dogs: DogWithOwner[]
}

function formatDate(isoString: string | null): string {
  if (!isoString) return 'No visits yet'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Client component for the Dogs page that handles modal state.
 * The parent server component fetches data, this component handles interactivity.
 */
export function DogsPageClient({ dogs }: DogsPageClientProps) {
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleDogClick(dogId: string) {
    setSelectedDogId(dogId)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    // Delay clearing the ID to allow close animation
    setTimeout(() => setSelectedDogId(null), 200)
  }

  const totalDogs = dogs.length
  const activeClients = dogs.filter(d => d.appointment_count > 0).length
  const newThisMonth = dogs.filter(d => {
    const created = new Date(d.created_at)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dogs & Clients</h1>
            <p className="text-gray-500">All registered dogs and their owners</p>
          </div>
          <Button href="/dogs/new" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Dog
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Total Dogs</p>
            <p className="text-2xl font-bold text-gray-900">{totalDogs}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Active Clients</p>
            <p className="text-2xl font-bold text-blue-600">{activeClients}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">New This Month</p>
            <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
          </Card>
        </div>

        {dogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <button
                key={dog.id}
                onClick={() => handleDogClick(dog.id)}
                className="text-left w-full"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Dog className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{dog.name}</h3>
                        {dog.appointment_count > 0 && (
                          <Badge variant="info">{dog.appointment_count} visits</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{dog.breed || 'Unknown breed'}</p>
                      {dog.weight && (
                        <p className="text-xs text-gray-400">{dog.weight} lbs</p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600 font-medium">
                          {dog.customer?.name || 'No owner'}
                        </p>
                        {dog.customer?.phone && (
                          <p className="text-xs text-gray-400">{dog.customer.phone}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Last visit: {formatDate(dog.last_visit)}
                      </p>
                      {/* Show indicator if dog has preferences set */}
                      {(dog.grooming_preferences?.behavior_notes || dog.grooming_preferences?.special_instructions) && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Has grooming notes
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <Dog className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No dogs registered yet</p>
              <p className="text-sm mt-1">Add your first furry client to get started</p>
              <Button href="/dogs/new" className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Dog Detail Modal */}
      <DogDetailModal
        dogId={selectedDogId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
