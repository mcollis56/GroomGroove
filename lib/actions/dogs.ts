'use server'

import { createClient } from '@/utils/supabase/server'

// Demo dog data for development mode - matches demo appointments in dashboard
function getDemoDogDetail(demoId: string): DogDetail | null {
  const demoDogs: Record<string, DogDetail> = {
    'demo-dog-1': {
      id: 'demo-dog-1',
      name: 'Bella',
      breed: 'Golden Retriever',
      weight: 65,
      notes: 'Sweet girl, loves treats during grooming',
      photo_url: null,
      grooming_preferences: {
        clipping_length: '#4 blade all over',
        nail_tool: 'grinder',
        coat_notes: 'Dense double coat, regular deshedding recommended'
      },
      created_at: '2024-06-15T00:00:00Z',
      customer: {
        id: 'demo-cust-1',
        name: 'Sarah Johnson',
        phone: '(555) 123-4567',
        email: 'sarah.j@email.com'
      },
      history: [
        { id: 'hist-1', scheduled_at: '2024-12-15T09:00:00Z', services: ['Full Groom'], notes: null, status: 'completed' },
        { id: 'hist-2', scheduled_at: '2024-11-01T10:30:00Z', services: ['Bath & Brush', 'Nail Trim'], notes: null, status: 'completed' },
        { id: 'hist-3', scheduled_at: '2024-09-20T14:00:00Z', services: ['Full Groom'], notes: 'Extra deshedding', status: 'completed' }
      ]
    },
    'demo-dog-2': {
      id: 'demo-dog-2',
      name: 'Max',
      breed: 'German Shepherd',
      weight: 85,
      notes: 'Working on building trust with grooming process',
      photo_url: null,
      grooming_preferences: {
        clipping_length: 'Minimal trimming, neaten only',
        nail_tool: 'clipper',
        nail_clipper_size: 'large',
        coat_notes: 'Shedding heavily in spring/fall',
        behavior_notes: 'Can be anxious around dryers - use low setting, take breaks'
      },
      created_at: '2024-03-10T00:00:00Z',
      customer: {
        id: 'demo-cust-2',
        name: 'Mike Chen',
        phone: '(555) 234-5678',
        email: 'mike.chen@email.com'
      },
      history: [
        { id: 'hist-4', scheduled_at: '2024-12-01T10:30:00Z', services: ['Bath & Brush', 'Nail Trim'], notes: 'Used gentle shampoo', status: 'completed' },
        { id: 'hist-5', scheduled_at: '2024-10-15T11:00:00Z', services: ['Deshedding Treatment'], notes: null, status: 'completed' }
      ]
    },
    'demo-dog-3': {
      id: 'demo-dog-3',
      name: 'Luna',
      breed: 'Husky',
      weight: 55,
      notes: 'Beautiful coat, very friendly',
      photo_url: null,
      grooming_preferences: {
        clipping_length: 'Never clip - brush out only',
        nail_tool: 'grinder',
        coat_notes: 'Heavy shedder, extra time needed for undercoat removal',
        behavior_notes: 'Talkative but cooperative'
      },
      created_at: '2024-01-20T00:00:00Z',
      customer: {
        id: 'demo-cust-3',
        name: 'Lisa Park',
        phone: '(555) 345-6789',
        email: 'lisa.park@email.com'
      },
      history: [
        { id: 'hist-6', scheduled_at: '2024-11-20T13:00:00Z', services: ['De-shedding Treatment'], notes: 'Removed lots of undercoat', status: 'completed' },
        { id: 'hist-7', scheduled_at: '2024-09-05T09:00:00Z', services: ['Bath & Brush', 'De-shedding Treatment'], notes: null, status: 'completed' },
        { id: 'hist-8', scheduled_at: '2024-06-10T14:30:00Z', services: ['De-shedding Treatment'], notes: 'Summer blowout', status: 'completed' }
      ]
    },
    'demo-dog-4': {
      id: 'demo-dog-4',
      name: 'Daisy',
      breed: 'Poodle',
      weight: 45,
      notes: 'First time client - getting to know her preferences',
      photo_url: null,
      grooming_preferences: {
        clipping_length: 'To be determined after first visit',
        coat_notes: 'Curly coat, no shedding'
      },
      created_at: '2025-01-08T00:00:00Z',
      customer: {
        id: 'demo-cust-4',
        name: 'Emma Wilson',
        phone: '(555) 456-7890',
        email: 'emma.w@email.com'
      },
      history: []
    },
    'demo-dog-5': {
      id: 'demo-dog-5',
      name: 'Rocky',
      breed: 'Bulldog',
      weight: 50,
      notes: 'Sweetest boy, just sensitive about his feet',
      photo_url: null,
      grooming_preferences: {
        nail_tool: 'clipper',
        nail_clipper_size: 'small',
        coat_notes: 'Short coat, focus on wrinkle cleaning',
        behavior_notes: 'Nail sensitive, go slow',
        special_instructions: 'Use smallest clipper, lots of treats, take breaks between paws'
      },
      created_at: '2024-05-01T00:00:00Z',
      customer: {
        id: 'demo-cust-5',
        name: 'James Brown',
        phone: '(555) 567-8901',
        email: 'james.b@email.com'
      },
      history: [
        { id: 'hist-9', scheduled_at: '2024-12-10T16:00:00Z', services: ['Nail Trim'], notes: 'Took extra time, went well', status: 'completed' },
        { id: 'hist-10', scheduled_at: '2024-10-25T15:00:00Z', services: ['Bath', 'Nail Trim'], notes: 'Cleaned wrinkles thoroughly', status: 'completed' }
      ]
    }
  }

  return demoDogs[demoId] || null
}

