import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TodayAppointments from "@/components/dashboard/TodayAppointments";
import { GroomersTodayCard } from "@/components/dashboard/GroomersTodayCard";
import Link from "next/link";
import { Plus, Calendar, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { getGroomersOnDuty, getGroomersOffDuty } from "@/lib/actions/groomers";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Subscription Check (Latest Active)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) redirect("/pricing");
  
  const expiry = new Date(subscription.current_period_end);
  if (expiry < new Date()) redirect("/pricing?expired=true");


  // 2. DATA FETCHING - LOCKED TO USER_ID
  const today = new Date().toISOString().split('T')[0];
  
  const [appointmentsResult, onDutyGroomers, offDutyGroomers] = await Promise.all([
    supabase
      .from("appointments")
      .select(`*, dog:dogs(id, name, grooming_preferences), customer:customers(id, name)`)
      .eq("user_id", user.id) // <--- CRITICAL SECURITY LOCK
      .gte('scheduled_at', `${today}T00:00:00`)
      .lt('scheduled_at', `${today}T23:59:59`)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .order('scheduled_at', { ascending: true }),
    getGroomersOnDuty(),
    getGroomersOffDuty(),
  ]);

  const appointments = appointmentsResult.data;
  const remainingJobs = appointments?.length || 0;
  const nextJob = appointments?.[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salon Dashboard</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full font-bold">
           {remainingJobs} Dogs Remaining
        </div>
      </div>

      {/* Next Up */}
      {nextJob ? (
        <div className="mb-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2 text-rose-100 uppercase text-xs font-bold tracking-wider">
            <Clock className="h-4 w-4" /> Next Up
          </div>
          <div className="flex justify-between items-end">
             <div>
                <h2 className="text-3xl font-bold">{nextJob.dog?.name}</h2>
                <p className="text-lg opacity-90">{nextJob.customer?.name} • {nextJob.service_type || "Full Groom"}</p>
             </div>
             <div className="text-right">
                <p className="text-3xl font-bold">{formatTime(nextJob.scheduled_at)}</p>
             </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* CHANGED LINK TO /calendar/new (The Fixed Form) */}
        <Link href="/calendar/new" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:border-rose-300 transition-colors group">
          <div className="bg-rose-50 p-3 rounded-full mb-2 group-hover:bg-rose-100"><Plus className="h-6 w-6 text-rose-600" /></div>
          <span className="font-semibold text-gray-700">Add Dog</span>
        </Link>
        <Link href="/calendar/new" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:border-rose-300 transition-colors group">
          <div className="bg-rose-50 p-3 rounded-full mb-2 group-hover:bg-rose-100"><Calendar className="h-6 w-6 text-rose-600" /></div>
          <span className="font-semibold text-gray-700">Book Appt</span>
        </Link>
        <GroomersTodayCard
          onDutyGroomers={onDutyGroomers}
          offDutyGroomers={offDutyGroomers}
        />
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today&apos;s Schedule</h2>
        {remainingJobs > 0 ? (
          <TodayAppointments appointments={appointments || []} />
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>All clear! No pending jobs for today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
