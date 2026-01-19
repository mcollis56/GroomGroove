'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { setGroomerOnDuty, type Groomer } from '@/lib/actions/groomers'
import { useRouter } from 'next/navigation'

interface GroomersOnDeckProps {
  onDutyGroomers: Groomer[]
  offDutyGroomers: Groomer[]
}

// Generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function GroomersOnDeck({ onDutyGroomers, offDutyGroomers }: GroomersOnDeckProps) {
  const router = useRouter()
  const [onDuty, setOnDuty] = useState<Groomer[]>(onDutyGroomers)
  const [offDuty, setOffDuty] = useState<Groomer[]>(offDutyGroomers)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleClockIn = async (groomerId: string) => {
    setIsUpdating(groomerId)
    const result = await setGroomerOnDuty(groomerId, true)

    if (result.success) {
      // Move groomer from off duty to on duty in local state
      const groomer = offDuty.find(g => g.id === groomerId)
      if (groomer) {
        setOffDuty(prev => prev.filter(g => g.id !== groomerId))
        setOnDuty(prev => [...prev, { ...groomer, on_duty: true }].sort((a, b) => a.name.localeCompare(b.name)))
      }
      router.refresh()
    }
    setIsUpdating(null)
  }

  const handleClockOut = async (groomerId: string) => {
    setIsUpdating(groomerId)
    const result = await setGroomerOnDuty(groomerId, false)

    if (result.success) {
      // Move groomer from on duty to off duty in local state
      const groomer = onDuty.find(g => g.id === groomerId)
      if (groomer) {
        setOnDuty(prev => prev.filter(g => g.id !== groomerId))
        setOffDuty(prev => [...prev, { ...groomer, on_duty: false }].sort((a, b) => a.name.localeCompare(b.name)))
      }
      router.refresh()
    }
    setIsUpdating(null)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Groomers On Deck</h2>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          {onDuty.length} Active
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: On Duty Groomers */}
        <div className="flex-1">
          {onDuty.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p>No groomers clocked in</p>
              <p className="text-sm">Use the dropdown to add someone</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {onDuty.map((groomer) => (
                <div
                  key={groomer.id}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full pl-1 pr-2 py-1"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: groomer.color || '#3B82F6' }}
                  >
                    {getInitials(groomer.name)}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">{groomer.name}</span>
                  <button
                    onClick={() => handleClockOut(groomer.id)}
                    disabled={isUpdating === groomer.id}
                    className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title={`Clock out ${groomer.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Clock In Dropdown */}
        <div className="lg:w-64">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Clock In Groomer
          </label>
          {offDuty.length === 0 ? (
            <div className="text-sm text-gray-400 italic">
              All groomers are on duty
            </div>
          ) : (
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleClockIn(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>
                  Select groomer...
                </option>
                {offDuty.map((groomer) => (
                  <option key={groomer.id} value={groomer.id}>
                    {groomer.name} ({groomer.role})
                  </option>
                ))}
              </select>
              <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
