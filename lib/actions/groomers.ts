'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Groomer {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  color: string | null
  avatar_url: string | null
  is_active: boolean
  on_duty: boolean
  created_at: string
  updated_at: string
}

export interface CreateGroomerInput {
  name: string
  email?: string
  phone?: string
  role?: string
  color?: string
}

/**
 * Get all groomers
 */
export async function getGroomers(): Promise<Groomer[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groomers')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('[Groomers] Fetch failed:', error)
    return []
  }

  return data || []
}

/**
 * Create a new groomer
 */
export async function createGroomer(
  input: CreateGroomerInput
): Promise<{ success: boolean; error?: string; data?: Groomer }> {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in.' }
  }

  const { data, error } = await supabase
    .from('groomers')
    .insert({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      role: input.role || 'Groomer',
      color: input.color || '#3B82F6',
      is_active: true,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[Groomers] Create failed:', error)
    return { success: false, error: error.message }
  }

  // Revalidate the groomers page to show the new groomer
  revalidatePath('/groomers')

  return { success: true, data }
}

/**
 * Update a groomer
 */
export async function updateGroomer(
  id: string,
  input: Partial<CreateGroomerInput>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('groomers')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[Groomers] Update failed:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/groomers')
  return { success: true }
}

/**
 * Delete (deactivate) a groomer
 */
export async function deleteGroomer(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('groomers')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[Groomers] Delete failed:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/groomers')
  return { success: true }
}

/**
 * Set groomer on_duty status (clock in/out)
 */
export async function setGroomerOnDuty(
  id: string,
  onDuty: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('groomers')
    .update({
      on_duty: onDuty,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[Groomers] Set on_duty failed:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/groomers')
  return { success: true }
}

/**
 * Get groomers currently on duty
 */
export async function getGroomersOnDuty(): Promise<Groomer[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groomers')
    .select('*')
    .eq('is_active', true)
    .eq('on_duty', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('[Groomers] Fetch on duty failed:', error)
    return []
  }

  return data || []
}

/**
 * Get groomers currently off duty
 */
export async function getGroomersOffDuty(): Promise<Groomer[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groomers')
    .select('*')
    .eq('is_active', true)
    .eq('on_duty', false)
    .order('name', { ascending: true })

  if (error) {
    console.error('[Groomers] Fetch off duty failed:', error)
    return []
  }

  return data || []
}
