'use server'

import { createClient } from '@/utils/supabase/server'
import { safeParseDate } from '@/lib/utils/date'


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
 * @param timezoneOffset Optional timezone offset in minutes (e.g., -300 for EST, 660 for Australia/Sydney)
 */
export async function getTodayDashboardData(timezoneOffset?: number): Promise<DashboardData> {
  const supabase = await createClient()

  // Get today's date range adjusted for timezone
  const now = new Date()
  
  // If timezoneOffset is provided, adjust the date
  let today = now
  if (timezoneOffset !== undefined) {
    // Convert server local time to user's local time
    // timezoneOffset is user's getTimezoneOffset() (UTC - local)
    // To convert server time to user time: userTime = serverUTC - userTimezoneOffset
    const serverUTC = now.getTime() + (now.getTimezoneOffset() * 60000)
    today = new Date(serverUTC - (timezoneOffset * 60000))
  }
  
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

  // Process appointments - use the adjusted 'today' for comparison
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
    a => {
      const aptDate = safeParseDate(a.scheduled_at)
      return a.status !== 'completed' && a.status !== 'cancelled' && aptDate && aptDate >= today
    }
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
  const date = safeParseDate(isoString)
  if (!date) return 'N/A'
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
