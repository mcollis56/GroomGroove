import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { updateInvoiceItem, updateInvoiceStatus } from '@/lib/actions/invoices'

interface InvoicePageProps {
  params: { id: string }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id,
      status,
      issue_date,
      total_amount,
      customer:customers(name),
      items:invoice_items(id, description, quantity, unit_price, amount)
    `)
    .eq('id', params.id)
    .single()

  if (error || !invoice) return notFound()

  const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-500">Invoice #{invoice.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-semibold text-gray-900">{customer?.name || 'Unknown Customer'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
        <p>Status: {invoice.status}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end items-center gap-1">
                    <span>$</span>
                    <input
                      type="number"
                      defaultValue={item.unit_price}
                      onBlur={async (e) => {
                        const value = Number(e.target.value)
                        if (!Number.isNaN(value)) {
                          await updateInvoiceItem(item.id, value)
                        }
                      }}
                      className="w-20 text-right border-b border-transparent hover:border-gray-300 focus:border-rose-500 outline-none bg-transparent transition-colors"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">${item.amount?.toFixed?.(2) ?? item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end px-4 py-4 text-right">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">${invoice.total_amount?.toFixed?.(2) ?? invoice.total_amount}</p>
          </div>
        </div>
      </div>

      <form
        action={async () => {
          'use server'
          await updateInvoiceStatus(invoice.id, 'paid')
        }}
      >
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
        >
          Save / Mark Paid
        </button>
      </form>
    </div>
  )
}
