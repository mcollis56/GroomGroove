'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Dog, User, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

export default function NewDogPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/dogs')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dogs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dogs
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Dog</h1>
        <p className="text-gray-500">Register a new furry client</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Dog className="w-4 h-4 inline mr-1" />
                Dog Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Bella"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              >
                <option value="">Select breed...</option>
                <option value="golden-retriever">Golden Retriever</option>
                <option value="german-shepherd">German Shepherd</option>
                <option value="poodle">Poodle</option>
                <option value="bulldog">Bulldog</option>
                <option value="husky">Husky</option>
                <option value="labrador">Labrador</option>
                <option value="beagle">Beagle</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Owner
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              >
                <option value="">Select owner...</option>
                <option value="1">Sarah Johnson</option>
                <option value="2">Mike Chen</option>
                <option value="3">Emma Wilson</option>
                <option value="4">James Brown</option>
                <option value="5">Lisa Park</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                placeholder="e.g., 45"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coat Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              >
                <option value="">Select coat type...</option>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
                <option value="curly">Curly</option>
                <option value="double">Double Coat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Flags</label>
            <div className="grid grid-cols-2 gap-2">
              {['Anxious', 'First Visit', 'Nail Sensitive', 'Heavy Shedder', 'Aggressive', 'Senior Dog'].map((flag) => (
                <label key={flag} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="text-sm">{flag}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Any special care instructions, allergies, or behavioral notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Adding...' : 'Add Dog'}
            </Button>
            <Link href="/dogs">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
