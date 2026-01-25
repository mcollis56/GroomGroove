'use client'

import { useState, useMemo } from 'react'
import TodayAppointments from '@/components/dashboard/TodayAppointments'
import { TodayAtAGlance } from '@/components/dashboard/TodayAtAGlance'
import { TodaysWatchlist } from '@/components/dashboard/TodaysWatchlist'
import { QuickActions } from '@/components/dashboard/QuickActions'
import type { DashboardData } from '@/lib/actions/dashboard'

interface DashboardClientProps {
  initialData: DashboardData
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Transform appointments for TodayAppointments component with filtering
  const appointmentsForDisplay = useMemo(() => {
    let filteredAppointments = initialData.appointments.filter(a => a.status !== 'cancelled')

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

    return filteredAppointments.map(a => ({
      id: a.id,
      scheduled_at: a.scheduled_at,
      status: a.status,
      dog: a.dog,
      customer: a.customer
    }))
  }, [initialData.appointments, activeFilter])

  // Handle missing data gracefully
  if (!initialData.glance) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        <TodayAppointments appointments={appointmentsForDisplay} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
        {activeFilter && (
          <div className="mt-2 text-sm text-blue-600">
            Filtering by: <span className="font-medium">{activeFilter.replace(/-/g, ' ')}</span>
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
            data={initialData.glance}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* 2. Today's Schedule */}
          <TodayAppointments appointments={appointmentsForDisplay} />
        </div>

        {/* RIGHT COLUMN (4 cols) - Alerts & Quick Actions */}
        <div className="md:col-span-4 space-y-6">
          {/* 1. Watchlist (Critical Alerts) */}
          <TodaysWatchlist items={initialData.watchlist} />

          {/* 2. Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
