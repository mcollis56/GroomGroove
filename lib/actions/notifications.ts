'use server'

import { createClient } from '@/utils/supabase/server'
import { sendReminderSMS } from '@/lib/sms/send'
import { revalidatePath } from 'next/cache'
import { safeParseDate } from '@/lib/utils/date'

export interface TodayAppointment {
  id: string
  scheduledAt: string
  clientName: string
  clientPhone: string | null
  dogName: string
  services: string[]
  status: string
  reminderSent: boolean
  hasConsent: boolean
  isPast: boolean
}

/**
 * Get today's appointments with reminder status
 */
export async function getTodaysAppointments(): Promise<TodayAppointment[]> {
  const supabase = await createClient()

  // Get today's date range
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  // Fetch today's appointments
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      services,
      customer:customers(id, name, phone, sms_consent),
      dog:dogs(id, name)
    `)
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', todayEnd.toISOString())
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Notifications] Failed to fetch today\'s appointments:', error)
    return []
  }

  if (!appointments || appointments.length === 0) {
    return []
  }

  // Get which appointments already have reminders sent
  const appointmentIds = appointments.map(a => a.id)
  const { data: sentReminders } = await supabase
    .from('sms_notifications')
    .select('appointment_id')
    .in('appointment_id', appointmentIds)
    .eq('type', 'reminder')

  const sentSet = new Set(sentReminders?.map(r => r.appointment_id) || [])

  // Transform to our interface
  return appointments.map(appt => {
    const customer = Array.isArray(appt.customer) ? appt.customer[0] : appt.customer
    const dog = Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
    const appointmentTime = safeParseDate(appt.scheduled_at)

    return {
      id: appt.id,
      scheduledAt: appt.scheduled_at,
      clientName: customer?.name || 'Unknown Client',
      clientPhone: customer?.phone || null,
      dogName: dog?.name || 'Unknown Dog',
      services: appt.services || [],
      status: appt.status,
      reminderSent: sentSet.has(appt.id),
      hasConsent: customer?.sms_consent || false,
      isPast: appointmentTime ? appointmentTime < now : false,
    }
  })
}

/**
 * Manually send a reminder for a specific appointment
 */
export async function sendManualReminder(appointmentId: string): Promise<{
  success: boolean
  error?: string
}> {
  const result = await sendReminderSMS(appointmentId)

  if (result.sent) {
    revalidatePath('/notifications')
    return { success: true }
  }

  return { success: false, error: 'Failed to send reminder' }
}

/**
 * Get stats for today's reminders
 */
export async function getTodayStats(): Promise<{
  totalAppointments: number
  remindersSent: number
  upcoming: number
  completed: number
}> {
  const appointments = await getTodaysAppointments()

  const now = new Date()
  const remindersSent = appointments.filter(a => a.reminderSent).length
  const upcoming = appointments.filter(a => {
    const aptTime = safeParseDate(a.scheduledAt)
    return aptTime && aptTime > now && a.status !== 'completed'
  }).length
  const completed = appointments.filter(a => a.status === 'completed').length

  return {
    totalAppointments: appointments.length,
    remindersSent,
    upcoming,
    completed,
  }
}

/**
 * Get recent SMS activity
 */
export async function getRecentActivity(limit = 5): Promise<{
  id: string
  type: string
  clientName: string
  dogName: string
  createdAt: string
  delivered: boolean
}[]> {
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from('sms_notifications')
    .select('id, type, appointment_id, delivered, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !notifications || notifications.length === 0) {
    return []
  }

  // Get appointment details
  const appointmentIds = notifications.map(n => n.appointment_id)
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`id, customer:customers(name), dog:dogs(name)`)
    .in('id', appointmentIds)

  const apptMap = new Map<string, { clientName: string; dogName: string }>()
  if (appointments) {
    for (const appt of appointments) {
      const customer = Array.isArray(appt.customer) ? appt.customer[0] : appt.customer
      const dog = Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
      apptMap.set(appt.id, {
        clientName: (customer as { name?: string })?.name || 'Unknown',
        dogName: (dog as { name?: string })?.name || 'Unknown',
      })
    }
  }

  return notifications.map(n => {
    const info = apptMap.get(n.appointment_id) || { clientName: 'Unknown', dogName: 'Unknown' }
    return {
      id: n.id,
      type: n.type,
      clientName: info.clientName,
      dogName: info.dogName,
      createdAt: n.created_at,
      delivered: n.delivered ?? true,
    }
  })
}
