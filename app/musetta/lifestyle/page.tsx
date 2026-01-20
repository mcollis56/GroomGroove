import Link from "next/link"

export default function LifestylePage() {
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
            <Link href="/musetta/lifestyle" className="hover:text-gray-600 transition-colors font-bold">Lifestyle</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <section className="mb-24">
            <h1 className="text-6xl md:text-7xl font-serif mb-16 text-center uppercase tracking-wider">Lifestyle</h1>
          </section>

          {/* Image Gallery */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="aspect-[3/4] bg-gray-300 rounded"></div>
              <div className="aspect-[3/4] bg-gray-300 rounded"></div>
              <div className="aspect-[3/4] bg-gray-300 rounded"></div>
            </div>
          </section>

          {/* Main Content */}
          <section className="max-w-4xl mx-auto mb-24">
            <p className="text-base leading-relaxed uppercase tracking-wide text-center">
              At Musetta, art and design are encountered through living. An armchair holds a quiet morning, a dining table carries celebration and conversation. By seeing pieces used as they are meant to be, guests come to recognise what resonates with their own way of living, rather than what simply looks good.
            </p>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <Link href="/" className="inline-block border-2 border-black px-12 py-4 uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
              Back to Home
            </Link>
          </section>
        </div>
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
