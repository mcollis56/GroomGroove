import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
// Make sure these match your actual icon imports and paths!
import { Calendar, Clock, Scissors } from "lucide-react";
import TodayAppointments from "@/components/dashboard/TodayAppointments";
import { GroomersTodayCard } from "@/components/dashboard/GroomersTodayCard";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { LocalDateTime } from "@/components/date/LocalDateTime";
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
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 23, 59, 59, 999));
  const [appointmentsResult, onDutyGroomers, offDutyGroomers] = await Promise.all([
    supabase.from("appointments")
      .select(`*, dog:dogs(id, name, grooming_preferences), customer:customers(id, name)`)
      .eq("user_id", user.id)
      .gte('scheduled_at', start.toISOString())
      .lt('scheduled_at', end.toISOString())
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[#FFFBF5]"> 
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Salon Dashboard</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-wide text-sm">
            <LocalDateTime
              value={new Date().toISOString()}
              kind="date"
              options={{ weekday: 'long', month: 'long', day: 'numeric' }}
            />
          </p>
        </div>
        <div className="bg-orange-100 text-orange-800 border-2 border-orange-200 px-5 py-2 rounded-full font-black text-sm shadow-sm transform -rotate-2">
          {remainingJobs} {remainingJobs === 1 ? 'DOG' : 'DOGS'} LEFT 🐾
        </div>
      </div>

      {nextJob ? (
        <div className="mb-8 bg-gradient-to-r from-indigo-700 via-purple-600 to-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-purple-200 border-b-8 border-indigo-900 transform transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-3 mb-4 text-purple-100 uppercase text-xs font-black tracking-widest">
            <Clock className="h-4 w-4" /> Next Up
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{nextJob.dog?.name || "Unknown Dog"}</h2>
              <p className="text-xl font-medium opacity-90 flex items-center gap-2">
                 {nextJob.service_type || "Full Groom"} <span className="opacity-50">•</span> {nextJob.customer?.name}
              </p>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <p className="text-3xl font-black tracking-tight">
                <LocalDateTime
                  value={nextJob.scheduled_at || nextJob.start_time}
                  kind="time"
                  options={{ hour: 'numeric', minute: '2-digit', hour12: true }}
                />
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-slate-100 rounded-3xl p-8 border-2 border-dashed border-slate-300 text-center">
           <p className="text-slate-400 font-bold text-lg">No upcoming jobs right now. Time for coffee? ☕️</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <LiveClock />
        
        <Link href="/calendar/new" className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col items-center justify-center hover:border-purple-400 hover:shadow-md transition-all group">
          <div className="bg-purple-50 p-4 rounded-full mb-3 group-hover:bg-purple-100 transition-colors">
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <span className="font-black text-slate-700 text-lg group-hover:text-purple-600">Book Appt</span>
        </Link>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-indigo-400 transition-all h-full">
             <GroomersTodayCard onDutyGroomers={onDutyGroomers} offDutyGroomers={offDutyGroomers} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
            <Scissors className="h-6 w-6 text-slate-400" />
            <h2 className="text-2xl font-black text-slate-900">Today&apos;s Run Sheet</h2>
        </div>
        
        {remainingJobs > 0 ? (
          <TodayAppointments appointments={appointments} />
        ) : (
          <div className="text-center py-12 text-slate-300">
            <p className="font-bold text-xl">All clear! No pending jobs for today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
