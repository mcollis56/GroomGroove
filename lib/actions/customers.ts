'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CustomerInput {
  name: string
  email?: string
  phone?: string
}

/**
 * Create a new customer
 */
export async function createCustomer(
  customerData: CustomerInput
): Promise<{ success: boolean; error?: string; customerId?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      name: customerData.name.trim(),
      email: customerData.email?.trim() || null,
      phone: customerData.phone?.trim() || null,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Customers] Create customer failed:', error)
    return { success: false, error: error.message }
  }

  // Revalidate paths that use customers
  revalidatePath('/dogs')
  revalidatePath('/clients')

  return { success: true, customerId: customer.id }
}

/**
 * Get all customers for dropdown
 */
export async function getAllCustomers() {
  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, name, email, phone')
    .order('name', { ascending: true })

  if (error) {
    console.error('[Customers] Fetch all failed:', error)
    return []
  }

  return customers || []
}
