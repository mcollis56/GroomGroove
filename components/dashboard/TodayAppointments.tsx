"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

// --- Internal Component for the Row ---
function AppointmentRow({ appointment }: { appointment: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(appointment.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (isLoading) return;
    setIsLoading(true);
    
    // 1. Optimistic Update (Instant Color Change)
    setStatus(newStatus);

    try {
      // 2. Update Database
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointment.id);

      if (error) throw error;

      // 3. Handle Navigation if Finishing
      if (newStatus === 'completed') {
         router.push(`/checkout/${appointment.id}`);
      } else {
         router.refresh(); 
      }
    } catch (error) {
      alert("Update failed.");
      setStatus(appointment.status); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  // Button Logic
  let buttonUI;
  if (status === 'pending' || status === 'confirmed') {
    buttonUI = (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusUpdate('in_progress'); }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
      >
        {isLoading ? "..." : "Start Grooming"}
      </button>
    );
  } else if (status === 'in_progress') {
    buttonUI = (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusUpdate('completed'); }}
        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg animate-pulse"
      >
        {isLoading ? "..." : "Finish & Pay"}
      </button>
    );
  } else {
    buttonUI = (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
        COMPLETED
      </span>
    );
  }

  // --- Render Row ---
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-gray-500 font-medium w-16">
          {format(new Date(appointment.scheduled_at), "h:mm a")}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{appointment.dog?.name || "Unknown Dog"}</h3>
          <p className="text-sm text-gray-500">{appointment.customer?.name || "Unknown Owner"}</p>
          {/* Tags */}
          <div className="flex gap-2 mt-1">
             {appointment.dog?.grooming_preferences?.behavior_notes && (
               <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                 {appointment.dog.grooming_preferences.behavior_notes}
               </span>
             )}
          </div>
        </div>
      </div>
      <div>{buttonUI}</div>
    </div>
  );
}

// --- Main List Component ---
export default function TodayAppointments({ appointments }: { appointments: any[] }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No appointments scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Today's Appointments</h2>
        <span className="text-sm text-gray-500">{appointments.length} scheduled</span>
      </div>
      <div className="space-y-2">
        {appointments.map((appt) => (
          <AppointmentRow key={appt.id} appointment={appt} />
        ))}
      </div>
    </div>
  );
}
