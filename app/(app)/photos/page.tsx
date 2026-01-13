import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { getDogsWithPhotos } from '@/lib/actions/photos'
import { Camera } from 'lucide-react'

export default async function PhotosPage() {
  const dogsWithPhotos = await getDogsWithPhotos()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Pin Board</h1>
          <p className="text-gray-500 mt-1">Your furry clients gallery</p>
        </div>
        <div className="text-sm text-gray-500">
          {dogsWithPhotos.length} {dogsWithPhotos.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>

      {dogsWithPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {dogsWithPhotos.map((dog) => (
            <Link key={dog.id} href={`/dogs/${dog.id}`}>
              <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image
                    src={dog.photo_url}
                    alt={dog.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="font-semibold text-white text-sm truncate">{dog.name}</p>
                    {dog.breed && (
                      <p className="text-white/80 text-xs truncate">{dog.breed}</p>
                    )}
                    {dog.customer_name && (
                      <p className="text-white/60 text-xs truncate mt-0.5">{dog.customer_name}</p>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <p className="font-medium text-gray-900 text-sm truncate">{dog.name}</p>
                  <p className="text-gray-500 text-xs truncate">{dog.breed || 'Mixed breed'}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos yet</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Start building your gallery by adding photos to your furry clients.
              Visit any dog&apos;s profile to upload their photo.
            </p>
            <Link
              href="/dogs"
              className="inline-flex items-center justify-center px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors text-sm font-medium"
            >
              Browse Dogs
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
