// SMS Webhook Handler
// Receives incoming SMS replies from customers (via Twilio)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { smsProvider } from '@/lib/sms/provider'
import { sendConfirmedSMS, sendCancelledSMS } from '@/lib/sms/send'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Parse incoming SMS (Twilio format)
  const formData = await request.formData()
  const from = formData.get('From') as string // Customer phone number
  const rawBody = formData.get('Body') as string

  // Normalize reply: trim whitespace and uppercase
  const body = rawBody?.trim().toUpperCase() || ''

  console.log('[SMS Webhook] From:', from, 'Body:', body)

  // STEP 1: Find customer by phone number
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', from)
    .single()

  if (customerError || !customer) {
    console.log('[SMS Webhook] Unknown phone number:', from)
    await smsProvider.send({
      to: from,
      body: 'GroomGroove: We could not find your account. Please call (555) 123-4567 for assistance.',
    })
    return new NextResponse('OK', { status: 200 })
  }

  // STEP 2: Find pending appointment(s) for this customer
  // If multiple, use the soonest one
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      dog:dogs(name)
    `)
    .eq('customer_id', customer.id)
    .eq('status', 'pending_confirmation')
    .order('scheduled_at', { ascending: true })
    .limit(1)

  const appointment = appointments?.[0]

  // STEP 3: Handle case where no pending appointment exists
  if (!appointment) {
    // Check if they have a confirmed appointment
    const { data: confirmedAppt } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('customer_id', customer.id)
      .eq('status', 'confirmed')
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single()

    if (confirmedAppt) {
      const dateStr = format(new Date(confirmedAppt.scheduled_at), 'EEE, MMM d')
      await smsProvider.send({
        to: from,
        body: `GroomGroove: Your appointment is already confirmed for ${dateStr}. See you then! Questions? Call (555) 123-4567`,
      })
    } else {
      await smsProvider.send({
        to: from,
        body: 'GroomGroove: No pending appointment found. Call (555) 123-4567 to schedule.',
      })
    }
    return new NextResponse('OK', { status: 200 })
  }

  // STEP 4: Process YES response
  if (body === 'YES' || body === 'Y' || body === 'CONFIRM') {
    await handleYesResponse(supabase, appointment, from)
    return new NextResponse('OK', { status: 200 })
  }

  // STEP 5: Process NO response
  if (body === 'NO' || body === 'N' || body === 'CANCEL') {
    await handleNoResponse(supabase, appointment, from)
    return new NextResponse('OK', { status: 200 })
  }

  // STEP 6: Unrecognized response
  await smsProvider.send({
    to: from,
    body: "GroomGroove: Sorry, I didn't understand. Reply YES to confirm or NO to cancel your appointment.",
  })

  return new NextResponse('OK', { status: 200 })
}

/**
 * Handle YES confirmation
 * - Check if appointment time has passed (reject if so)
 * - Update status to confirmed
 * - Send confirmation SMS
 */
async function handleYesResponse(
  supabase: any,
  appointment: any,
  phone: string
): Promise<void> {
  const appointmentTime = new Date(appointment.scheduled_at)
  const now = new Date()

  // EDGE CASE: Late confirmation - appointment time has passed
  if (appointmentTime < now) {
    await smsProvider.send({
      to: phone,
      body: 'GroomGroove: That appointment time has already passed. Please call (555) 123-4567 to reschedule.',
    })
    return
  }

  // Check if already confirmed (duplicate reply)
  if (appointment.status === 'confirmed') {
    const dateStr = format(appointmentTime, 'EEE, MMM d')
    const timeStr = format(appointmentTime, 'h:mm a')
    await smsProvider.send({
      to: phone,
      body: `GroomGroove: Your appointment is already confirmed for ${dateStr} at ${timeStr}. See you then!`,
    })
    return
  }

  // Update appointment status to confirmed
  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'confirmed',
      confirmed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', appointment.id)

  if (error) {
    console.error('[SMS Webhook] Failed to confirm appointment:', error)
    await smsProvider.send({
      to: phone,
      body: 'GroomGroove: Something went wrong. Please call (555) 123-4567 for assistance.',
    })
    return
  }

  // Log customer response
  await supabase
    .from('sms_notifications')
    .update({
      customer_response: 'YES',
      response_at: now.toISOString(),
    })
    .eq('appointment_id', appointment.id)
    .eq('type', 'confirmation_request')

  // Send confirmation success SMS
  const dog = Array.isArray(appointment.dog) ? appointment.dog[0] : appointment.dog
  await sendConfirmedSMS(phone, dog?.name || 'your pet', appointment.scheduled_at)
}

/**
 * Handle NO cancellation
 * - Update status to cancelled
 * - Send cancellation SMS
 */
async function handleNoResponse(
  supabase: any,
  appointment: any,
  phone: string
): Promise<void> {
  const now = new Date()

  // Check if already cancelled (duplicate reply)
  if (appointment.status === 'cancelled') {
    await smsProvider.send({
      to: phone,
      body: 'GroomGroove: This appointment was already cancelled. Call (555) 123-4567 to book a new one.',
    })
    return
  }

  // Update appointment status to cancelled
  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', appointment.id)

  if (error) {
    console.error('[SMS Webhook] Failed to cancel appointment:', error)
    await smsProvider.send({
      to: phone,
      body: 'GroomGroove: Something went wrong. Please call (555) 123-4567 for assistance.',
    })
    return
  }

  // Log customer response
  await supabase
    .from('sms_notifications')
    .update({
      customer_response: 'NO',
      response_at: now.toISOString(),
    })
    .eq('appointment_id', appointment.id)
    .eq('type', 'confirmation_request')

  // Send cancellation SMS
  await sendCancelledSMS(phone, appointment.scheduled_at)
}
