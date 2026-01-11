'use server'

// Checkout Action
// Creates payment record and optional next appointment

import { createClient } from '@/utils/supabase/server'
import { generateReceiptNumber } from '@/lib/utils/receipt'
import { sendConfirmationSMS } from '@/lib/sms/send'

interface CheckoutInput {
  customerId: string
  dogId: string
  completedAppointmentId?: string // The appointment just finished (optional)
  services: string[]
  amountCents: number
  nextAppointment?: {
    scheduledAt: string // ISO datetime
    services: string[]
  }
  reminderDate?: string // YYYY-MM-DD format for SMS reminder
}

interface CheckoutResult {
  success: boolean
  paymentId?: string
  receiptNumber?: string
  nextAppointmentId?: string
  error?: string
}

/**
 * Complete checkout process:
 * 1. Mark current appointment as completed
 * 2. Create payment record
 * 3. Optionally create next appointment with reminder date
 * 4. Send confirmation SMS if next appointment created
 */
export async function completeCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const supabase = await createClient()

  let nextAppointmentId: string | null = null

  try {
    // STEP 1: Create next appointment if proposed
    if (input.nextAppointment) {
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .insert({
          customer_id: input.customerId,
          dog_id: input.dogId,
          scheduled_at: input.nextAppointment.scheduledAt,
          status: 'pending_confirmation',
          services: input.nextAppointment.services,
          reminder_date: input.reminderDate || null,
          reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (apptError) {
        console.error('[Checkout] Failed to create appointment:', apptError)
        return { success: false, error: 'Failed to create next appointment' }
      }

      nextAppointmentId = appointment.id
    }

    // STEP 2: Generate receipt number
    const receiptNumber = generateReceiptNumber()

    // STEP 3: Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        customer_id: input.customerId,
        appointment_id: input.completedAppointmentId || null,
        next_appointment_id: nextAppointmentId,
        amount_cents: input.amountCents,
        services: input.services,
        receipt_number: receiptNumber,
        reminder_date: input.reminderDate || null,
        paid_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (paymentError) {
      console.error('[Checkout] Failed to create payment:', paymentError)
      // Rollback: delete appointment if payment failed
      if (nextAppointmentId) {
        await supabase.from('appointments').delete().eq('id', nextAppointmentId)
      }
      return { success: false, error: 'Failed to create payment' }
    }

    // STEP 4: Mark completed appointment as done (if provided)
    if (input.completedAppointmentId) {
      await supabase
        .from('appointments')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.completedAppointmentId)
    }

    // STEP 5: Send confirmation SMS for next appointment
    if (nextAppointmentId) {
      // Fire and forget - don't block checkout on SMS
      sendConfirmationSMS({
        appointmentId: nextAppointmentId,
        customerId: input.customerId,
      }).catch(err => {
        console.error('[Checkout] SMS send failed:', err)
      })
    }

    return {
      success: true,
      paymentId: payment.id,
      receiptNumber,
      nextAppointmentId: nextAppointmentId || undefined,
    }
  } catch (error: unknown) {
    console.error('[Checkout] Unexpected error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get receipt data for display/printing
 */
export async function getReceiptData(paymentId: string) {
  const supabase = await createClient()

  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      *,
      customer:customers(*),
      next_appointment:appointments!next_appointment_id(
        *,
        dog:dogs(*)
      )
    `)
    .eq('id', paymentId)
    .single()

  if (error || !payment) {
    return null
  }

  const customer = Array.isArray(payment.customer) ? payment.customer[0] : payment.customer
  const nextAppt = Array.isArray(payment.next_appointment) ? payment.next_appointment[0] : payment.next_appointment

  return {
    receiptNumber: payment.receipt_number,
    customerName: customer?.name,
    services: payment.services,
    amountCents: payment.amount_cents,
    paidAt: payment.paid_at,
    nextAppointment: nextAppt ? {
      scheduledAt: nextAppt.scheduled_at,
      dogName: nextAppt.dog?.name,
      services: nextAppt.services,
      status: nextAppt.status,
      reminderDate: nextAppt.reminder_date,
    } : null,
  }
}
