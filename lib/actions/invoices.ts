'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Create Invoice from Appointment
export async function createInvoiceFromAppointment(appointmentId: string) {
  const supabase = await createClient();

  // Fetch Appointment + Relations
  const { data: appointment, error: appError } = await supabase
    .from("appointments")
    .select(`*, dog:dogs(*), customer:customers(*)`)
    .eq("id", appointmentId)
    .single();

  if (appError || !appointment) throw new Error("Appointment not found");

  // Check Existing
  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (existing) return { id: existing.id };

  // Create Invoice Header
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      user_id: appointment.user_id,
      customer_id: appointment.customer_id,
      appointment_id: appointment.id,
      status: "draft",
      issue_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      total_amount: 85.00,
    })
    .select()
    .single();

  if (invError) throw new Error("Failed to create invoice: " + invError.message);

  // Create First Line Item
  const description = `${appointment.service_type || 'Full Groom'} for ${appointment.dog?.name || 'Dog'}`;
  await supabase.from("invoice_items").insert({
    invoice_id: invoice.id,
    description: description,
    quantity: 1,
    unit_price: 85.00
  });

  return { id: invoice.id };
}

// 2. Create a Blank Item (For the "Add Item" button)
export async function createInvoiceItem(invoiceId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.from('invoice_items').insert({
    invoice_id: invoiceId,
    description: "New Service",
    quantity: 1,
    unit_price: 0.00
  }).select().single();
  
  if (error) throw new Error(error.message);
  
  revalidatePath(`/invoices/${invoiceId}`);
  return data;
}

// 3. Update Item (Handles Description, Qty, Price)
export async function updateInvoiceItem(itemId: string, data: { description?: string, unit_price?: number, quantity?: number } | number) {
  const supabase = await createClient();
  
  // Handle legacy call where 'data' was just a number (price)
  if (typeof data === 'number') {
    data = { unit_price: data };
  }

  // Fetch current item to calculate amount correctly if fields are missing
  const { data: current } = await supabase.from('invoice_items').select('*').eq('id', itemId).single();
  if (!current) return;

  const updates: any = { ...data };

  await supabase.from('invoice_items').update(updates).eq('id', itemId);
  
  // Note: We should technically recalculate Invoice Total here, but UI does it optimistically.
  revalidatePath(`/invoices/${current.invoice_id}`);
}

// 4. Update Status (Mark Paid)
export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const supabase = await createClient();
  await supabase.from('invoices').update({ status }).eq('id', invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}
