import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
// Make sure these match your actual icon imports and paths!
import { Plus, Calendar, Clock, Scissors, Sparkles } from "lucide-react";
import TodayAppointments from "@/components/dashboard/TodayAppointments";
import { GroomersTodayCard } from "@/components/dashboard/GroomersTodayCard";
import { formatTime } from "@/lib/utils/date";
import { getGroomersOnDuty, getGroomersOffDuty } from "@/lib/actions/groomers";

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const cookieStore = await cookies();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // --- SUBSCRIPTION CHECK ---
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) redirect("/pricing");
  if (new Date(subscription.current_period_end) < new Date()) redirect("/pricing?expired=true");

  // --- THE LOGIN FIX (Cookie Bypass) ---
  const hasOnboardingCookie = cookieStore.get("onboarding_complete")?.value === "true";

  let settings = null;

  if (!hasOnboardingCookie) {
    const { data } = await supabase
      .from("business_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    settings = data;
  } else {
    // Cookie says we are good -> Bypass DB check
    settings = { id: "cookie-bypass" };
  }

  // Fallback if really no settings
  if (!settings) {
    return redirect("/onboarding");
  }

  // --- DATA FETCHING ---
  const today = new Date().toISOString().split('T')[0];
  const [appointmentsResult, onDutyGroomers, offDutyGroomers] = await Promise.all([
    supabase.from("appointments")
      .select(`*, dog:dogs(id, name, grooming_preferences), customer:customers(id, name)`)
      .eq("user_id", user.id)
      .gte('scheduled_at', `${today}T00:00:00`)
      .lt('scheduled_at', `${today}T23:59:59`)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .order('scheduled_at', { ascending: true }),
    getGroomersOnDuty(),
    getGroomersOffDuty(),
  ]);

  const appointments = appointmentsResult.data || [];
  const remainingJobs = appointments.length;
  const nextJob = appointments[0];

  // --- RENDER DASHBOARD UI ---
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-[#FEFDFB]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Dashboard</h1>
          <p className="text-stone-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-full text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          {remainingJobs} {remainingJobs === 1 ? 'pup' : 'pups'} left today
        </div>
      </div>

      {/* Next Up Banner */}
      {nextJob ? (
        <div className="mb-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-teal-100 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Next Up
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-1">{nextJob.dog?.name || "Unknown Dog"}</h2>
              <p className="text-teal-100 flex items-center gap-2">
                {nextJob.service_type || "Full Groom"} <span className="opacity-50">·</span> {nextJob.customer?.name}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <p className="text-2xl font-bold tracking-tight">{formatTime(nextJob.scheduled_at)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-stone-50 rounded-2xl p-6 border border-stone-200 text-center">
          <p className="text-stone-400 font-medium">All clear! No upcoming appointments. Time for a coffee break?</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/calendar/new"
          className="group bg-white p-5 rounded-xl border border-stone-200 flex items-center gap-4 hover:border-teal-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
            <Plus className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <span className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">Add Dog</span>
            <p className="text-sm text-stone-500">Register a new pup</p>
          </div>
        </Link>

        <Link
          href="/calendar/new"
          className="group bg-white p-5 rounded-xl border border-stone-200 flex items-center gap-4 hover:border-orange-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <Calendar className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <span className="font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">Book Appointment</span>
            <p className="text-sm text-stone-500">Schedule a groom</p>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-xl border border-stone-200">
          <GroomersTodayCard onDutyGroomers={onDutyGroomers} offDutyGroomers={offDutyGroomers} />
        </div>
      </div>

      {/* Today's Run Sheet */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50">
          <Scissors className="h-5 w-5 text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900">Today&apos;s Run Sheet</h2>
        </div>

        <div className="p-6">
          {remainingJobs > 0 ? (
            <TodayAppointments appointments={appointments} />
          ) : (
            <div className="text-center py-12">
              <p className="text-stone-400 font-medium">No pending appointments for today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
