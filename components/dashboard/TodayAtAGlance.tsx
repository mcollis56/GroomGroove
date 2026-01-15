'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Calendar, AlertTriangle, Sparkles, Clock } from 'lucide-react'
import type { TodayAtAGlance as TodayAtAGlanceData } from '@/lib/actions/dashboard'
import { cn } from '@/lib/utils'

interface TodayAtAGlanceProps {
  data: TodayAtAGlanceData
  activeFilter?: string | null
  onFilterChange?: (filter: string | null) => void
}

export function TodayAtAGlance({ data, activeFilter, onFilterChange }: TodayAtAGlanceProps) {
  // Build items array, filtering out zero-value entries except "Remaining"
  const items = [
    {
      label: 'Appointments Remaining',
      value: data.remainingAppointments,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
      show: true // Always show remaining count
    },
    {
      label: 'Special Handling',
      value: data.specialHandlingCount,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
      show: data.specialHandlingCount > 0
    },
    {
      label: 'First-Time Dogs',
      value: data.firstTimeVisits,
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50',
      show: data.firstTimeVisits > 0
    },
    {
      label: 'Last Appointment',
      value: data.finalAppointmentTime || '—',
      icon: Clock,
      color: 'text-green-600 bg-green-50',
      show: !!data.finalAppointmentTime
    }
  ].filter(item => item.show)

  const handleCardClick = (filterType: string) => {
    if (onFilterChange) {
      // Toggle filter - if already active, clear it
      if (activeFilter === filterType) {
        onFilterChange(null)
      } else {
        onFilterChange(filterType)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📅</span> Today at a Glance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {items.map((item) => {
            const filterType = item.label.toLowerCase().replace(/\s+/g, '-')
            const isActive = activeFilter === filterType
            
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleCardClick(filterType)}
                className={cn(
                  "flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left",
                  "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200",
                  isActive && "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                )}
              >
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{item.value}</p>
                  <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
