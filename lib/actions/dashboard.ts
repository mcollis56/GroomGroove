'use server'

import { createClient } from '@/utils/supabase/server'

// Demo data for development - makes dashboard usable for demos/screenshots
function getDemoData(): DashboardData {
  const now = new Date()
  const todayAt = (hour: number, minute: number) => {
    const d = new Date(now)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }

  const demoAppointments: DashboardAppointment[] = [
    {
      id: 'demo-1',
      scheduled_at: todayAt(9, 0),
      services: ['Full Groom'],
      notes: null,
      status: 'completed',
      dog: { id: 'demo-dog-1', name: 'Bella', breed: 'Golden Retriever', grooming_preferences: null },
      customer: { id: 'demo-cust-1', name: 'Sarah Johnson' },
      is_first_visit: false,
      dogId: 'demo-dog-1'
    },
    {
      id: 'demo-2',
      scheduled_at: todayAt(10, 30),
      services: ['Bath & Brush', 'Nail Trim'],
      notes: 'Use gentle shampoo',
      status: 'in_progress',
      dog: { id: 'demo-dog-2', name: 'Max', breed: 'German Shepherd', grooming_preferences: { behavior_notes: 'Can be anxious around dryers' } },
      customer: { id: 'demo-cust-2', name: 'Mike Chen' },
      is_first_visit: false,
      dogId: 'demo-dog-2'
    },
    {
      id: 'demo-3',
      scheduled_at: todayAt(13, 0),
      services: ['De-shedding Treatment'],
      notes: null,
      status: 'confirmed',
      dog: { id: 'demo-dog-3', name: 'Luna', breed: 'Husky', grooming_preferences: { behavior_notes: 'Heavy shedder, extra time needed' } },
      customer: { id: 'demo-cust-3', name: 'Lisa Park' },
      is_first_visit: false,
      dogId: 'demo-dog-3'
    },
    {
      id: 'demo-4',
      scheduled_at: todayAt(14, 30),
      services: ['Full Groom', 'Teeth Cleaning'],
      notes: null,
      status: 'confirmed',
      dog: { id: 'demo-dog-4', name: 'Daisy', breed: 'Poodle', grooming_preferences: null },
      customer: { id: 'demo-cust-4', name: 'Emma Wilson' },
      is_first_visit: true,
      dogId: 'demo-dog-4'
    },
    {
      id: 'demo-5',
      scheduled_at: todayAt(16, 0),
      services: ['Nail Trim'],
      notes: 'Sensitive paws',
      status: 'pending',
      dog: { id: 'demo-dog-5', name: 'Rocky', breed: 'Bulldog', grooming_preferences: { behavior_notes: 'Nail sensitive, go slow', special_instructions: 'Use smallest clipper' } },
      customer: { id: 'demo-cust-5', name: 'James Brown' },
      is_first_visit: false,
      dogId: 'demo-dog-5'
    }
  ]

  const watchlist: WatchlistItem[] = [
    { dogName: 'Max', reason: 'Anxious', time: '10:30 AM', appointmentId: 'demo-2', dogId: 'demo-dog-2' },
    { dogName: 'Daisy', reason: 'First visit', time: '2:30 PM', appointmentId: 'demo-4', dogId: 'demo-dog-4' },
    { dogName: 'Rocky', reason: 'Nail sensitive, Special handling', time: '4:00 PM', appointmentId: 'demo-5', dogId: 'demo-dog-5' }
  ]

  return {
    appointments: demoAppointments,
    glance: {
      remainingAppointments: 3,
      specialHandlingCount: 3,
      firstTimeVisits: 1,
      finalAppointmentTime: '4:00 PM'
    },
    watchlist,
    totalDogs: 12
  }
}

export interface DashboardAppointment {
  id: string
  scheduled_at: string
  services: string[]
  notes: string | null
  status: string
  dog: {
    id: string
    name: string
    breed: string | null
    grooming_preferences: {
      behavior_notes?: string
      special_instructions?: string
    } | null
  } | null
  customer: {
    id: string
    name: string
  } | null
  is_first_visit: boolean
  // Helper for direct access
  dogId: string | null
}

export interface TodayAtAGlance {
  remainingAppointments: number
  specialHandlingCount: number
  firstTimeVisits: number
  finalAppointmentTime: string | null
}

export interface WatchlistItem {
  dogName: string
  reason: string
  time: string
  appointmentId: string
  dogId: string
}

export interface DashboardData {
  appointments: DashboardAppointment[]
  glance: TodayAtAGlance
  watchlist: WatchlistItem[]
  totalDogs: number
}

/**
 * Get all dashboard data for today
 */
