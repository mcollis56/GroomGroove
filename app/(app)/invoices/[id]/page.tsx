import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import InvoiceEditor from "@/components/invoices/InvoiceEditor"; // Ensure path is correct

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  // 1. Fetch Invoice with Items, Customer, and Dog details
  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      items:invoice_items(*),
      customer:customers(*),
      appointment:appointments(
        *,
        dog:dogs(*)
      )
    `)
    .eq("id", params.id)
    .single();

  if (!invoice) {
    // Fallback: this might be an appointment id from older links
    const { data: byAppointment } = await supabase
      .from("invoices")
      .select("id")
      .eq("appointment_id", params.id)
      .maybeSingle();

    if (byAppointment?.id) {
      return redirect(`/invoices/${byAppointment.id}`);
    }

    return notFound();
  }

  // 2. Pass data to the Client Component
  return <InvoiceEditor invoice={invoice} />;
}
