'use client'

import { useState } from 'react'
import AddDogForm from './AddDogForm'
import DogList from './DogList'
import DogDetail from './DogDetail'
import { Dog } from '@/app/types'

export default function DashboardView() {
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleDogAdded = () => {
    setRefreshKey(prev => prev + 1)
    setShowAddForm(false)
  }

  const handleSelectDog = (dog: Dog) => {
    setSelectedDog(dog)
  }

  const handleCloseDogDetail = () => {
    setSelectedDog(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div>
        {!showAddForm ? (
          <div>
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 min-h-[52px] transition-all duration-200 transform hover:scale-[1.02]"
            >
              <span className="text-2xl">🐕</span>
              Add New Pup
            </button>
            <DogList key={refreshKey} onSelectDog={handleSelectDog} />
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowAddForm(false)}
              className="mb-4 px-5 py-3 text-sm font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 min-h-[44px] transition-colors"
            >
              ← Back to Dogs
            </button>
            <AddDogForm onDogAdded={handleDogAdded} />
          </div>
        )}
      </div>

      {/* Right Column */}
      <div>
        {selectedDog ? (
          <DogDetail dog={selectedDog} onClose={handleCloseDogDetail} />
        ) : (
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-lg p-8 text-center border-2 border-pink-100">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-2xl font-semibold text-gray-800 mb-3">Welcome to GroomGroove!</p>
            <p className="text-gray-600 leading-relaxed">Select a furry friend from the list to view their grooming details, or add a new pup to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