export async function getTodayDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  // Get today's date range
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  // Fetch today's appointments with dog and customer info
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      services,
      notes,
      status,
      dog:dogs(id, name, breed, grooming_preferences, created_at),
      customer:customers(id, name)
    `)
    .gte('scheduled_at', startOfDay.toISOString())
    .lt('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Dashboard] Fetch appointments failed:', error)
    return {
      appointments: [],
      glance: {
        remainingAppointments: 0,
        specialHandlingCount: 0,
        firstTimeVisits: 0,
        finalAppointmentTime: null
      },
      watchlist: [],
      totalDogs: 0
    }
  }

  // Get total dogs count
  const { count: totalDogs } = await supabase
    .from('dogs')
    .select('*', { count: 'exact', head: true })

  // Check which dogs are on their first visit
  const dogIds = (appointments || [])
    .map(a => {
      const dog = Array.isArray(a.dog) ? a.dog[0] : a.dog
      return dog?.id
    })
    .filter(Boolean)

  // Get appointment counts for each dog
  const { data: appointmentCounts } = await supabase
    .from('appointments')
    .select('dog_id')
    .in('dog_id', dogIds)
    .lt('scheduled_at', startOfDay.toISOString()) // Only past appointments

  const dogVisitCounts: Record<string, number> = {}
  if (appointmentCounts) {
    for (const appt of appointmentCounts) {
      dogVisitCounts[appt.dog_id] = (dogVisitCounts[appt.dog_id] || 0) + 1
    }
  }

  // Process appointments
  const now = new Date()
  const processedAppointments: DashboardAppointment[] = (appointments || []).map(appt => {
    const dog = Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
    const customer = Array.isArray(appt.customer) ? appt.customer[0] : appt.customer
    const isFirstVisit = dog?.id ? (dogVisitCounts[dog.id] || 0) === 0 : false

    return {
      ...appt,
      dog: dog ? {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        grooming_preferences: (dog.grooming_preferences || null) as DashboardAppointment['dog'] extends { grooming_preferences: infer T } ? T : never
      } : null,
      customer,
      is_first_visit: isFirstVisit,
      dogId: dog?.id || null
    }
  })

  // Calculate "Today at a Glance" stats
  const remainingAppointments = processedAppointments.filter(
    a => a.status !== 'completed' && a.status !== 'cancelled' && new Date(a.scheduled_at) >= now
  ).length

  const specialHandlingCount = processedAppointments.filter(a => {
    const prefs = a.dog?.grooming_preferences
    return prefs?.behavior_notes || prefs?.special_instructions
  }).length

  const firstTimeVisits = processedAppointments.filter(a => a.is_first_visit).length

  const nonCancelledAppointments = processedAppointments.filter(
    a => a.status !== 'cancelled'
  )
  const finalAppointment = nonCancelledAppointments[nonCancelledAppointments.length - 1]
  const finalAppointmentTime = finalAppointment
    ? formatTime(finalAppointment.scheduled_at)
    : null

  // Build watchlist (dogs requiring special attention)
  const watchlist: WatchlistItem[] = processedAppointments
    .filter(a => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const prefs = a.dog?.grooming_preferences
      return prefs?.behavior_notes || prefs?.special_instructions || a.is_first_visit
    })
    .map(a => {
      const reasons: string[] = []
      const prefs = a.dog?.grooming_preferences

      if (a.is_first_visit) {
        reasons.push('First visit')
      }
      if (prefs?.behavior_notes) {
        // Extract key concerns from behavior notes
        const notes = prefs.behavior_notes.toLowerCase()
        if (notes.includes('anxious') || notes.includes('nervous')) reasons.push('Anxious')
        if (notes.includes('aggressive') || notes.includes('bites')) reasons.push('Aggressive')
        if (notes.includes('nail') || notes.includes('paw')) reasons.push('Nail sensitive')
        if (notes.includes('dryer') || notes.includes('loud')) reasons.push('Noise sensitive')
        // If no specific keywords, add a generic flag
        if (reasons.length === 0 || (reasons.length === 1 && reasons[0] === 'First visit')) {
          reasons.push('Behavior note')
        }
      }
      if (prefs?.special_instructions && reasons.length <= 1) {
        reasons.push('Special handling')
      }

      return {
        dogName: a.dog?.name || 'Unknown',
        reason: reasons.join(', '),
        time: formatTime(a.scheduled_at),
        appointmentId: a.id,
        dogId: a.dog?.id || ''
      }
    })
    .sort((a, b) => a.time.localeCompare(b.time))

  // If no appointments today in development, use demo data for demos/screenshots
  if (processedAppointments.length === 0 && process.env.NODE_ENV === 'development') {
    return getDemoData()
  }

  return {
    appointments: processedAppointments,
    glance: {
      remainingAppointments,
      specialHandlingCount,
      firstTimeVisits,
      finalAppointmentTime
    },
    watchlist,
    totalDogs: totalDogs || 0
  }
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
