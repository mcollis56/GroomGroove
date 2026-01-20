// SMS Sending Functions
// Handles confirmation requests and reminders

import { createClient } from '@/utils/supabase/server'
import { smsProvider } from './provider'
import { format } from 'date-fns'

interface SendConfirmationParams {
  appointmentId: string
  customerId: string
}

/**
 * Send confirmation request SMS after checkout
 * Only sends if customer has SMS consent and phone number
 */
export async function sendConfirmationSMS({
  appointmentId,
  customerId
}: SendConfirmationParams): Promise<{ sent: boolean; reason?: string }> {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[SMS] User not authenticated')
    return { sent: false, reason: 'not_authenticated' }
  }

  // Fetch appointment with customer and dog data
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(*),
      dog:dogs(*)
    `)
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) {
    console.error('[SMS] Failed to fetch appointment:', error)
    return { sent: false, reason: 'appointment_not_found' }
  }

  // Check SMS consent
  if (!appointment.customer.sms_consent) {
    console.log('[SMS] Customer has not consented to SMS')
    return { sent: false, reason: 'no_consent' }
  }

  // Check phone number
  if (!appointment.customer.phone) {
    console.log('[SMS] Customer has no phone number')
    return { sent: false, reason: 'no_phone' }
  }

  // Format appointment date/time
  const dateStr = format(new Date(appointment.scheduled_at), 'EEE, MMM d')
  const timeStr = format(new Date(appointment.scheduled_at), 'h:mm a')
  const customerFirstName = appointment.customer.name.split(' ')[0]

  // Compose message
  const message = `GroomGroove: Hi ${customerFirstName}! Your next appointment for ${appointment.dog.name} is proposed for:

📅 ${dateStr} at ${timeStr}
✂️ ${appointment.services.join(', ')}

Reply YES to confirm or NO to cancel.

Questions? Call (555) 123-4567`

  // Send SMS
  const result = await smsProvider.send({
    to: appointment.customer.phone,
    body: message,
  })

  // Log notification in database
  await supabase.from('sms_notifications').insert({
    appointment_id: appointmentId,
    type: 'confirmation_request',
    delivered: result.success,
    user_id: user.id,
  })

  return { sent: result.success }
}

/**
 * Send reminder SMS 24 hours before confirmed appointment
 */
export async function sendReminderSMS(appointmentId: string): Promise<{ sent: boolean }> {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[SMS] User not authenticated')
    return { sent: false }
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(*),
      dog:dogs(*)
    `)
    .eq('id', appointmentId)
    .single()

  if (error || !appointment) {
    return { sent: false }
  }

  if (!appointment.customer.sms_consent || !appointment.customer.phone) {
    return { sent: false }
  }

  const dateStr = format(new Date(appointment.scheduled_at), 'EEEE, MMMM d')
  const timeStr = format(new Date(appointment.scheduled_at), 'h:mm a')

  const message = `GroomGroove: Reminder! ${appointment.dog.name}'s appointment is tomorrow:

📅 ${dateStr}
⏰ ${timeStr}
✂️ ${appointment.services.join(', ')}

See you soon! Questions? Call (555) 123-4567`

  const result = await smsProvider.send({
    to: appointment.customer.phone,
    body: message,
  })

  // Log reminder notification
  await supabase.from('sms_notifications').insert({
    appointment_id: appointmentId,
    type: 'reminder',
    delivered: result.success,
    user_id: user.id,
  })

  return { sent: result.success }
}

/**
 * Send confirmation success SMS
 */
export async function sendConfirmedSMS(
  phone: string,
  dogName: string,
  scheduledAt: string
): Promise<void> {
  const dateStr = format(new Date(scheduledAt), 'EEE, MMM d')
  const timeStr = format(new Date(scheduledAt), 'h:mm a')

  await smsProvider.send({
    to: phone,
    body: `GroomGroove: ✅ Confirmed! ${dogName}'s appointment is set for ${dateStr} at ${timeStr}.

We'll send a reminder 24 hours before. See you soon!`,
  })
}

/**
 * Send cancellation SMS
 */
export async function sendCancelledSMS(
  phone: string,
  scheduledAt: string
): Promise<void> {
  const dateStr = format(new Date(scheduledAt), 'EEE, MMM d')

  await smsProvider.send({
    to: phone,
    body: `GroomGroove: Your appointment for ${dateStr} has been cancelled.

To reschedule, call us at (555) 123-4567 or book online.`,
  })
}

/**
 * Send reschedule notification (when staff changes time)
 */
export async function sendRescheduleSMS(appointmentId: string): Promise<void> {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[SMS] User not authenticated')
    return
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`*, customer:customers(*), dog:dogs(*)`)
    .eq('id', appointmentId)
    .single()

  if (!appointment?.customer.phone || !appointment.customer.sms_consent) {
    return
  }

  const dateStr = format(new Date(appointment.scheduled_at), 'EEE, MMM d')
  const timeStr = format(new Date(appointment.scheduled_at), 'h:mm a')

  await smsProvider.send({
    to: appointment.customer.phone,
    body: `GroomGroove: Your appointment for ${appointment.dog.name} has been rescheduled to:

📅 ${dateStr} at ${timeStr}

Reply YES to confirm or NO to cancel.`,
  })

  // Log as new confirmation request
  await supabase.from('sms_notifications').insert({
    appointment_id: appointmentId,
    type: 'confirmation_request',
    user_id: user.id,
  })
}
