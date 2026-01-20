import Link from "next/link"

export default function ObjectsPage() {
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
            <Link href="/musetta/objects" className="hover:text-gray-600 transition-colors font-bold">Objects</Link>
            <Link href="/musetta/dinners" className="hover:text-gray-600 transition-colors">Dinners</Link>
            <Link href="/musetta/lifestyle" className="hover:text-gray-600 transition-colors">Lifestyle</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <section className="mb-24">
            <h1 className="text-6xl md:text-7xl font-serif mb-16 text-center uppercase tracking-wider">Objects</h1>
          </section>

          {/* Object Grid */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* Row 1 */}
              <div className="aspect-square bg-gray-300 rounded"></div>
              <div className="aspect-square bg-gray-300 rounded"></div>
              <div className="aspect-square bg-gray-300 rounded"></div>
              <div className="aspect-square bg-gray-300 rounded"></div>

              {/* Row 2 */}
              <div className="aspect-square bg-gray-300 rounded"></div>
              <div className="aspect-square bg-gray-300 rounded"></div>
              <div className="aspect-square bg-gray-300 rounded"></div>
              <div className="aspect-square bg-gray-300 rounded"></div>
            </div>
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
