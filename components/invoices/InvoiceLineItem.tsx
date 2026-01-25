'use client'

import { useState } from "react";
import { updateInvoiceItem } from "@/lib/actions/invoices";

export default function InvoiceLineItem({ item }: { item: any }) {
  const [price, setPrice] = useState(item.unit_price);
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = async () => {
    if (price === item.unit_price) return; // No change
    setIsSaving(true);
    await updateInvoiceItem(item.id, parseFloat(price));
    setIsSaving(false);
    // Force a reload to update totals at the bottom
    window.location.reload(); 
  };

  return (
    <tr className="border-t border-gray-50">
      <td className="py-4">{item.description}</td>
      <td className="py-4 text-right text-gray-500">{item.quantity}</td>
      
      {/* EDITABLE PRICE INPUT */}
      <td className="py-4 text-right">
        <div className="flex justify-end items-center gap-1">
          <span className="text-gray-400">$</span>
          <input 
            type="number" 
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handleBlur}
            disabled={isSaving}
            className={`w-24 text-right font-medium text-gray-900 border-b border-dashed outline-none bg-transparent transition-all ${isSaving ? 'opacity-50' : 'focus:border-rose-500 border-gray-300'}`}
          />
        </div>
      </td>

      <td className="py-4 text-right font-bold text-gray-900">
        ${(item.quantity * (parseFloat(price) || 0)).toFixed(2)}
      </td>
    </tr>
  );
}
