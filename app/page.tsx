import Link from "next/link";
import Image from "next/image";
// Checked: Using Capital 'B' to match your project structure
import { Button } from "@/components/ui/Button";
import { Check, Smartphone, Clock, ShieldCheck, ArrowRight, HelpCircle, Sparkles, Calendar, Users, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#FEFDFB] text-stone-900 selection:bg-teal-100">

      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-[#FEFDFB]/90 backdrop-blur-md z-50 border-b border-stone-100">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-white text-lg">G</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-stone-900">
            GroomGroove
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8 items-center">
             <Link className="text-sm font-semibold text-stone-500 hover:text-teal-600 transition-colors" href="#features">Features</Link>
             <Link className="text-sm font-semibold text-stone-500 hover:text-teal-600 transition-colors" href="#pricing">Pricing</Link>
             <Link className="text-sm font-semibold text-stone-500 hover:text-teal-600 transition-colors" href="#faq">FAQ</Link>
          </nav>

          {user ? (
             <Link href="/dashboard">
               <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 py-2.5 font-semibold shadow-sm hover:shadow-md transition-all">
                 Go to Dashboard
               </Button>
             </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link className="text-sm font-semibold text-stone-600 hover:text-teal-600 hidden sm:block" href="/login">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2.5 font-semibold shadow-sm hover:shadow-md transition-all">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 overflow-hidden relative">
          {/* Subtle gradient orbs */}
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-teal-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <div className="container px-6 md:px-12 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-2 text-sm font-medium text-teal-700 mb-8">
                <Sparkles className="h-4 w-4" />
                SMS Reminders now included in all plans
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-900 mb-6 leading-[1.1]">
                More wags,<br />
                <span className="text-gradient">less paperwork</span>
              </h1>

              {/* Subheadline with cheeky twist */}
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-500 mb-10 leading-relaxed">
                The grooming app that actually gets it. Book appointments, send reminders,
                and track every pup&apos;s preferences — so you can focus on the floof, not the forms.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link href="/signup">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white h-14 px-8 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto flex items-center justify-center gap-2 group">
                    Start 14-Day Free Trial
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="outline" className="h-14 px-8 rounded-full text-lg font-semibold border-2 border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 w-full sm:w-auto bg-transparent">
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-500" />
                  <span>Works on all devices</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 bg-white">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">Features</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 mb-4">
                Everything you need to run a grooming business
              </h2>
              <p className="text-lg text-stone-500 max-w-2xl mx-auto">
                Built by groomers, for groomers. No more juggling spreadsheets, sticky notes, and text messages.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-[#FEFDFB] rounded-2xl border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">Smart Scheduling</h3>
                <p className="text-stone-500 leading-relaxed">
                  Drag-and-drop calendar with color-coded appointment types. Never double-book again — unless you really want to (you don&apos;t).
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-[#FEFDFB] rounded-2xl border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                  <Smartphone className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">SMS Reminders</h3>
                <p className="text-stone-500 leading-relaxed">
                  Automatic texts 24 hours before appointments. Reduces no-shows by 80% and saves you from awkward &quot;where are you?&quot; calls.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-[#FEFDFB] rounded-2xl border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">Dog Profiles</h3>
                <p className="text-stone-500 leading-relaxed">
                  Blade lengths, shampoo preferences, behavioral notes — all saved. When Bella comes back, you know exactly how she likes it.
                </p>
              </div>
            </div>

            {/* Additional features row */}
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="group p-8 bg-[#FEFDFB] rounded-2xl border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">Client Management</h3>
                <p className="text-stone-500 leading-relaxed">
                  Keep track of every client, their pups, and their history. Build relationships, not spreadsheets.
                </p>
              </div>

              <div className="group p-8 bg-[#FEFDFB] rounded-2xl border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">Quick Invoicing</h3>
                <p className="text-stone-500 leading-relaxed">
                  Generate professional invoices in seconds. Track payments and keep your books cleaner than a freshly-groomed poodle.
                </p>
              </div>

              <div className="group p-8 bg-[#FEFDFB] rounded-2xl border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-colors">
                  <Clock className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">Groomer Scheduling</h3>
                <p className="text-stone-500 leading-relaxed">
                  Track who&apos;s on duty, clock in/out, and balance workloads. Your team, organized.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 bg-stone-900 text-white relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 paw-pattern opacity-30"></div>

          <div className="container px-6 md:px-12 mx-auto relative z-10">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-teal-400 uppercase tracking-wide mb-3">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Simple pricing, no surprises
              </h2>
              <p className="text-lg text-stone-400">
                One plan with everything you need. No hidden fees, no upsells.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="max-w-md mx-auto">
              <div className="bg-white text-stone-900 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center py-4">
                  <span className="text-sm font-semibold uppercase tracking-wide">Launch Pricing</span>
                </div>

                {/* Price */}
                <div className="p-10 text-center bg-[#FEFDFB]">
                  <p className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-2">Pro Groomer</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-6xl font-extrabold text-stone-900 tracking-tight">$79</span>
                    <span className="ml-2 text-xl text-stone-400">/month</span>
                  </div>
                  <p className="text-stone-500 mb-8">
                    Perfect for solo groomers and small salons
                  </p>

                  <Link href="/signup">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 rounded-xl text-lg font-semibold shadow-sm hover:shadow-md transition-all">
                      Start 14-Day Free Trial
                    </Button>
                  </Link>
                  <p className="mt-4 text-sm text-stone-400">No credit card required</p>
                </div>

                {/* Features list */}
                <div className="bg-white p-10 border-t border-stone-100">
                  <ul className="space-y-4">
                    <li className="flex items-center text-stone-600">
                      <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Unlimited appointments</span>
                    </li>
                    <li className="flex items-center text-stone-600">
                      <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Unlimited client profiles</span>
                    </li>
                    <li className="flex items-center text-stone-600">
                      <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">SMS reminders included</span>
                    </li>
                    <li className="flex items-center text-stone-600">
                      <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Revenue & tax reports</span>
                    </li>
                    <li className="flex items-center text-stone-600">
                      <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Works on any device</span>
                    </li>
                    <li className="flex items-center text-stone-600">
                      <Check className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-24 bg-[#FEFDFB]">
          <div className="container px-6 md:px-12 mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900">
                Questions? We&apos;ve got answers
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-teal-200 transition-colors">
                <h3 className="font-bold text-lg mb-2 flex items-start gap-3 text-stone-900">
                  <HelpCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0"/>
                  Can I use this on my phone?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-8">
                  Absolutely! GroomGroove works beautifully on any device — iPhone, Android, iPad, laptop, you name it. Your data syncs instantly across all of them.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-teal-200 transition-colors">
                <h3 className="font-bold text-lg mb-2 flex items-start gap-3 text-stone-900">
                  <HelpCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0"/>
                  Is it hard to switch from paper or spreadsheets?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-8">
                  Not at all! We designed GroomGroove specifically for people who hate complicated software. Most groomers are up and running in under 5 minutes. Seriously.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-teal-200 transition-colors">
                <h3 className="font-bold text-lg mb-2 flex items-start gap-3 text-stone-900">
                  <HelpCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0"/>
                  What if I need help?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-8">
                  We&apos;re here for you! Reach out anytime via email or chat. We respond fast because we know you&apos;ve got dogs waiting.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-teal-200 transition-colors">
                <h3 className="font-bold text-lg mb-2 flex items-start gap-3 text-stone-900">
                  <HelpCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0"/>
                  Can I cancel anytime?
                </h3>
                <p className="text-stone-500 leading-relaxed pl-8">
                  Yep, no contracts or commitments. Cancel with one click if it&apos;s not for you (but we think you&apos;ll love it).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-20 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="container px-6 md:px-12 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to simplify your grooming business?
            </h2>
            <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of groomers who&apos;ve ditched the chaos. Start your free trial today.
            </p>
            <Link href="/signup">
              <Button className="bg-white text-teal-700 hover:bg-stone-50 h-14 px-8 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-white border-t border-stone-100">
          <div className="container px-6 md:px-12 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <span className="font-bold text-stone-400">GroomGroove</span>
              </div>
              <p className="text-sm text-stone-400">
                © 2026 GroomGroove. Made with care for groomers everywhere.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
