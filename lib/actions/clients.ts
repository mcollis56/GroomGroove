'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface DogInput {
  name: string
  breed: string
  weight: string
  notes: string
}

interface ClientInput {
  firstName: string
  surname: string
  email: string
  phone: string
}

export async function createClient_action(
  clientData: ClientInput,
  dogs: DogInput[]
): Promise<{ success: boolean; error?: string; clientId?: string }> {
  const supabase = await createClient()

  // Combine first name and surname for the name field
  const fullName = `${clientData.firstName} ${clientData.surname}`.trim()

  // Insert customer (customers table has: id, name, email, phone, sms_consent, created_at, updated_at)
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      name: fullName,
      email: clientData.email || null,
      phone: clientData.phone || null,
    })
    .select('id')
    .single()

  if (customerError) {
    console.error('[Clients] Create customer failed:', customerError)
    return { success: false, error: customerError.message }
  }

  // Insert dogs for this customer
  const dogsToInsert = dogs
    .filter(dog => dog.name.trim()) // Only insert dogs with names
    .map(dog => ({
      customer_id: customer.id,
      name: dog.name.trim(),
      breed: dog.breed.trim() || null,
      weight: dog.weight ? parseFloat(dog.weight) : null,
      notes: dog.notes.trim() || null,
    }))

  if (dogsToInsert.length > 0) {
    const { error: dogsError } = await supabase
      .from('dogs')
      .insert(dogsToInsert)

    if (dogsError) {
      console.error('[Clients] Create dogs failed:', dogsError)
      // Customer was created, but dogs failed - still return success but log warning
      return { success: true, clientId: customer.id, error: `Client created but dogs failed: ${dogsError.message}` }
    }
  }

  // Revalidate the clients page to show new data
  revalidatePath('/clients')

  return { success: true, clientId: customer.id }
}

/**
 * Delete a client (and their dogs/appointments)
 */
export async function deleteClient(clientId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Delete the client (dogs and appointments should cascade delete if FK is set up with ON DELETE CASCADE)
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', clientId)

  if (error) {
    console.error('[Clients] Delete failed:', error)
    return { success: false, error: error.message }
  }

  // Revalidate the clients page
  revalidatePath('/clients')

  return { success: true }
}

/**
 * Get all clients with their dogs for the clients list page
 */
export async function getAllClients() {
  const supabase = await createClient()

  // Get all customers with their dogs
  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      email,
      phone,
      created_at,
      dogs(id, name, breed, notes)
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('[Clients] Fetch all failed:', error)
    return []
  }

  // Get last visit for each customer
  const { data: appointments } = await supabase
    .from('appointments')
    .select('customer_id, scheduled_at')
    .order('scheduled_at', { ascending: false })

  // Build last visit map
  const lastVisitMap: Record<string, string> = {}
  if (appointments) {
    for (const appt of appointments) {
      if (!lastVisitMap[appt.customer_id]) {
        lastVisitMap[appt.customer_id] = appt.scheduled_at
      }
    }
  }

  // Transform to expected format
  return (customers || []).map(customer => {
    // Split name into surname and first name (assume "First Last" format)
    const nameParts = customer.name.split(' ')
    const firstName = nameParts[0] || ''
    const surname = nameParts.slice(1).join(' ') || ''

    // Derive concerns from dog notes
    const dogConcerns = (customer.dogs || [])
      .map((d: { notes: string | null }) => d.notes)
      .filter(Boolean)
      .join(', ')

    return {
      id: customer.id,
      surname,
      firstName,
      email: customer.email || '',
      phone: customer.phone || '',
      dogs: customer.dogs || [],
      lastVisit: lastVisitMap[customer.id]
        ? new Date(lastVisitMap[customer.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null,
      concerns: dogConcerns.length > 50 ? dogConcerns.slice(0, 47) + '...' : dogConcerns || null,
      status: 'active' as const, // Default to active for now
    }
  })
}
