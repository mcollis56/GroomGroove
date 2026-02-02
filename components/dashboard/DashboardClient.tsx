'use client'
import { isSydneyToday } from '@/lib/utils/date';

import { useState, useMemo } from 'react'
import TodayAppointments from '@/components/dashboard/TodayAppointments'
import { TodayAtAGlance } from '@/components/dashboard/TodayAtAGlance'
import { TodaysWatchlist } from '@/components/dashboard/TodaysWatchlist'
import { QuickActions } from '@/components/dashboard/QuickActions'
import type { DashboardData } from '@/lib/actions/dashboard'
import { formatTime } from '@/lib/utils/date' // <--- IMPORT THE FIX

interface DashboardClientProps {
  initialData: DashboardData
  error: string | null
}

export function DashboardClient({ initialData, error }: DashboardClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const dashboardData = initialData
  const hasConnectionError = !!error

  const appointmentsForDisplay = useMemo(() => {
    let filteredAppointments = dashboardData.appointments.filter((a) => a.status !== 'cancelled')

    // Apply filters
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

    // Use the imported safe formatTime here
    return filteredAppointments.map((a) => ({
      id: a.id,
      time: formatTime(a.scheduled_at), // <--- Uses safe utility
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

        {hasConnectionError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
             <div className="flex items-center">
               <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
               <p className="ml-2 text-sm text-red-700">{error}</p>
             </div>
          </div>
        )}

        {activeFilter && (
          <div className="mt-2 text-sm text-blue-600">
            Filtering by: <span className="font-medium">{activeFilter.replace('-', ' ')}</span>
            <button onClick={() => setActiveFilter(null)} className="ml-2 text-gray-500 hover:text-gray-700">Clear</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <TodayAtAGlance data={dashboardData.glance} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <TodayAppointments appointments={appointmentsForDisplay} />
        </div>
        <div className="md:col-span-4 space-y-6">
          <TodaysWatchlist items={dashboardData.watchlist} />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

// REMOVED: The buggy local formatTime function

function mapStatus(status: string): 'confirmed' | 'in-progress' | 'pending' {
  switch (status) {
    case 'confirmed': return 'confirmed'
    case 'in_progress': case 'in-progress': return 'in-progress'
    default: return 'pending'
  }
}

function getFlags(appointment: any): string[] {
  const flags: string[] = []
  if (appointment.is_first_visit) flags.push('first-visit')
  const prefs = appointment.dog?.grooming_preferences
  if (prefs?.behavior_notes) {
    const notes = prefs.behavior_notes.toLowerCase()
    if (notes.includes('anxious') || notes.includes('nervous')) flags.push('anxious')
    if (notes.includes('nail') || notes.includes('paw')) flags.push('nail-sensitive')
    if (notes.includes('shed')) flags.push('heavy-shedder')
  }
  return flags
}
