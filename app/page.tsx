import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Check, Smartphone, Clock, ShieldCheck, ArrowRight, Star, Calendar, HelpCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-900">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-20 flex items-center justify-between border-b sticky top-0 bg-white/95 backdrop-blur z-50 shadow-sm">
        <Link className="flex items-center gap-3" href="/">
          <div className="relative w-10 h-10">
             <Image src="/logo.png" alt="Groom Groove Logo" fill className="object-contain" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900">Groom Groove</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 items-center">
             <Link className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors" href="#features">Features</Link>
             <Link className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors" href="#pricing">Pricing</Link>
             <Link className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors" href="#faq">FAQ</Link>
          </nav>
          
          {user ? (
             <Link href="/dashboard">
               <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-md hover:shadow-lg transition-all">
                 Go to Dashboard
               </Button>
             </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link className="text-sm font-bold text-gray-700 hover:text-blue-600 hidden sm:block" href="/login">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              New: SMS Reminders included in Pro Plan
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-gray-900 mb-6 leading-tight">
              Stop No-Shows. <br />
              <span className="text-blue-600">Start Growing.</span>
            </h1>
            <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl mb-10 leading-relaxed font-medium">
              The all-in-one app for independent dog groomers. Schedule appointments, manage client profiles, and get paid—all from your phone or iPad.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-10 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto">
                  Start My 14-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" className="h-14 px-10 rounded-full text-lg font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> No credit card required</div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Cancel anytime</div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 24/7 Support</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">Run your salon on Autopilot</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">We handle the boring admin stuff so you can focus on making dogs look awesome.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="group p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Smart Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Drag-and-drop calendar designed for groomers. Color-code by appointment type (Bath, Full Groom, Nails) and never double-book again.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="group p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">SMS Reminders</h3>
                <p className="text-gray-600 leading-relaxed">
                  We automatically text your clients 24 hours before their appointment. Reduce no-shows by 80% instantly.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="group p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Dog Profiles</h3>
                <p className="text-gray-600 leading-relaxed">
                  Save blade lengths, shampoo preferences, and vet notes. Next time Bella comes in, you know exactly what to do.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - THE MONEY SHOT */}
        <section id="pricing" className="w-full py-24 bg-gray-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">Simple, Transparent Pricing</h2>
               <p className="text-xl text-gray-400">One plan. Everything included. No hidden fees.</p>
            </div>
            
            <div className="max-w-lg mx-auto bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 border-4 border-blue-500">
               <div className="bg-blue-600 text-white text-center py-3 font-bold uppercase tracking-wider text-sm">
                  Launch Special
               </div>
               <div className="p-10 text-center">
                  <h3 className="text-2xl font-bold text-gray-500 uppercase tracking-wide mb-2">Pro Groomer</h3>
                  <div className="flex items-baseline justify-center my-6">
                     <span className="text-6xl font-extrabold text-gray-900">$79</span>
                     <span className="ml-2 text-2xl text-gray-500 font-medium">/month</span>
                  </div>
                  <p className="text-gray-600 mb-8">Perfect for independent mobile groomers and salons.</p>
                  
                  <Link href="/signup">
                     <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl text-xl font-bold shadow-lg hover:shadow-blue-500/50 transition-all">
                        Start 14-Day Free Trial
                     </Button>
                  </Link>
                  <p className="mt-4 text-xs text-gray-400">No credit card required to sign up.</p>
               </div>
               <div className="bg-gray-50 p-10 border-t border-gray-100">
                  <ul className="space-y-4">
                     <li className="flex items-center text-gray-700 font-medium">
                        <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        Unlimited Appointments
                     </li>
                     <li className="flex items-center text-gray-700 font-medium">
                        <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        Unlimited Client Profiles
                     </li>
                     <li className="flex items-center text-gray-700 font-medium">
                        <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="font-bold text-blue-600">SMS Reminders Included</span>
                     </li>
                     <li className="flex items-center text-gray-700 font-medium">
                        <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        Revenue & Tax Reports
                     </li>
                     <li className="flex items-center text-gray-700 font-medium">
                        <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        iPhone, iPad & Web App
                     </li>
                  </ul>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-24 bg-white">
           <div className="container px-4 mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
              <div className="space-y-8">
                 <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="font-bold text-xl mb-2 flex items-center"><HelpCircle className="h-5 w-5 text-blue-600 mr-2"/> Can I use this on my phone?</h3>
                    <p className="text-gray-600">Yes! Groom Groove works perfectly on any iPhone, Android, iPad, or laptop. Your data syncs instantly across all devices.</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="font-bold text-xl mb-2 flex items-center"><HelpCircle className="h-5 w-5 text-blue-600 mr-2"/> Is it hard to switch from paper?</h3>
                    <p className="text-gray-600">Not at all. We designed it specifically for people who hate complicated software. It takes about 5 minutes to learn.</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="font-bold text-xl mb-2 flex items-center"><HelpCircle className="h-5 w-5 text-blue-600 mr-2"/> What if I have multiple groomers?</h3>
                    <p className="text-gray-600">Currently, the Pro plan is designed for single users. If you have a larger salon, contact us for our Team pricing.</p>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer className="py-12 bg-gray-50 border-t">
        <div className="container px-4 mx-auto text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="relative w-6 h-6">
                 <Image src="/logo.png" alt="Logo" fill className="object-contain opacity-50" />
              </div>
              <span className="font-bold text-gray-500">Groom Groove</span>
            </div>
            <p className="text-sm text-gray-400">
            © 2026 Groom Groove. Built for groomers, by groomers.
            </p>
        </div>
      </footer>
    </div>
  )
}
