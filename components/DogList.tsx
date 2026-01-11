'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dog } from '@/app/types'

export default function DogList({ onSelectDog }: { onSelectDog?: (dog: Dog) => void }) {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadDogs()
  }, [])

  const loadDogs = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDogs(data)
    }
    setLoading(false)
  }

  const filteredDogs = dogs.filter(dog =>
    dog.dog_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dog.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dog.breed && dog.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
        <p className="text-center text-gray-500">Loading adorable pups... 🐶</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          My Dogs
        </h2>
        <span className="text-sm font-medium text-rose-600 bg-rose-100 px-3 py-1 rounded-full">{dogs.length} pups</span>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Search by name, owner, or breed..."
          className="w-full rounded-xl border-2 border-pink-200 p-3 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400 min-h-[44px] placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredDogs.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
          <div className="text-5xl mb-3">🐕</div>
          <p className="font-medium">
            {searchTerm ? 'No pups match your search.' : 'No pups yet! Add your first furry friend above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredDogs.map((dog) => (
            <div
              key={dog.id}
              onClick={() => onSelectDog && onSelectDog(dog)}
              className="border-2 border-pink-100 rounded-xl p-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-pink-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <span>🐕</span>
                    {dog.dog_name}
                  </h3>
                  <p className="text-gray-600 font-medium">{dog.owner_name}</p>
                  {dog.breed && <p className="text-sm text-gray-500 italic">{dog.breed}</p>}
                </div>
                <div className="text-right">
                  {dog.clipper_blade_size && (
                    <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      ✂️ {dog.clipper_blade_size}
                    </span>
                  )}
                </div>
              </div>

              {(dog.owner_phone || dog.owner_email) && (
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  {dog.owner_phone && <div className="flex items-center gap-1">📞 {dog.owner_phone}</div>}
                  {dog.owner_email && <div className="flex items-center gap-1">✉️ {dog.owner_email}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
