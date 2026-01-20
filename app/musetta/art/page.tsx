import Link from "next/link"

export default function ArtPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] text-gray-900">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-[#f5f5f0]/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-6xl font-script">
            Musetta
          </Link>
          <div className="flex gap-8 text-sm uppercase tracking-widest">
            <Link href="/musetta/art" className="hover:text-gray-600 transition-colors font-bold">Art</Link>
            <Link href="/musetta/interiors" className="hover:text-gray-600 transition-colors">Interiors</Link>
            <Link href="/musetta/objects" className="hover:text-gray-600 transition-colors">Objects</Link>
            <Link href="/musetta/dinners" className="hover:text-gray-600 transition-colors">Dinners</Link>
            <Link href="/musetta/lifestyle" className="hover:text-gray-600 transition-colors">Lifestyle</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Hero Section */}
          <section className="mb-24">
            <h1 className="text-6xl md:text-7xl font-serif mb-16 text-center uppercase tracking-wider">Art</h1>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-base leading-relaxed uppercase tracking-wide mb-12">
                Our pursuit of exceptional historical works drives Musetta's approach to collecting. We aim to acquire pieces that carry both provenance and presence—works that have stood the test of time yet remain vibrantly relevant. Through strategic participation in premier auctions, private sales, and exclusive consignments, we will build collections that tell compelling stories across eras and movements. Our expertise allows us to identify overlooked masterworks alongside recognized icons, creating collections of uncommon depth. These pieces will form the foundation of our interiors, demonstrating how thoughtfully selected historical art creates meaningful contrast and context for contemporary living. Each acquisition represents not just an investment in beauty but in the layered narrative that makes a space truly exceptional.
              </p>
            </div>
          </section>

          {/* Image Placeholder Grid */}
          <section className="grid md:grid-cols-2 gap-8 mb-24">
            <div className="aspect-[3/4] bg-gray-300 rounded"></div>
            <div className="aspect-[3/4] bg-gray-300 rounded"></div>
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
