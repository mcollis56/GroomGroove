'use server'

import { createClient } from '@/utils/supabase/server'

export async function createInvoiceFromAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { data: appointment, error: appError } = await supabase
    .from('appointments')
    .select(`*, dog:dogs(*), customer:customers(*)`)
    .eq('id', appointmentId)
    .single()

  if (appError || !appointment) throw new Error('Appointment not found')

  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('appointment_id', appointmentId)
    .maybeSingle()

  if (existing) {
    return { id: existing.id }
  }

  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      user_id: appointment.user_id,
      customer_id: appointment.customer_id,
      appointment_id: appointment.id,
      status: 'draft',
      issue_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      total_amount: 85.0
    })
    .select()
    .single()

  if (invError || !invoice) throw new Error('Failed to create invoice: ' + invError?.message)

  const { error: itemError } = await supabase.from('invoice_items').insert({
    invoice_id: invoice.id,
    description: `${appointment.service_type || 'Full Groom'} for ${appointment.dog?.name || 'Unknown Dog'}`,
    quantity: 1,
    unit_price: 85.0,
    amount: 85.0
  })

  if (itemError) console.error('Error creating line item:', itemError)

  return { id: invoice.id }
}
