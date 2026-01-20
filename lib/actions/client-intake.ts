'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface NewClientWithDogInput {
  owner: {
    firstName: string
    lastName: string
    phone: string
    email?: string
  }
  dog: {
    name: string
    breed?: string
    weight?: string
    notes?: string
  }
}

export async function createClientWithDog(
  input: NewClientWithDogInput
): Promise<{ success: boolean; error?: string; dogId?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const fullName = `${input.owner.firstName} ${input.owner.lastName}`.trim()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      name: fullName,
      phone: input.owner.phone,
      email: input.owner.email || null,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (customerError) {
    return { success: false, error: customerError.message }
  }

  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .insert({
      name: input.dog.name,
      breed: input.dog.breed || null,
      weight: input.dog.weight ? Number(input.dog.weight) : null,
      notes: input.dog.notes || null,
      customer_id: customer.id,
      user_id: user.id,
    })
    .select('id')
    .single()

  if (dogError) {
    return { success: false, error: dogError.message }
  }

  revalidatePath('/clients')
  revalidatePath('/dogs')

  return { success: true, dogId: dog.id }
}
