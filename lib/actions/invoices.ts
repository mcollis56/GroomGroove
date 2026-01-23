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

export async function updateInvoiceItem(itemId: string, price: number) {
  const supabase = await createClient()

  const { data: item, error: updateError } = await supabase
    .from('invoice_items')
    .update({
      unit_price: price,
      amount: price
    })
    .eq('id', itemId)
    .select('id, invoice_id')
    .single()

  if (updateError || !item) {
    throw new Error('Failed to update invoice item: ' + updateError?.message)
  }

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('amount')
    .eq('invoice_id', item.invoice_id)

  if (!itemsError && items) {
    const totalAmount = items.reduce((sum, line) => sum + (line.amount || 0), 0)
    await supabase
      .from('invoices')
      .update({ total_amount: totalAmount })
      .eq('id', item.invoice_id)
  }

  return { success: true, invoiceId: item.invoice_id }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)

  if (error) {
    throw new Error('Failed to update invoice status: ' + error.message)
  }

  return { success: true }
}
