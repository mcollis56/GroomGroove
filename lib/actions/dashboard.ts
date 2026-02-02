'use server'

import { createClient } from '@/utils/supabase/server'
import { safeParseDate, formatTime as formatTimeUtil } from '@/lib/utils/date' // Import our shared utility

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

// FORCE SYDNEY TIMEZONE
const TIMEZONE = 'Australia/Sydney';

export async function getTodayDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  // 1. Calculate "Start of Today" in Sydney Time
  const now = new Date();

  // Create a date string for Sydney "YYYY-MM-DD"
  const sydneyDateString = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  // Create Date objects for the DB query (UTC equivalent of Sydney Midnight)
  // We append "T00:00:00" and the offset, but actually, it's easier to just ask for the range
  // Let's use string comparison for safety if DB stores ISO
  // Or better: Construct the range in UTC that corresponds to Sydney's day

  // Simple hack: Create a date object that represents Sydney Midnight
  // This is tricky without a library, so we will fetch a WIDER range (UTC -12 to UTC +12) and filter in memory.
  // This avoids ALL timezone SQL bugs.

  // Fetch from 24 hours ago to 48 hours in future to be safe
  const safetyStart = new Date(now.getTime() - 86400000);
  const safetyEnd = new Date(now.getTime() + 172800000);

  const { data: rawAppointments, error } = await supabase
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
    .gte('scheduled_at', safetyStart.toISOString())
    .lt('scheduled_at', safetyEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Dashboard] Fetch appointments failed:', error)
    return {
      appointments: [],
      glance: { remainingAppointments: 0, specialHandlingCount: 0, firstTimeVisits: 0, finalAppointmentTime: null },
      watchlist: [],
      totalDogs: 0
    }
  }

  // 2. FILTER IN MEMORY for "Sydney Today"
  // We check if the appointment's "Sydney Date" matches "Today's Sydney Date"
  const appointments = (rawAppointments || []).filter(appt => {
    const apptDate = new Date(appt.scheduled_at);
    const apptSydneyString = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(apptDate);

    return apptSydneyString === sydneyDateString;
  });


  // Get total dogs count
  const { count: totalDogs } = await supabase
    .from('dogs')
    .select('*', { count: 'exact', head: true })

  // Check which dogs are on their first visit
  const dogIds = appointments.map(a => {
    const dog = Array.isArray(a.dog) ? a.dog[0] : a.dog
    return dog?.id
  }).filter(Boolean)

  const { data: appointmentCounts } = await supabase
    .from('appointments')
    .select('dog_id')
    .in('dog_id', dogIds)
    .lt('scheduled_at', safetyStart.toISOString()) // Past only

  const dogVisitCounts: Record<string, number> = {}
  if (appointmentCounts) {
    for (const appt of appointmentCounts) {
      dogVisitCounts[appt.dog_id] = (dogVisitCounts[appt.dog_id] || 0) + 1
    }
  }

  const processedAppointments: DashboardAppointment[] = appointments.map(appt => {
    const dog = Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
    const customer = Array.isArray(appt.customer) ? appt.customer[0] : appt.customer
    const isFirstVisit = dog?.id ? (dogVisitCounts[dog.id] || 0) === 0 : false

    return {
      ...appt,
      dog: dog ? {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        grooming_preferences: (dog.grooming_preferences || null) as any
      } : null,
      customer,
      is_first_visit: isFirstVisit,
      dogId: dog?.id || null
    }
  })

  // Calculate "Today at a Glance" stats
  const remainingAppointments = processedAppointments.filter(
    a => a.status !== 'completed' && a.status !== 'cancelled'
  ).length

  const specialHandlingCount = processedAppointments.filter(a => {
    const prefs = a.dog?.grooming_preferences
    return prefs?.behavior_notes || prefs?.special_instructions
  }).length

  const firstTimeVisits = processedAppointments.filter(a => a.is_first_visit).length

  const nonCancelledAppointments = processedAppointments.filter(a => a.status !== 'cancelled')
  const finalAppointment = nonCancelledAppointments[nonCancelledAppointments.length - 1]

  // USE THE SHARED UTILITY FOR TIME (It handles 'Timezone' correctly if implemented right, 
  // but to be safe we use our local helper that forces Sydney)
  const finalAppointmentTime = finalAppointment
    ? formatTimeSydney(finalAppointment.scheduled_at)
    : null

  const watchlist: WatchlistItem[] = processedAppointments
    .filter(a => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const prefs = a.dog?.grooming_preferences
      return prefs?.behavior_notes || prefs?.special_instructions || a.is_first_visit
    })
    .map(a => {
      const reasons: string[] = []
      const prefs = a.dog?.grooming_preferences

      if (a.is_first_visit) reasons.push('First visit')
      if (prefs?.behavior_notes) {
        const notes = prefs.behavior_notes.toLowerCase()
        if (notes.includes('anxious') || notes.includes('nervous')) reasons.push('Anxious')
        if (notes.includes('aggressive') || notes.includes('bites')) reasons.push('Aggressive')
        if (reasons.length === 0) reasons.push('Behavior note')
      }
      if (prefs?.special_instructions && reasons.length <= 1) reasons.push('Special handling')

      return {
        dogName: a.dog?.name || 'Unknown',
        reason: reasons.join(', '),
        time: formatTimeSydney(a.scheduled_at),
        appointmentId: a.id,
        dogId: a.dog?.id || ''
      }
    })
    .sort((a, b) => a.time.localeCompare(b.time))

  return {
    appointments: processedAppointments,
    glance: { remainingAppointments, specialHandlingCount, firstTimeVisits, finalAppointmentTime },
    watchlist,
    totalDogs: totalDogs || 0
  }
}

// LOCAL HELPER THAT FORCES SYDNEY DISPLAY
function formatTimeSydney(isoString: string): string {
  const date = safeParseDate(isoString)
  if (!date) return 'N/A'

  // This forces the output to be "3:30 PM" in Sydney, regardless of where the server is
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Australia/Sydney',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
