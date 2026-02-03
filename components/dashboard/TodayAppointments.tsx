'use client';

import { createClient } from '@/utils/supabase/client';
import { formatTime, getLocalDateKey, getLocalTodayDate } from '@/lib/utils/date';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createInvoiceFromAppointment } from '@/lib/actions/invoices';

// --- SYDNEY TIME HELPER (Inline for safety) ---
function isLocalToday(dateString: string) {
  if (!dateString) return false;
  const dateKey = getLocalDateKey(dateString)
  return dateKey === getLocalTodayDate()
}

export default function TodayAppointments({ appointments }: { appointments: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 1. FILTER: Only show appointments for TODAY in Sydney
  const todaysAppointments = appointments.filter(app => {
    const scheduledAt = app.scheduled_at || app.start_time
    return isLocalToday(scheduledAt)
  }).sort((a, b) => {
    const aTime = new Date(a.scheduled_at || a.start_time).getTime()
    const bTime = new Date(b.scheduled_at || b.start_time).getTime()
    return aTime - bTime
  });

  // 2. UPDATE STATUS
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    setLoadingId(appointmentId);
    
    // Optimistic UI update could go here, but for now we trust the refresh
    await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (newStatus === 'completed') {
      try {
        const { id } = await createInvoiceFromAppointment(appointmentId);
        router.push(`/invoices/${id}`);
      } catch {
        router.refresh();
        setLoadingId(null);
      }
      return;
    }

    router.refresh();
    setLoadingId(null);
  };

  if (todaysAppointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
        <p className="text-gray-500">No appointments scheduled for today.</p>
        <Link href="/calendar/new" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">
          Book an appointment
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todaysAppointments.map((app) => {
        const normalizedStatus = app.status === 'pending' ? 'pending_confirmation' : app.status;
        const isCompleted = app.status === 'completed';
        const isGrooming = app.status === 'in_progress';
        
        return (
          <div key={app.id} className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 flex items-center justify-between">
            {/* LEFT: Time & Dog Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 text-center">
                <span className="block text-lg font-bold text-gray-900">
                  {formatTime(app.scheduled_at || app.start_time)}
                </span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {app.service_type || 'Groom'}
                </span>
              </div>
              
              <div className="h-10 w-px bg-gray-100 mx-2"></div>

              <div>
                <Link href={`/dogs/${app.dog_id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  {app.dog?.name || 'Unknown Dog'}
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{app.dog?.breed || 'Mixed Breed'}</span>
                  {app.dog?.is_new_dog && (
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Status Dropdown */}
            <div className="relative">
              <select
                disabled={loadingId === app.id}
                value={normalizedStatus}
                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                className={`
                  appearance-none cursor-pointer pl-4 pr-8 py-2 rounded-full text-sm font-bold border-0 transition-all focus:ring-2 focus:ring-offset-1
                  ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                  ${isGrooming ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 animate-pulse' : ''}
                  ${!isCompleted && !isGrooming ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
                `}
              >
                <option value="pending_confirmation">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">Grooming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              {/* Custom Arrow Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-current opacity-60">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
