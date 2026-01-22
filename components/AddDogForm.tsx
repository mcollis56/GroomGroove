'use client'

import { useState } from 'react'
import { createDog } from '@/lib/actions/dogs'
// We import the Dog type we just made
import { Dog } from '@/app/types' 
import { BLADE_SIZES } from '@/lib/constants/grooming'

export default function AddDogForm({ onDogAdded }: { onDogAdded?: (dog: Dog) => void }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    dog_name: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    breed: '',
    clipper_blade_size: '',
    comb_attachment: '',
    nail_clipper_size: '',
    grooming_notes: '',
    behavioral_notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Call the createDog server action
    const result = await createDog({
      dog_name: formData.dog_name,
      owner_name: formData.owner_name,
      owner_phone: formData.owner_phone,
      owner_email: formData.owner_email,
      breed: formData.breed,
      clipper_blade_size: formData.clipper_blade_size,
      comb_attachment: formData.comb_attachment,
      nail_clipper_size: formData.nail_clipper_size,
      grooming_notes: formData.grooming_notes,
      behavioral_notes: formData.behavioral_notes,
    })

    if (!result.success) {
      console.error('Error adding dog:', result.error)
      setMessage(`Error: ${result.error || 'Failed to add dog'}`)
    } else {
      setMessage('Success! Dog added.')
      // Clear the form
      setFormData({
        dog_name: '',
        owner_name: '',
        owner_phone: '',
        owner_email: '',
        breed: '',
        clipper_blade_size: '',
        comb_attachment: '',
        nail_clipper_size: '',
        grooming_notes: '',
        behavioral_notes: '',
      })
      // Notify parent component if needed
      if (onDogAdded && result.data) onDogAdded(result.data)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-pink-100 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span className="text-2xl">🐕</span>
        Add New Pup
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Dog Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
            value={formData.dog_name}
            onChange={(e) => setFormData({ ...formData, dog_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Owner Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
            value={formData.owner_name}
            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
              value={formData.owner_phone}
              onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
              value={formData.owner_email}
              onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Breed</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Blade Size</label>
            <select
              className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
              value={formData.clipper_blade_size}
              onChange={(e) => setFormData({ ...formData, clipper_blade_size: e.target.value })}
            >
              <option value="">Select blade size</option>
              {BLADE_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comb Attachment</label>
            <select
              className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
              value={formData.comb_attachment}
              onChange={(e) => setFormData({ ...formData, comb_attachment: e.target.value })}
            >
              <option value="">Select comb attachment</option>
              <option value="3mm">3mm</option>
              <option value="6mm">6mm</option>
              <option value="10mm">10mm</option>
              <option value="13mm">13mm</option>
              <option value="16mm">16mm</option>
              <option value="19mm">19mm</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nail Clipper Size</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px]"
              value={formData.nail_clipper_size}
              onChange={(e) => setFormData({ ...formData, nail_clipper_size: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Grooming Notes</label>
          <textarea
            className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
            rows={3}
            placeholder="Coat preferences, style notes, etc."
            value={formData.grooming_notes}
            onChange={(e) => setFormData({ ...formData, grooming_notes: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Behavioral Notes</label>
          <textarea
            className="mt-1 block w-full rounded-lg border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
            rows={3}
            placeholder="Temperament, handling requirements, etc."
            value={formData.behavioral_notes}
            onChange={(e) => setFormData({ ...formData, behavioral_notes: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 min-h-[52px] transition-all duration-200"
        >
          {loading ? '💫 Saving...' : '✨ Add Pup'}
        </button>

        {message && (
          <p className={`text-sm text-center ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
