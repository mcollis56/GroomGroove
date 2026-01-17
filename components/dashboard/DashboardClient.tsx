'use client'

import { useState, useMemo } from 'react'
import TodayAppointments from '@/components/dashboard/TodayAppointments'
import { TodayAtAGlance } from '@/components/dashboard/TodayAtAGlance'
import { TodaysWatchlist } from '@/components/dashboard/TodaysWatchlist'
import { QuickActions } from '@/components/dashboard/QuickActions'
import type { DashboardData } from '@/lib/actions/dashboard'

interface DashboardClientProps {
  initialData: DashboardData
  error: string | null
}

export function DashboardClient({ initialData, error }: DashboardClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const dashboardData = initialData
  const hasConnectionError = !!error

  // Transform appointments for TodayAppointments component with filtering
  const appointmentsForDisplay = useMemo(() => {
    let filteredAppointments = dashboardData.appointments.filter((a) => a.status !== 'cancelled')

    // Apply filters based on activeFilter
    if (activeFilter === 'special-handling') {
      filteredAppointments = filteredAppointments.filter((a) => {
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
      filteredAppointments = filteredAppointments.filter((a) => a.status !== 'completed')
    } else if (activeFilter === 'first-time-dogs') {
      filteredAppointments = filteredAppointments.filter((a) => a.is_first_visit)
    }
    // "last-appointment" filter not needed - it's informational only

    return filteredAppointments.map((a) => ({
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
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>

        {/* Connection Error Banner */}
        {hasConnectionError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Connection Error: Check Vercel Keys</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to connect to the database. Please check your Supabase environment variables in Vercel.</p>
                  <p className="mt-1 text-xs opacity-75">Error: {error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFilter && (
          <div className="mt-2 text-sm text-blue-600">
            Filtering by: <span className="font-medium">{activeFilter.replace('-', ' ')}</span>
            <button
              onClick={() => setActiveFilter(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              Clear filter
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
  try {
    const date = new Date(isoString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time'
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return 'Invalid time'
  }
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
