'use server'

import { createClient } from '@/utils/supabase/server'
import { safeParseDate } from '@/lib/utils/date'

// --- Interfaces ---
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
    grooming_preferences: { behavior_notes?: string; special_instructions?: string } | null
  } | null
  customer: { id: string; name: string } | null
  is_first_visit: boolean
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

// --- CONSTANTS ---
const TIMEZONE = 'Australia/Sydney'

// --- HELPER: Force Sydney Time Formatting ---
function formatTimeSydney(isoString: string): string {
  const date = safeParseDate(isoString)
  if (!date) return 'N/A'
  return date.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// --- MAIN ACTION ---
export async function getTodayDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  // 1. Get "Today" in Sydney as a string (YYYY-MM-DD)
  const now = new Date()
  const sydneyDateString = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)

  // 2. WIDE FETCH: Get -24h to +48h window (UTC) to capture everything
  const safetyStart = new Date(now.getTime() - 86400000) // -24h
  const safetyEnd = new Date(now.getTime() + 172800000)  // +48h

  const { data: rawAppointments, error } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, services, notes, status,
      dog:dogs(id, name, breed, grooming_preferences),
      customer:customers(id, name)
    `)
    .gte('scheduled_at', safetyStart.toISOString())
    .lt('scheduled_at', safetyEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Dashboard] Fetch failed:', error)
    return {
      appointments: [],
      glance: { remainingAppointments: 0, specialHandlingCount: 0, firstTimeVisits: 0, finalAppointmentTime: null },
      watchlist: [],
      totalDogs: 0
    }
  }

  // 3. STRICT FILTER: Keep only if "Sydney Date" == "Sydney Today"
  const appointments = (rawAppointments || []).filter(appt => {
    const apptDate = new Date(appt.scheduled_at)
    const apptSydneyDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(apptDate)
    
    return apptSydneyDate === sydneyDateString
  })

  // 4. Get Dog Stats (First Visit check)
  const { count: totalDogs } = await supabase.from('dogs').select('*', { count: 'exact', head: true })
  
  const dogIds = appointments.map(a => {
      // @ts-ignore
      const d = Array.isArray(a.dog) ? a.dog[0] : a.dog;
      // @ts-ignore
      return d?.id;
  }).filter((id): id is string => !!id);

  const { data: pastAppts } = await supabase
    .from('appointments')
    .select('dog_id')
    .in('dog_id', dogIds)
    .lt('scheduled_at', safetyStart.toISOString()) // Rough check for past
  
  const visitCounts: Record<string, number> = {}
  pastAppts?.forEach(a => visitCounts[a.dog_id] = (visitCounts[a.dog_id] || 0) + 1)

  // 5. Process & Map (using formatTimeSydney)
  const processedAppointments: DashboardAppointment[] = appointments.map(appt => {
    // @ts-ignore
    const dog = Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
    // @ts-ignore
    const customer = Array.isArray(appt.customer) ? appt.customer[0] : appt.customer
    const isFirstVisit = dog?.id ? (visitCounts[dog.id] || 0) === 0 : false

    return {
      ...appt,
      dog: dog ? { id: dog.id, name: dog.name, breed: dog.breed, grooming_preferences: dog.grooming_preferences } : null,
      customer,
      is_first_visit: isFirstVisit,
      dogId: dog?.id || null
    }
  })

  // 6. Calculate Stats
  const activeAppts = processedAppointments.filter(a => a.status !== 'cancelled')
  const remaining = activeAppts.filter(a => a.status !== 'completed').length
  const special = activeAppts.filter(a => a.dog?.grooming_preferences?.behavior_notes).length
  const firsts = activeAppts.filter(a => a.is_first_visit).length
  
  const finalAppt = activeAppts[activeAppts.length - 1]
  const finalTime = finalAppt ? formatTimeSydney(finalAppt.scheduled_at) : null

  // 7. Build Watchlist
  const watchlist: WatchlistItem[] = activeAppts
    .filter(a => a.is_first_visit || a.dog?.grooming_preferences?.behavior_notes)
    .map(a => ({
      dogName: a.dog?.name || 'Unknown',
      reason: a.is_first_visit ? 'First Visit' : 'Behavior',
      time: formatTimeSydney(a.scheduled_at),
      appointmentId: a.id,
      dogId: a.dog?.id || ''
    }))

  return {
    appointments: processedAppointments,
    glance: { remainingAppointments: remaining, specialHandlingCount: special, firstTimeVisits: firsts, finalAppointmentTime: finalTime },
    watchlist,
    totalDogs: totalDogs || 0
  }
}
