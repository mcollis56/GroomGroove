'use server'

// Staff Appointment Actions
// Handles reschedule, cancel, and other staff-initiated changes

import { createClient } from '@/utils/supabase/server'
import { sendRescheduleSMS, sendCancelledSMS } from '@/lib/sms/send'

interface CreateAppointmentInput {
  customerId: string
  dogId: string
  scheduledAt: string // ISO datetime
  services: string[]
  notes?: string
}

/**
 * Create a new appointment
 */
export async function createAppointment(input: CreateAppointmentInput) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('[Appointments] Authentication failed:', authError)
    return { success: false, error: 'You must be logged in to create an appointment' }
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      customer_id: input.customerId,
      dog_id: input.dogId,
      scheduled_at: input.scheduledAt,
      services: input.services,
      notes: input.notes,
      status: 'pending_confirmation',
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[Appointments] Create failed:', error)
    // Provide more specific error message based on error code
    if (error.code === '42P01') {
      return { success: false, error: 'Database table not found. Please run migrations.' }
    }
    if (error.code === '42501' || error.message?.includes('RLS')) {
      return { success: false, error: 'Permission denied. Check Row Level Security policies.' }
    }
    if (error.code === '23503') {
      return { success: false, error: 'Invalid customer or dog ID.' }
    }
    return { success: false, error: `Database error: ${error.message}` }
  }

  console.log("APPOINTMENT CREATED:", appointment);

  return { success: true, appointment }
}

interface UpdateAppointmentInput {
  appointmentId: string
  scheduledAt?: string // ISO datetime (for reschedule)
  services?: string[]
  notes?: string
}

interface UpdateResult {
  success: boolean
  rescheduled?: boolean
  error?: string
}

/**
 * Update appointment (staff action)
 * If time changes on a confirmed appointment:
 * - Reset status to pending_confirmation
 * - Send new confirmation SMS
 */
export async function updateAppointment(input: UpdateAppointmentInput): Promise<UpdateResult> {
  const supabase = await createClient()

  // Fetch current appointment
  const { data: current, error: fetchError } = await supabase
    .from('appointments')
    .select('status, scheduled_at, customer_id')
    .eq('id', input.appointmentId)
    .single()

  if (fetchError || !current) {
    return { success: false, error: 'Appointment not found' }
  }

  const now = new Date()
  const timeChanged = input.scheduledAt && input.scheduledAt !== current.scheduled_at

  // Build update payload
  const updates: Record<string, any> = {
    updated_at: now.toISOString(),
  }

  if (input.scheduledAt) updates.scheduled_at = input.scheduledAt
  if (input.services) updates.services = input.services
  if (input.notes !== undefined) updates.notes = input.notes

  // RULE: If staff reschedules a confirmed appointment, reset to pending
  if (current.status === 'confirmed' && timeChanged) {
    updates.status = 'pending_confirmation'
    updates.confirmed_at = null
  }

  // Update appointment
  const { error: updateError } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', input.appointmentId)

  if (updateError) {
    console.error('[Appointments] Update failed:', updateError)
    return { success: false, error: 'Failed to update appointment' }
  }

  // Send reschedule SMS if time changed on confirmed appointment
  if (current.status === 'confirmed' && timeChanged) {
    await sendRescheduleSMS(input.appointmentId)
    return { success: true, rescheduled: true }
  }

  return { success: true, rescheduled: false }
}

/**
 * Cancel appointment (staff action)
 * - Updates status to cancelled
 * - Sends cancellation SMS to customer
 */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Fetch appointment with customer info
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      customer:customers(phone, sms_consent)
    `)
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  // Already cancelled - no action needed
  if (appointment.status === 'cancelled') {
    return { success: true }
  }

  const now = new Date()

  // Update status
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: now.toISOString(),
      updated_at: now.toISOString(),
      notes: reason ? `Cancelled: ${reason}` : undefined,
    })
    .eq('id', appointmentId)

  if (updateError) {
    console.error('[Appointments] Cancel failed:', updateError)
    return { success: false, error: 'Failed to cancel appointment' }
  }

  // Send cancellation SMS if customer has consent
  const customer = Array.isArray(appointment.customer)
    ? appointment.customer[0]
    : appointment.customer

  if (customer?.sms_consent && customer?.phone) {
    await sendCancelledSMS(customer.phone, appointment.scheduled_at)
  }

  return { success: true }
}

/**
 * Get appointments by status
 * Useful for dashboard widgets (e.g., pending confirmations count)
 */
export async function getAppointmentsByStatus(
  status: 'pending_confirmation' | 'confirmed' | 'cancelled'
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(name, phone),
      dog:dogs(name)
    `)
    .eq('status', status)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Appointments] Fetch failed:', error)
    return []
  }

  return data || []
}

/**
 * Get pending confirmations count
 * For dashboard stat card
 */
export async function getPendingConfirmationsCount(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_confirmation')
    .gte('scheduled_at', new Date().toISOString()) // Only future appointments

  if (error) {
    console.error('[Appointments] Count failed:', error)
    return 0
  }

  return count || 0
}

/**
 * Get upcoming confirmed appointments
 * For calendar/schedule views
 */
export async function getUpcomingAppointments(days: number = 7) {
  const supabase = await createClient()

  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(name, phone, email),
      dog:dogs(name, breed)
    `)
    .eq('status', 'confirmed')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', futureDate.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Appointments] Fetch failed:', error)
    return []
  }

  return data || []
}

/**
 * Get appointment data for checkout page
 */
export async function getAppointmentForCheckout(appointmentId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      services,
      notes,
      status,
      customer:customers(id, name, email, phone),
      dog:dogs(id, name, breed)
    `)
    .eq('id', appointmentId)
    .single()

  if (error || !data) {
    console.error('[Appointments] Fetch for checkout failed:', error)
    return null
  }

  return {
    ...data,
    customer: Array.isArray(data.customer) ? data.customer[0] : data.customer,
    dog: Array.isArray(data.dog) ? data.dog[0] : data.dog
  }
}

/**
 * Mark appointment as in progress
 */
export async function markAppointmentInProgress(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  if (error) {
    console.error('[Appointments] Mark in-progress failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Mark appointment as completed
 */
export async function markAppointmentCompleted(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  if (error) {
    console.error('[Appointments] Mark completed failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Confirm appointment (update status from pending_confirmation to confirmed)
 */
export async function confirmAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .eq('status', 'pending_confirmation') // Only allow confirming pending appointments

  if (error) {
    console.error('[Appointments] Confirm failed:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
