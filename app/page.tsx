import Link from "next/link"
import Image from "next/image"

export default function MusettaLanding() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] text-gray-900">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-[#f5f5f0]/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-6xl font-script">
            Musetta
          </Link>
          <div className="flex gap-8 text-sm uppercase tracking-widest">
            <Link href="/musetta/art" className="hover:text-gray-600 transition-colors">Art</Link>
            <Link href="/musetta/interiors" className="hover:text-gray-600 transition-colors">Interiors</Link>
            <Link href="/musetta/objects" className="hover:text-gray-600 transition-colors">Objects</Link>
            <Link href="/musetta/dinners" className="hover:text-gray-600 transition-colors">Dinners</Link>
            <Link href="/musetta/lifestyle" className="hover:text-gray-600 transition-colors">Lifestyle</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-32">
        {/* Hero with Musetta logo */}
        <section className="min-h-[70vh] flex items-center justify-center relative">
          <div className="text-center">
            <h1 className="text-9xl font-script mb-8">Musetta</h1>
            <div className="w-24 h-24 mx-auto mb-8">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path d="M 40 100 Q 40 40 80 40 Q 100 40 100 60 Q 100 80 80 100 Q 60 120 60 140 Q 60 160 80 160 Q 100 160 100 140 M 100 60 Q 100 40 120 40 Q 160 40 160 100 Q 160 160 120 160 Q 100 160 100 140"
                  stroke="black"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-xl tracking-wider uppercase">Curating Exceptional Living</p>
          </div>
        </section>

        {/* Introduction Grid */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="space-y-6">
              <h2 className="text-5xl font-serif leading-tight">INTERIORS THAT INSPIRE</h2>
              <p className="text-lg leading-relaxed uppercase tracking-wide">
                We don't just sell furniture; we curate possibilities for how life could be lived.
              </p>
            </div>
            <div className="aspect-square bg-gray-300 rounded"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="aspect-square bg-gray-300 rounded order-2 md:order-1"></div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-5xl font-serif leading-tight">LIFESTYLE</h2>
              <p className="text-base leading-relaxed uppercase tracking-wide">
                At Musetta, art and design are encountered through living. An armchair holds a quiet morning, a dining table carries celebration and conversation. By seeing pieces used as they are meant to be, guests come to recognise what resonates with their own way of living, rather than what simply looks good.
              </p>
            </div>
          </div>
        </section>

        {/* Offerings Grid */}
        <section className="bg-white py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center mb-16 uppercase tracking-wider">Our Offerings</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <Link href="/musetta/art" className="group">
                <div className="aspect-[3/4] bg-gray-300 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-serif mb-2 uppercase tracking-wide">Art</h3>
                <p className="text-sm uppercase tracking-wide text-gray-600">Historical Works</p>
              </Link>

              <Link href="/musetta/interiors" className="group">
                <div className="aspect-[3/4] bg-gray-300 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-serif mb-2 uppercase tracking-wide">Interiors</h3>
                <p className="text-sm uppercase tracking-wide text-gray-600">Curated Spaces</p>
              </Link>

              <Link href="/musetta/objects" className="group">
                <div className="aspect-[3/4] bg-gray-300 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-serif mb-2 uppercase tracking-wide">Objects</h3>
                <p className="text-sm uppercase tracking-wide text-gray-600">Distinctive Pieces</p>
              </Link>

              <Link href="/musetta/dinners" className="group">
                <div className="aspect-[3/4] bg-gray-300 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-serif mb-2 uppercase tracking-wide">Dinners</h3>
                <p className="text-sm uppercase tracking-wide text-gray-600">Curated Experiences</p>
              </Link>

              <Link href="/musetta/lifestyle" className="group">
                <div className="aspect-[3/4] bg-gray-300 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-serif mb-2 uppercase tracking-wide">Lifestyle</h3>
                <p className="text-sm uppercase tracking-wide text-gray-600">Living with Art</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-6 py-24 text-center">
          <p className="text-2xl font-serif mb-8">If you're curious, explore Musetta — or reach out.</p>
          <Link href="/contact" className="inline-block border-2 border-black px-12 py-4 uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
            Contact
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-6xl font-script mb-4">Musetta</p>
          <p className="text-sm uppercase tracking-widest text-gray-600">Curating Exceptional Living</p>
        </div>
      </footer>
    </div>
  )
}
