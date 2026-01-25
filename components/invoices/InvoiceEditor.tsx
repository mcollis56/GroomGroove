'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateInvoiceItem, updateInvoiceStatus, createInvoiceItem } from "@/lib/actions/invoices";
import { Loader2, ArrowLeft, Check, Printer, Mail, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

// --- PARENT COMPONENT ---
export default function InvoiceEditor({ invoice }: { invoice: any }) {
  const router = useRouter();
  const [items, setItems] = useState(invoice.items || []);
  const [status, setStatus] = useState(invoice.status);
  const [taxRate, setTaxRate] = useState(0.10);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with props when server refreshes (Fixes calc lag)
  useEffect(() => {
    setItems(invoice.items);
  }, [invoice.items]);

  // Recalculate totals
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Email handler for Receipt Mode
  const handleEmail = () => {
    const clientEmail = invoice.customer?.email;
    const clientName = invoice.customer?.name || "Customer";
    const invNumber = invoice.invoice_number;
    const businessName = "Groom Groove";

    if (!clientEmail) {
      alert("This client has no email address saved.");
      return;
    }

    const subject = `Invoice #${invNumber} from ${businessName}`;
    const body = `Hi ${clientName},%0D%0A%0D%0APlease find your invoice #${invNumber} attached.%0D%0A%0D%0AThank you for your business!%0D%0A%0D%0A${businessName}`;

    window.location.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  // RECEIPT MODE - Show formatted receipt when paid
  if (status === 'paid') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {/* Print-only header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Receipt</h1>
          <p className="text-gray-500 mt-1">Invoice #{invoice.invoice_number}</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200 flex items-center gap-2">
            <Check className="w-4 h-4" /> PAID
          </span>
        </div>

        {/* Customer & Date Info */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-semibold text-gray-900">{invoice.customer?.name || 'Customer'}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Date</p>
            <p className="font-medium text-gray-900">
              <span suppressHydrationWarning>
                {new Date(invoice.issue_date).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-4 text-gray-900">{item.description}</td>
                  <td className="px-4 py-4 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-4 text-right text-gray-600">${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="bg-gray-50 px-4 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax ({taxRate * 100}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden in print */}
        <div className="flex gap-3 no-print">
          <Link href="/dashboard" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
          <button
            onClick={handleEmail}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* Thank you message */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          Thank you for your business!
        </p>
      </div>
    );
  }

  const handleAddItem = async () => {
    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setItems([...items, { id: tempId, description: "New Item", quantity: 1, unit_price: 0, amount: 0 }]);
    
    // Server Create
    await createInvoiceItem(invoice.id);
    router.refresh(); // Fetch real data
  };

  const handleMarkPaid = async () => {
    setIsSaving(true);
    await updateInvoiceStatus(invoice.id, 'paid');
    setStatus('paid');
    setIsSaving(false);
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
              {status === 'paid' && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">PAID</span>
              )}
            </div>
            <p className="text-gray-500">
              <span suppressHydrationWarning>
                {new Date(invoice.issue_date).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Invoice Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none">
        
        {/* Service Details */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-lg font-semibold">Services</h2>
            {status !== 'paid' && (
              <button onClick={handleAddItem} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-100">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )}
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-4 font-medium w-1/2">Description</th>
                <th className="pb-4 text-right font-medium">Qty</th>
                <th className="pb-4 text-right font-medium">Price</th>
                <th className="pb-4 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item: any) => (
                <InvoiceLineItem 
                  key={item.id} 
                  item={item} 
                  isEditable={status !== 'paid'} 
                  onSave={() => router.refresh()} // Refresh parent on save
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Total */}
        <div className="bg-gray-50 p-8 flex justify-end print:bg-white">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-gray-500 items-center">
              <span className="flex items-center gap-2">
                Tax ({taxRate * 100}%)
                {status !== 'paid' && (
                  <button onClick={() => setTaxRate(taxRate === 0 ? 0.10 : 0)} className="text-xs text-blue-500 underline no-print">
                    {taxRate === 0 ? 'Add' : 'Remove'}
                  </button>
                )}
              </span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            {status !== 'paid' ? (
              <button 
                onClick={handleMarkPaid}
                disabled={isSaving}
                className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm no-print"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Mark as Paid
              </button>
            ) : (
              <div className="mt-6 text-center text-green-600 font-medium flex items-center justify-center gap-2 border border-green-200 bg-green-50 py-2 rounded-lg no-print">
                <Check className="w-4 h-4" /> Paid on {new Date().toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CHILD COMPONENT ---
function InvoiceLineItem({ item, isEditable, onSave }: { item: any, isEditable: boolean, onSave: () => void }) {
  const [desc, setDesc] = useState(item.description);
  const [price, setPrice] = useState(item.unit_price);
  const [qty, setQty] = useState(item.quantity);

  const handleBlur = async () => {
    // Only save if changed
    if (desc === item.description && price === item.unit_price && qty === item.quantity) return;
    
    await updateInvoiceItem(item.id, { description: desc, unit_price: parseFloat(price), quantity: parseInt(qty) });
    onSave(); // Trigger parent refresh to fix math lag!
  };

  if (!isEditable) {
    return (
      <tr>
        <td className="py-4">{desc}</td>
        <td className="py-4 text-right">{qty}</td>
        <td className="py-4 text-right">${parseFloat(price).toFixed(2)}</td>
        <td className="py-4 text-right font-bold">${(qty * price).toFixed(2)}</td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="py-4">
        <input 
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleBlur}
          className="w-full font-medium text-gray-900 border-b border-dashed border-transparent hover:border-gray-300 focus:border-blue-500 outline-none bg-transparent"
        />
      </td>
      <td className="py-4 text-right">
        <input 
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={handleBlur}
          className="w-12 text-right text-gray-500 border-b border-dashed border-transparent hover:border-gray-300 focus:border-blue-500 outline-none bg-transparent"
        />
      </td>
      <td className="py-4 text-right">
        <div className="flex justify-end items-center gap-1">
          <span className="text-gray-400">$</span>
          <input 
            type="number" 
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handleBlur}
            className="w-24 text-right font-medium text-gray-900 border-b border-dashed border-gray-300 focus:border-blue-500 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </td>
      <td className="py-4 text-right font-bold text-gray-900">
        ${(qty * (parseFloat(price) || 0)).toFixed(2)}
      </td>
    </tr>
  );
}
