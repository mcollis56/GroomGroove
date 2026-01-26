import Link from "next/link";
import Image from "next/image"; 
// FIXED: Changed to lowercase 'button' to match standard file naming and fix Vercel build
import { Button } from "@/components/ui/button"; 
import { Check, Smartphone, Clock, ShieldCheck, ArrowRight, HelpCircle, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FFFBF5] text-slate-900 selection:bg-orange-200">
      
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-24 flex items-center justify-between sticky top-0 bg-[#FFFBF5]/95 backdrop-blur-md z-50 transition-all">
        <Link className="flex items-center gap-2 group" href="/">
          <span className="font-black text-3xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-orange-500 transform group-hover:-rotate-2 transition-transform duration-300">
            GroomGroove
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 items-center">
             <Link className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors uppercase tracking-wide" href="#features">Features</Link>
             <Link className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors uppercase tracking-wide" href="#pricing">Pricing</Link>
             <Link className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wide" href="#faq">FAQ</Link>
          </nav>
          
          {user ? (
             <Link href="/dashboard">
               <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 font-bold shadow-lg hover:shadow-xl transition-all">
                 Go to Dashboard
               </Button>
             </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link className="text-sm font-black text-slate-900 hover:text-purple-600 hidden sm:block uppercase tracking-wide" href="/login">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black">
                  Start Trial
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 overflow-hidden relative">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>

          <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
            <div className="inline-flex items-center rounded-full border-2 border-black bg-yellow-300 px-4 py-1.5 text-sm font-black text-black mb-8 transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <Star className="h-4 w-4 mr-2 fill-black" />
              NEW: SMS Reminders Included!
            </div>
            
            <h1 className="text-6xl font-black tracking-tighter sm:text-7xl md:text-8xl text-slate-900 mb-8 leading-[0.9]">
              More Wags. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500">
                Less Paperwork.
              </span>
            </h1>
            
            <p className="mx-auto max-w-[800px] text-slate-600 md:text-2xl mb-12 leading-relaxed font-medium">
              Stop chasing no-shows and drowning in admin. Run your salon on autopilot with the app that has <span className="font-bold text-indigo-600">soul</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link href="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-10 rounded-full text-xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto flex items-center gap-3">
                  Start 14-Day Free Trial
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" className="h-16 px-10 rounded-full text-xl font-bold border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white w-full sm:w-auto bg-transparent">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-wide">
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> No credit card required</div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Cancel anytime</div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 24/7 Support</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 bg-white border-y-2 border-slate-100">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 sm:text-5xl mb-6">Run your salon on <span className="text-purple-600 underline decoration-wavy decoration-orange-400">Autopilot</span></h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">We handle the boring admin stuff so you can focus on making dogs look awesome.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-[#FFFBF5] rounded-3xl border-2 border-slate-100 hover:border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900">Smart Scheduling</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Drag-and-drop calendar designed for groomers. Color-code by appointment type (Bath, Full Groom, Nails) and never double-book again.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="group p-8 bg-[#FFFBF5] rounded-3xl border-2 border-slate-100 hover:border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Smartphone className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900">SMS Reminders</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  We automatically text your clients 24 hours before their appointment. Reduce no-shows by 80% instantly.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="group p-8 bg-[#FFFBF5] rounded-3xl border-2 border-slate-100 hover:border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900">Dog Profiles</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Save blade lengths, shampoo preferences, and vet notes. Next time Bella comes in, you know exactly what to do.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black tracking-tight sm:text-6xl mb-4">Simple Pricing. <span className="text-orange-400">Big Value.</span></h2>
               <p className="text-xl text-slate-400 font-medium">One plan. Everything included. No hidden fees.</p>
            </div>
            
            <div className="max-w-lg mx-auto bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 border-4 border-indigo-500 relative">
               <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-black px-3 py-1 uppercase tracking-widest border-l-2 border-b-2 border-black">
                 Best Value
               </div>

               <div className="bg-indigo-600 text-white text-center py-4 font-black uppercase tracking-widest text-sm border-b-4 border-indigo-800">
                  Launch Special
               </div>
               <div className="p-10 text-center bg-[#FFFBF5]">
                  <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-2">Pro Groomer</h3>
                  <div className="flex items-baseline justify-center my-6">
                     <span className="text-7xl font-black text-slate-900 tracking-tighter">$79</span>
                     <span className="ml-2 text-2xl text-slate-500 font-bold">/mo</span>
                  </div>
                  <p className="text-slate-600 mb-8 font-medium">Perfect for independent mobile groomers and salons.</p>
                  
                  <Link href="/signup">
                     <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-16 rounded-xl text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black">
                        Start 14-Day Free Trial
                     </Button>
                  </Link>
                  <p className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-wide">No credit card required.</p>
               </div>
               <div className="bg-white p-10 border-t-2 border-slate-100">
                  <ul className="space-y-5">
                     <li className="flex items-center text-slate-700 font-bold text-lg">
                        <Check className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" />
                        Unlimited Appointments
                     </li>
                     <li className="flex items-center text-slate-700 font-bold text-lg">
                        <Check className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" />
                        Unlimited Client Profiles
                     </li>
                     <li className="flex items-center text-slate-700 font-bold text-lg">
                        <Check className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" />
                        <span className="bg-yellow-100 px-2 -ml-2 rounded-md">SMS Reminders Included</span>
                     </li>
                     <li className="flex items-center text-slate-700 font-bold text-lg">
                        <Check className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" />
                        Revenue & Tax Reports
                     </li>
                     <li className="flex items-center text-slate-700 font-bold text-lg">
                        <Check className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0" />
                        iPhone, iPad & Web App
                     </li>
                  </ul>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-24 bg-[#FFFBF5]">
           <div className="container px-4 mx-auto max-w-4xl">
              <h2 className="text-4xl font-black text-center mb-16 text-slate-900 tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-6">
                 <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition-colors shadow-sm">
                    <h3 className="font-black text-xl mb-3 flex items-center text-slate-800"><HelpCircle className="h-6 w-6 text-indigo-600 mr-3"/> Can I use this on my phone?</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">Yes! Groom Groove works perfectly on any iPhone, Android, iPad, or laptop. Your data syncs instantly across all devices.</p>
                 </div>
                 <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 transition-colors shadow-sm">
                    <h3 className="font-black text-xl mb-3 flex items-center text-slate-800"><HelpCircle className="h-6 w-6 text-indigo-600 mr-3"/> Is it hard to switch from paper?</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">Not at all. We designed it specifically for people who hate complicated software. It takes about 5 minutes to learn.</p>
                 </div>
              </div>
           </div>
        </section>

        <footer className="py-16 bg-white border-t-2 border-slate-100">
          <div className="container px-4 mx-auto text-center">
              <div className="flex justify-center items-center gap-2 mb-6">
                <span className="font-black text-2xl text-slate-300 tracking-tighter">GroomGroove</span>
              </div>
              <p className="text-sm font-bold text-slate-400">
              © 2026 Groom Groove. Built with ❤️ for groomers.
              </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
