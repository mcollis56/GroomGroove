'use client'

import { Dog } from '@/app/types'

export default function DogDetail({ dog, onClose }: { dog: Dog; onClose: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">🐕</span>
          {dog.dog_name}
        </h2>
        <button
          onClick={onClose}
          className="px-5 py-3 text-sm font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 min-h-[44px] transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>👤</span>
            Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Name</label>
              <p className="text-gray-900 font-medium mt-1">{dog.owner_name}</p>
            </div>
            {dog.owner_phone && (
              <div>
                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Phone</label>
                <p className="text-gray-900 font-medium mt-1">📞 {dog.owner_phone}</p>
              </div>
            )}
            {dog.owner_email && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Email</label>
                <p className="text-gray-900 font-medium mt-1">✉️ {dog.owner_email}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🐾</span>
            Pup Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Name</label>
              <p className="text-gray-900 font-medium mt-1">{dog.dog_name}</p>
            </div>
            {dog.breed && (
              <div>
                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Breed</label>
                <p className="text-gray-900 font-medium mt-1 italic">{dog.breed}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>✂️</span>
            Grooming Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dog.clipper_blade_size && (
              <div>
                <label className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Clipper Blade Size</label>
                <p className="text-gray-900 text-2xl font-bold mt-1 text-pink-600">{dog.clipper_blade_size}</p>
              </div>
            )}
            {dog.nail_clipper_size && (
              <div>
                <label className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Nail Clipper Size</label>
                <p className="text-gray-900 font-medium mt-1">{dog.nail_clipper_size}</p>
              </div>
            )}
          </div>
        </div>

        {dog.grooming_notes && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-100">
            <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-2 mb-2">
              <span>📝</span>
              Grooming Notes
            </label>
            <p className="text-gray-900 mt-2 whitespace-pre-wrap leading-relaxed">{dog.grooming_notes}</p>
          </div>
        )}

        {dog.behavioral_notes && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <label className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-2 mb-2">
              <span>💚</span>
              Behavioral Notes
            </label>
            <p className="text-gray-900 mt-2 whitespace-pre-wrap leading-relaxed">{dog.behavioral_notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-400 text-center pt-4">
          Added: {new Date(dog.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
