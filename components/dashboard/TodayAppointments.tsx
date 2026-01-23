"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createInvoiceFromAppointment } from "@/lib/actions/invoices";
import { format, isValid } from "date-fns";
import { safeParseDate } from "@/lib/utils/date";
import { Check, Clock, Play, XCircle } from "lucide-react";

// --- Internal Row Component ---
function AppointmentRow({ appointment }: { appointment: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(appointment.status);
  const [isLoading, setIsLoading] = useState(false);

  // Safe Date Formatting
  const dateObj = safeParseDate(appointment.scheduled_at);
  const timeString = dateObj && isValid(dateObj) ? format(dateObj, "h:mm a") : "Time N/A";

  const handleStatusUpdate = async (newStatus: string) => {
    if (isLoading) return;
    setIsLoading(true);

    // Optimistic Update
    setStatus(newStatus);

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointment.id);

      if (error) throw error;

      if (newStatus === "completed") {
        const invoice = await createInvoiceFromAppointment(appointment.id);
        router.push(`/invoices/${invoice.id}`);
        return;
      }

      router.refresh(); // Refresh to update the "Next Up" banner
    } catch (error) {
      console.error(error);
      alert("Update failed.");
      setStatus(appointment.status); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  // Status Colors & Icons
  const getStatusColor = (s: string) => {
    switch(s) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-6">
        {/* TIME */}
        <div className="text-gray-900 font-bold text-lg w-20 text-center bg-gray-50 p-2 rounded-lg border border-gray-200">
          {timeString}
        </div>

        {/* DETAILS */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{appointment.dog?.name || "Unknown Dog"}</h3>
          <p className="text-sm text-gray-500">{appointment.customer?.name || "Unknown Owner"} • {appointment.service_type || "Grooming"}</p>
          
          {/* BEHAVIOR TAGS */}
          <div className="flex gap-2 mt-1">
             {appointment.dog?.grooming_preferences?.behavior_notes && (
               <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                 ⚠️ {appointment.dog.grooming_preferences.behavior_notes}
               </span>
             )}
          </div>
        </div>
      </div>

      {/* STATUS DROPDOWN */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => handleStatusUpdate(e.target.value)}
          disabled={isLoading}
          className={`appearance-none pl-4 pr-10 py-2 rounded-lg font-bold text-sm border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 ${getStatusColor(status)}`}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">✂️ Grooming</option>
          <option value="completed">✅ Done</option>
          <option value="cancelled">❌ Cancel</option>
        </select>
        
        {/* Chevron Icon Override */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-current opacity-50">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
        </div>
      </div>
    </div>
  );
}

// --- Main List ---
export default function TodayAppointments({ appointments }: { appointments: any[] }) {
  if (!appointments || appointments.length === 0) {
    return <div className="text-gray-500 italic">No active appointments.</div>;
  }

  return (
    <div className="space-y-1">
      {appointments.map((appt) => (
        <AppointmentRow key={appt.id} appointment={appt} />
      ))}
    </div>
  );
}