// Grooming preferences structure
export interface GroomingPreferences {
  clipping_length?: string
  clipping_notes?: string
  nail_clipper_size?: 'small' | 'medium' | 'large'
  nail_tool?: 'clipper' | 'grinder'
  coat_notes?: string
  behavior_notes?: string
  special_instructions?: string
}

// Full dog detail with history
export interface DogDetail {
  id: string
  name: string
  breed: string | null
  weight: number | null
  notes: string | null
  photo_url: string | null
  grooming_preferences: GroomingPreferences
  created_at: string
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
  } | null
  history: AppointmentHistory[]
}

export interface AppointmentHistory {
  id: string
  scheduled_at: string
  services: string[]
  notes: string | null
  status: string
}

/**
 * Get full dog details including grooming preferences and history
 */
export async function getDogDetail(dogId: string): Promise<DogDetail | null> {
  // In development, check for demo dog IDs first
  if (process.env.NODE_ENV === 'development' && dogId.startsWith('demo-dog-')) {
    return getDemoDogDetail(dogId)
  }

  const supabase = await createClient()

  // Fetch dog with owner
  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .select(`
      id,
      name,
      breed,
      weight,
      notes,
      photo_url,
      grooming_preferences,
      created_at,
      customer:customers(id, name, phone, email)
    `)
    .eq('id', dogId)
    .single()

  if (dogError || !dog) {
    console.error('[Dogs] Fetch detail failed:', dogError)
    return null
  }

  // Fetch appointment history for this dog
  const { data: appointments, error: historyError } = await supabase
    .from('appointments')
    .select('id, scheduled_at, services, notes, status')
    .eq('dog_id', dogId)
    .order('scheduled_at', { ascending: false })
    .limit(20) // Last 20 appointments

  if (historyError) {
    console.error('[Dogs] Fetch history failed:', historyError)
  }

  return {
    ...dog,
    customer: Array.isArray(dog.customer) ? dog.customer[0] : dog.customer,
    grooming_preferences: (dog.grooming_preferences as GroomingPreferences) || {},
    history: appointments || []
  }
}

/**
 * Update dog's grooming preferences
 */
export async function updateGroomingPreferences(
  dogId: string,
  preferences: GroomingPreferences
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('dogs')
    .update({
      grooming_preferences: preferences,
      updated_at: new Date().toISOString()
    })
    .eq('id', dogId)

  if (error) {
    console.error('[Dogs] Update preferences failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Add a timestamped grooming note to a dog's notes field
 */
export async function addGroomingNote(
  dogId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current notes
  const { data: dog, error: fetchError } = await supabase
    .from('dogs')
    .select('notes')
    .eq('id', dogId)
    .single()

  if (fetchError) {
    console.error('[Dogs] Fetch for note failed:', fetchError)
    return { success: false, error: fetchError.message }
  }

  // Format new note with timestamp
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const newNote = `[${timestamp}] ${note}`

  // Append to existing notes or start fresh
  const updatedNotes = dog?.notes
    ? `${dog.notes}\n\n${newNote}`
    : newNote

  const { error } = await supabase
    .from('dogs')
    .update({
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', dogId)

  if (error) {
    console.error('[Dogs] Add note failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get all dogs for the dogs list page (server component)
 */
export async function getAllDogs() {
  const supabase = await createClient()

  const { data: dogs, error } = await supabase
    .from('dogs')
    .select(`
      id,
      name,
      breed,
      weight,
      notes,
      photo_url,
      grooming_preferences,
      created_at,
      customer:customers(id, name, phone)
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('[Dogs] Fetch all failed:', error)
    return []
  }

  // Fetch appointment stats
  const { data: appointmentStats } = await supabase
    .from('appointments')
    .select('dog_id, scheduled_at')
    .order('scheduled_at', { ascending: false })

  // Build stats map
  const dogStats: Record<string, { count: number; lastVisit: string | null }> = {}
  if (appointmentStats) {
    for (const appt of appointmentStats) {
      if (!dogStats[appt.dog_id]) {
        dogStats[appt.dog_id] = { count: 0, lastVisit: null }
      }
      dogStats[appt.dog_id].count++
      if (!dogStats[appt.dog_id].lastVisit) {
        dogStats[appt.dog_id].lastVisit = appt.scheduled_at
      }
    }
  }

  return (dogs || []).map(dog => ({
    ...dog,
    customer: Array.isArray(dog.customer) ? dog.customer[0] : dog.customer,
    grooming_preferences: (dog.grooming_preferences as GroomingPreferences) || {},
    appointment_count: dogStats[dog.id]?.count || 0,
    last_visit: dogStats[dog.id]?.lastVisit || null
  }))
}
