'use server'

import { createClient } from '@/utils/supabase/server'
import { generateReceiptNumber } from '@/lib/utils/receipt'
import { sendConfirmationSMS } from '@/lib/sms/send'

interface CheckoutInput {
  customerId: string
  dogId: string
  completedAppointmentId?: string
  services: string[]
  amountCents: number
  nextAppointment?: {
    scheduledAt: string
    services: string[]
  }
  reminderDate?: string
}

interface CheckoutResult {
  success: boolean
  paymentId?: string
  receiptNumber?: string
  nextAppointmentId?: string
  error?: string
}

export async function completeCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const supabase = await createClient()

  // --- FIX: GET CURRENT USER ID ---
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized: No user found' }
  }

  let nextAppointmentId: string | null = null

  try {
    // STEP 1: Create next appointment if proposed
    if (input.nextAppointment) {
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id, // <--- THIS WAS MISSING
          customer_id: input.customerId,
          dog_id: input.dogId,
          scheduled_at: input.nextAppointment.scheduledAt,
          status: 'pending_confirmation', // Or 'confirmed' if you prefer
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
        return { success: false, error: 'Failed to create next appointment: ' + apptError.message }
      }

      nextAppointmentId = appointment.id
    }

    // STEP 2: Generate receipt number
    const receiptNumber = generateReceiptNumber()

    // STEP 3: Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id, // <--- ALSO ADD HERE FOR SAFETY
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
      // Rollback
      if (nextAppointmentId) {
        await supabase.from('appointments').delete().eq('id', nextAppointmentId)
      }
      return { success: false, error: 'Failed to create payment: ' + paymentError.message }
    }

    // STEP 4: Mark completed appointment as done
    if (input.completedAppointmentId) {
      await supabase
        .from('appointments')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.completedAppointmentId)
    }

    // STEP 5: SMS
    if (nextAppointmentId) {
      sendConfirmationSMS({
        appointmentId: nextAppointmentId,
        customerId: input.customerId,
      }).catch(err => console.error('[Checkout] SMS send failed:', err))
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

// Keep your getReceiptData function below as is, or I can paste it if needed.
