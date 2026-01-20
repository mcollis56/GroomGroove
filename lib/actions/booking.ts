'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DogWithOwnerInput {
  dog: {
    name: string
    breed?: string
    weight?: string
    notes?: string
  }
  owner: {
    name: string
    phone?: string
    email?: string
  }
}

export interface BookingInput {
  dogId: string
  customerId: string
  scheduledAt: string
  services: string[]
  notes?: string
}

/**
 * Search for dogs by name (partial match)
 */
export async function searchDogs(query: string) {
  if (!query || query.length < 2) {
    return []
  }

  const supabase = await createClient()

  const { data: dogs, error } = await supabase
    .from('dogs')
    .select(`
      id,
      name,
      breed,
      customer:customers(id, name, phone)
    `)
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(10)

  if (error) {
    console.error('[Booking] Search dogs failed:', error)
    return []
  }

  return (dogs || []).map(dog => ({
    ...dog,
    customer: Array.isArray(dog.customer) ? dog.customer[0] : dog.customer
  }))
}

/**
 * Create a new dog with owner information
 * Dog-first approach: creates owner first, then dog
 */
export async function createDogWithOwner(
  input: DogWithOwnerInput
): Promise<{ success: boolean; error?: string; dogId?: string; customerId?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Create the customer (owner) first
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      name: input.owner.name.trim(),
      phone: input.owner.phone?.trim() || null,
      email: input.owner.email?.trim() || null,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (customerError) {
    console.error('[Booking] Create customer failed:', customerError)
    return { success: false, error: customerError.message }
  }

  // Create the dog linked to the customer
  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .insert({
      name: input.dog.name.trim(),
      breed: input.dog.breed?.trim() || null,
      weight: input.dog.weight ? Number(input.dog.weight) : null,
      notes: input.dog.notes?.trim() || null,
      customer_id: customer.id,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (dogError) {
    console.error('[Booking] Create dog failed:', dogError)
    return { success: false, error: dogError.message }
  }

  revalidatePath('/dogs')
  revalidatePath('/calendar')

  return { success: true, dogId: dog.id, customerId: customer.id }
}

/**
 * Create a new appointment (booking)
 */
export async function createBooking(
  input: BookingInput
): Promise<{ success: boolean; error?: string; appointmentId?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      customer_id: input.customerId,
      dog_id: input.dogId,
      scheduled_at: input.scheduledAt,
      services: input.services,
      notes: input.notes || null,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Booking] Create appointment failed:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/calendar')

  return { success: true, appointmentId: appointment.id }
}

/**
 * Create dog with owner AND immediately book an appointment
 * All-in-one action for the "Add New Dog" flow when booking
 */
export async function createDogWithOwnerAndBook(
  input: DogWithOwnerInput & {
    appointment: {
      scheduledAt: string
      services: string[]
      notes?: string
    }
  }
): Promise<{ success: boolean; error?: string; dogId?: string; appointmentId?: string }> {
  // First create the dog with owner
  const dogResult = await createDogWithOwner({
    dog: input.dog,
    owner: input.owner,
  })

  if (!dogResult.success || !dogResult.dogId || !dogResult.customerId) {
    return { success: false, error: dogResult.error || 'Failed to create dog' }
  }

  // Then create the booking
  const bookingResult = await createBooking({
    dogId: dogResult.dogId,
    customerId: dogResult.customerId,
    scheduledAt: input.appointment.scheduledAt,
    services: input.appointment.services,
    notes: input.appointment.notes,
  })

  if (!bookingResult.success) {
    return { success: false, error: bookingResult.error || 'Failed to create appointment' }
  }

  return {
    success: true,
    dogId: dogResult.dogId,
    appointmentId: bookingResult.appointmentId,
  }
}
