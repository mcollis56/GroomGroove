import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Check, Smartphone, Clock, ShieldCheck, ArrowRight } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b sticky top-0 bg-white/95 backdrop-blur z-50">
        <Link className="flex items-center gap-2" href="/">
          <span className="font-bold text-xl tracking-tight text-gray-900">Groom Groove</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
             <Link href="/dashboard">
               <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
                 Dashboard
               </Button>
             </Link>
          ) : (
            <>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
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
        <section className="w-full py-20 md:py-32 bg-[#fdf8f6]">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900 mb-6">
              Eliminate No-Shows. <br />
              <span className="text-purple-600">Automate Your Admin.</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mb-8">
              The all-in-one app for modern dog groomers. Schedule smarter, get paid faster, and love your job again.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 rounded-full text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
<Button className="h-12 px-8 rounded-full text-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-100">
                  See Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-20 bg-white">
          <div className="container px-4 mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-purple-50 rounded-2xl">
              <Clock className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">SMS Reminders</h3>
              <p className="text-gray-600">Automated texts 24h before appointments. Slash no-shows by 80%.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl">
              <Smartphone className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Dog Profiles</h3>
              <p className="text-gray-600">Photos, notes, and blade lengths for every client in your pocket.</p>
            </div>
            <div className="p-6 bg-green-50 rounded-2xl">
              <ShieldCheck className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Get Paid</h3>
              <p className="text-gray-600">Track revenue and payments. No more lost sticky notes.</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 w-full text-center border-t text-sm text-gray-500">
        © 2026 Groom Groove.
      </footer>
    </div>
  )
}
