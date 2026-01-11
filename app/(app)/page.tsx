import { TodayAppointments } from '@/components/dashboard/TodayAppointments'
import { TodayAtAGlance } from '@/components/dashboard/TodayAtAGlance'
import { TodaysWatchlist } from '@/components/dashboard/TodaysWatchlist'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { getTodayDashboardData } from '@/lib/actions/dashboard'

export default async function DashboardPage() {
  const dashboardData = await getTodayDashboardData()

  // Transform appointments for TodayAppointments component
  const appointmentsForDisplay = dashboardData.appointments
    .filter(a => a.status !== 'cancelled')
    .map(a => ({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* MAIN LAYOUT - iPad-first 2-column grid (768px+) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT COLUMN (8 cols) - Main Operations */}
        <div className="md:col-span-8 space-y-6">
          {/* 1. At a Glance (High Impact) */}
          <TodayAtAGlance data={dashboardData.glance} />

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
