import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getDogDetail } from '@/lib/actions/dogs'
import { DogQuickActions } from './DogDetailClient'

interface DogDetailPageProps {
  params: Promise<{ id: string }>
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default async function DogDetailPage({ params }: DogDetailPageProps) {
  const { id } = await params
  const dog = await getDogDetail(id)

  if (!dog) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dogs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dogs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dog.name}</h1>
            <p className="text-gray-500">{dog.breed || 'Unknown breed'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/calendar/new">
            <Button variant="secondary">
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dog Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-4xl">
                  🐕
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="font-medium text-gray-900">{dog.customer?.name || 'Unknown'}</p>
                    </div>
                    {dog.weight && (
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="font-medium text-gray-900">{dog.weight} lbs</p>
                      </div>
                    )}
                    {dog.customer?.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{dog.customer.phone}</p>
                      </div>
                    )}
                    {dog.customer?.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{dog.customer.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Total Visits</p>
                      <p className="font-medium text-gray-900">{dog.history.length}</p>
                    </div>
                    {dog.history.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Last Visit</p>
                        <p className="font-medium text-gray-900">{formatDate(dog.history[0].scheduled_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Grooming Preferences */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Grooming Preferences</h3>
              <div className="space-y-4">
                {dog.grooming_preferences.clipping_length && (
                  <div>
                    <p className="text-sm text-gray-500">Clipping Length</p>
                    <p className="text-gray-900">{dog.grooming_preferences.clipping_length}</p>
                  </div>
                )}
                {dog.grooming_preferences.nail_tool && (
                  <div>
                    <p className="text-sm text-gray-500">Nail Tool</p>
                    <p className="text-gray-900 capitalize">{dog.grooming_preferences.nail_tool}</p>
                  </div>
                )}
                {dog.grooming_preferences.coat_notes && (
                  <div>
                    <p className="text-sm text-gray-500">Coat Notes</p>
                    <p className="text-gray-900">{dog.grooming_preferences.coat_notes}</p>
                  </div>
                )}
                {dog.grooming_preferences.behavior_notes && (
                  <div>
                    <p className="text-sm text-gray-500">Behavior Notes</p>
                    <p className="text-gray-900">{dog.grooming_preferences.behavior_notes}</p>
                  </div>
                )}
                {dog.grooming_preferences.special_instructions && (
                  <div>
                    <p className="text-sm text-gray-500">Special Instructions</p>
                    <p className="text-gray-900">{dog.grooming_preferences.special_instructions}</p>
                  </div>
                )}
                {Object.keys(dog.grooming_preferences).length === 0 && (
                  <p className="text-gray-500 italic">No grooming preferences recorded yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* General Notes */}
          {dog.notes && (
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700">{dog.notes}</p>
              </div>
            </Card>
          )}

          {/* Grooming History */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Grooming History</h3>
              {dog.history.length > 0 ? (
                <div className="space-y-3">
                  {dog.history.map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {appt.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {appt.services?.join(', ') || 'Grooming'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(appt.scheduled_at)} at {formatTime(appt.scheduled_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={appt.status === 'completed' ? 'success' : 'info'}>
                        {appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No grooming history yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <DogQuickActions
            dogId={dog.id}
            dogName={dog.name}
            customerPhone={dog.customer?.phone || null}
            isDemo={dog.id.startsWith('demo-dog-')}
          />
        </div>
      </div>
    </div>
  )
}
