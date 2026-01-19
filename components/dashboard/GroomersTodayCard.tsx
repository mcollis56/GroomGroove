'use client'

import { useState } from 'react'
import { Smile, Plus, X } from 'lucide-react'
import { setGroomerOnDuty, type Groomer } from '@/lib/actions/groomers'
import { useRouter } from 'next/navigation'

interface GroomersTodayCardProps {
  onDutyGroomers: Groomer[]
  offDutyGroomers: Groomer[]
}

export function GroomersTodayCard({ onDutyGroomers, offDutyGroomers }: GroomersTodayCardProps) {
  const router = useRouter()
  const [onDuty, setOnDuty] = useState<Groomer[]>(onDutyGroomers)
  const [offDuty, setOffDuty] = useState<Groomer[]>(offDutyGroomers)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleClockIn = async (groomerId: string) => {
    setIsUpdating(groomerId)
    setShowDropdown(false)
    const result = await setGroomerOnDuty(groomerId, true)

    if (result.success) {
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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-50 p-2 rounded-full">
            <Smile className="h-5 w-5 text-yellow-600" />
          </div>
          <span className="font-semibold text-gray-700">Groomers Today</span>
        </div>

        {/* Add button with dropdown */}
        {offDuty.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 bg-green-50 hover:bg-green-100 rounded-full text-green-600 transition-colors"
              title="Clock in groomer"
            >
              <Plus className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                {offDuty.map((groomer) => (
                  <button
                    key={groomer.id}
                    onClick={() => handleClockIn(groomer.id)}
                    disabled={isUpdating === groomer.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {groomer.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active groomers list */}
      <div className="min-h-[32px]">
        {onDuty.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No one clocked in</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {onDuty.map((groomer) => (
              <button
                key={groomer.id}
                onClick={() => handleClockOut(groomer.id)}
                disabled={isUpdating === groomer.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-red-50 text-green-700 hover:text-red-600 rounded-full text-xs font-medium transition-colors group disabled:opacity-50"
                title={`Clock out ${groomer.name}`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: groomer.color || '#3B82F6' }}
                />
                {groomer.name.split(' ')[0]}
                <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
