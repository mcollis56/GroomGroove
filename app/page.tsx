import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Check, Smartphone, Clock, ShieldCheck, ArrowRight, Star, Calendar } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link className="flex items-center gap-2" href="/">
          {/* Logo Icon */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
             <Image src="/logo.png" alt="Logo" fill className="object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Groom Groove</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link className="text-sm font-medium hover:text-purple-600 hidden md:block" href="#features">Features</Link>
          <Link className="text-sm font-medium hover:text-purple-600 hidden md:block" href="#pricing">Pricing</Link>
          
          {user ? (
             <Link href="/dashboard">
               <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
                 Dashboard
               </Button>
             </Link>
          ) : (
            <>
              <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" href="/login">
                Login
              </Link>
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
                  Start Free Trial
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-purple-50 to-white">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-purple-600 bg-purple-100 rounded-full">
              New: SMS Reminders are here! 🚀
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900 mb-6">
              Eliminate No-Shows. <br />
              <span className="text-purple-600">Automate Your Admin.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mb-8 leading-relaxed">
              The all-in-one app for modern dog groomers. Schedule smarter, get paid faster, and love your job again.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 rounded-full text-lg w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button className="h-12 px-8 rounded-full text-lg w-full sm:w-auto border border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
                  See Features
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-1" /> No credit card required</div>
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-1" /> 14-day free trial</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to run your salon</h2>
              <p className="mt-4 text-lg text-gray-500">Stop using index cards and messy calendars.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">SMS Reminders</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automated texts sent 24h before appointments. Reduce no-shows by 80% without lifting a finger.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Digital Dog Profiles</h3>
                <p className="text-gray-600 leading-relaxed">
                  Keep photos, vet notes, and blade lengths for every client in your pocket. Never guess a haircut again.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="p-8 bg-green-50 rounded-2xl border border-green-100 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Get Paid Faster</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track revenue and send professional invoices. Know exactly how much you made this week.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Section */}
        <section className="w-full py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
             <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <h2 className="text-3xl font-bold text-gray-900">A Calendar Built for Groomers</h2>
                   <p className="text-lg text-gray-600">
                     Most calendar apps are designed for office meetings. Ours is designed for baths, haircuts, and nail trims.
                   </p>
                   <ul className="space-y-4">
                      <li className="flex items-start">
                         <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                            <Check className="h-4 w-4 text-green-600" />
                         </div>
                         <div className="ml-3">
                            <h4 className="font-semibold text-gray-900">Drag & Drop Rescheduling</h4>
                            <p className="text-gray-500">Moving appointments is as easy as moving a sticky note.</p>
                         </div>
                      </li>
                      <li className="flex items-start">
                         <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                            <Check className="h-4 w-4 text-green-600" />
                         </div>
                         <div className="ml-3">
                            <h4 className="font-semibold text-gray-900">Mobile Friendly</h4>
                            <p className="text-gray-500">Works perfectly on your iPad, iPhone, or laptop.</p>
                         </div>
                      </li>
                   </ul>
                </div>
                {/* Visual Placeholder for Calendar */}
                <div className="relative rounded-2xl bg-white shadow-xl border border-gray-200 p-2 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                   <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 border-b flex items-center px-4 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="mt-8 p-4 space-y-4 bg-white">
                      <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold">Today's Schedule</h3>
                         <span className="text-sm text-gray-400">Jan 17, 2026</span>
                      </div>
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                         <div className="font-bold text-blue-900">Bella (Golden Retriever)</div>
                         <div className="text-sm text-blue-700">Full Groom • 9:00 AM</div>
                      </div>
                      <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                         <div className="font-bold text-purple-900">Max (Poodle)</div>
                         <div className="text-sm text-purple-700">Bath & Tidy • 11:30 AM</div>
                      </div>
                       <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                         <div className="font-bold text-green-900">Charlie (Beagle)</div>
                         <div className="text-sm text-green-700">Nail Trim • 2:00 PM</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, Transparent Pricing</h2>
               <p className="mt-4 text-lg text-gray-500">No hidden fees. Cancel anytime.</p>
            </div>
            
            <div className="max-w-md mx-auto">
               <div className="p-8 bg-white border-2 border-purple-600 rounded-3xl shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
                     Most Popular
                  </div>
                  <div className="text-center">
                     <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
                     <div className="mt-4 flex items-baseline justify-center">
                        <span className="text-5xl font-extrabold text-gray-900">$79</span>
                        <span className="ml-2 text-xl text-gray-500">/month</span>
                     </div>
                     <p className="mt-4 text-gray-500">Everything you need to grow your business.</p>
                  </div>
                  <ul className="mt-8 space-y-4">
                     {['Unlimited Appointments', 'Unlimited Dog Profiles', 'SMS Reminders included', 'Revenue Reports', 'Priority Support'].map((feature) => (
                        <li key={feature} className="flex items-center">
                           <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                           <span className="ml-3 text-gray-600">{feature}</span>
                        </li>
                     ))}
                  </ul>
                  <div className="mt-8">
                     <Link href="/signup">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                           Start 14-Day Free Trial
                        </Button>
                     </Link>
                     <p className="mt-4 text-xs text-center text-gray-400">
                        100% money-back guarantee if you're not satisfied.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 w-full border-t bg-gray-50">
           <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image src="/logo.png" alt="Logo" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">Groom Groove</span>
                 </div>
                 <p className="text-gray-500 text-sm max-w-xs">
                    Built with ❤️ by a developer who loves dogs. We help groomers save time and make more money.
                 </p>
              </div>
              <div>
                 <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                 <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="#features" className="hover:text-purple-600">Features</Link></li>
                    <li><Link href="#pricing" className="hover:text-purple-600">Pricing</Link></li>
                    <li><Link href="/login" className="hover:text-purple-600">Login</Link></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                 <ul className="space-y-2 text-sm text-gray-600">
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                 </ul>
              </div>
           </div>
           <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-gray-400">
              © 2026 Groom Groove. All rights reserved.
           </div>
        </footer>
    </div>
  )
}
