'use client'

import { useState, useMemo } from 'react'
import TodayAppointments from '@/components/dashboard/TodayAppointments'
import { TodayAtAGlance } from '@/components/dashboard/TodayAtAGlance'
import { TodaysWatchlist } from '@/components/dashboard/TodaysWatchlist'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { getTodayDashboardData } from '@/lib/actions/dashboard'
import { use } from 'react'

// Get browser timezone offset in minutes
const getTimezoneOffset = () => {
  if (typeof window === 'undefined') return undefined
  return new Date().getTimezoneOffset()
}

// Wrap the async call in a promise that can be used with React.use
const dashboardDataPromise = getTodayDashboardData(getTimezoneOffset())

export default function DashboardPage() {
  const dashboardData = use(dashboardDataPromise)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Transform appointments for TodayAppointments component with filtering
  const appointmentsForDisplay = useMemo(() => {
    let filteredAppointments = dashboardData.appointments.filter(a => a.status !== 'cancelled')
    
    // Apply filters based on activeFilter
    if (activeFilter === 'special-handling') {
      filteredAppointments = filteredAppointments.filter(a => {
        const prefs = a.dog?.grooming_preferences
        return prefs?.behavior_notes && (
          prefs.behavior_notes.toLowerCase().includes('anxious') ||
          prefs.behavior_notes.toLowerCase().includes('nervous') ||
          prefs.behavior_notes.toLowerCase().includes('nail') ||
          prefs.behavior_notes.toLowerCase().includes('paw') ||
          prefs.behavior_notes.toLowerCase().includes('shed')
        )
      })
    } else if (activeFilter === 'appointments-remaining') {
      filteredAppointments = filteredAppointments.filter(a => a.status !== 'completed')
    } else if (activeFilter === 'first-time-dogs') {
      filteredAppointments = filteredAppointments.filter(a => a.is_first_visit)
    }
    // "last-appointment" filter not needed - it's informational only

    return filteredAppointments.map(a => ({
      id: a.id,
      time: formatTime(a.scheduled_at),
      dogName: a.dog?.name || 'Unknown',
      breed: a.dog?.breed || 'Unknown breed',
      ownerName: a.customer?.name || 'Unknown',
      service: a.services?.join(', ') || 'Grooming',
      status: mapStatus(a.status),
      flags: getFlags(a),
      dogId: a.dogId
    }))
  }, [dashboardData.appointments, activeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        {activeFilter && (
          <div className="mt-2 text-sm text-blue-600">
            Filtering by: <span className="font-medium">{activeFilter.replace('-', ' ')}</span>
            <button 
              onClick={() => setActiveFilter(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ✕ Clear filter
            </button>
          </div>
        )}
      </div>

      {/* MAIN LAYOUT - iPad-first 2-column grid (768px+) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT COLUMN (8 cols) - Main Operations */}
        <div className="md:col-span-8 space-y-6">
          {/* 1. At a Glance (High Impact) */}
          <TodayAtAGlance 
            data={dashboardData.glance} 
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* 2. Today's Schedule */}
          <TodayAppointments appointments={appointmentsForDisplay} />
        </div>

        {/* RIGHT COLUMN (4 cols) - Alerts & Quick Actions */}
        <div className="md:col-span-4 space-y-6">
          {/* 1. Watchlist (Critical Alerts) */}
          <TodaysWatchlist items={dashboardData.watchlist} />

          {/* 2. Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function mapStatus(status: string): 'confirmed' | 'in-progress' | 'pending' {
  switch (status) {
    case 'confirmed':
      return 'confirmed'
    case 'in_progress':
    case 'in-progress':
      return 'in-progress'
    default:
      return 'pending'
  }
}

function getFlags(appointment: {
  is_first_visit: boolean
  dog: { grooming_preferences: { behavior_notes?: string; special_instructions?: string } | null } | null
}): string[] {
  const flags: string[] = []

  if (appointment.is_first_visit) {
    flags.push('first-visit')
  }

  const prefs = appointment.dog?.grooming_preferences
  if (prefs?.behavior_notes) {
    const notes = prefs.behavior_notes.toLowerCase()
    if (notes.includes('anxious') || notes.includes('nervous')) {
      flags.push('anxious')
    }
    if (notes.includes('nail') || notes.includes('paw')) {
      flags.push('nail-sensitive')
    }
    if (notes.includes('shed')) {
      flags.push('heavy-shedder')
    }
  }

  return flags
}
