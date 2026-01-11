// Reminder Cron Job
// Runs every 15 minutes to send 1-hour reminders for upcoming appointments
// Vercel cron runs this automatically - see vercel.json

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendReminderSMS } from '@/lib/sms/send'

export async function GET(request: NextRequest) {
  // 🔐 SECURITY CHECK — MUST BE FIRST
  // In development, allow without auth for testing
  const authHeader = request.headers.get('authorization')
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date()

  // Calculate 1-hour window (45 min to 75 min from now)
  // This gives a 30-minute window to catch appointments
  const windowStart = new Date(now.getTime() + 45 * 60 * 1000) // 45 min from now
  const windowEnd = new Date(now.getTime() + 75 * 60 * 1000)   // 75 min from now

  console.log('[Cron] Checking 1-hour reminders for window:', windowStart.toISOString(), 'to', windowEnd.toISOString())

  // Find appointments in the 1-hour window (any status except cancelled/completed)
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      customer:customers(id, phone, sms_consent)
    `)
    .in('status', ['pending_confirmation', 'confirmed']) // Not cancelled or completed
    .gte('scheduled_at', windowStart.toISOString())
    .lte('scheduled_at', windowEnd.toISOString())

  if (error) {
    console.error('[Cron] Failed to fetch appointments:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!appointments || appointments.length === 0) {
    console.log('[Cron] No appointments in reminder window')
    return NextResponse.json({ sent: 0, checked: 0, message: 'No appointments in 1-hour window' })
  }

  let sentCount = 0
  let skippedCount = 0
  const results: { id: string; status: string }[] = []

  for (const appointment of appointments) {
    // Handle Supabase relation (may be array or object)
    const customer = Array.isArray(appointment.customer)
      ? appointment.customer[0]
      : appointment.customer

    // Skip if no SMS consent or phone
    if (!customer?.sms_consent || !customer?.phone) {
      skippedCount++
      results.push({ id: appointment.id, status: 'skipped_no_contact' })
      continue
    }

    // Check if reminder already sent (prevent duplicates)
    const { data: existingReminder } = await supabase
      .from('sms_notifications')
      .select('id')
      .eq('appointment_id', appointment.id)
      .eq('type', 'reminder')
      .maybeSingle()

    if (existingReminder) {
      console.log('[Cron] Reminder already sent for appointment:', appointment.id)
      skippedCount++
      results.push({ id: appointment.id, status: 'already_sent' })
      continue
    }

    // Send reminder
    const result = await sendReminderSMS(appointment.id)

    if (result.sent) {
      sentCount++
      results.push({ id: appointment.id, status: 'sent' })
      console.log('[Cron] Sent reminder for appointment:', appointment.id)
    } else {
      results.push({ id: appointment.id, status: 'failed' })
      console.log('[Cron] Failed to send reminder for appointment:', appointment.id)
    }
  }

  console.log(`[Cron] Complete. Sent: ${sentCount}, Skipped: ${skippedCount}`)

  return NextResponse.json({
    sent: sentCount,
    skipped: skippedCount,
    checked: appointments.length,
    results,
  })
}
