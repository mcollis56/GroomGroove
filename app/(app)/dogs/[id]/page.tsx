import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getDogDetail } from '@/lib/actions/dogs'
import { DogQuickActions, DogPhoto, EditableGroomingPreferences, EditableGeneralNotes } from './DogDetailClient'
import { LocalDateTime } from '@/components/date/LocalDateTime'

interface DogDetailPageProps {
  params: Promise<{ id: string }>
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
          <Link href={`/calendar/new?dogId=${dog.id}`}>
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
                <DogPhoto
                  dogId={dog.id}
                  dogName={dog.name}
                  photoUrl={dog.photo_url}
                  isDemo={dog.id.startsWith('demo-dog-')}
                />
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="font-medium text-gray-900">{dog.customer?.name || 'Unknown'}</p>
                    </div>
                    {dog.weight && (
                      <div>
                        <p className="text-sm text-gray-500">Weight</p>
                        <p className="font-medium text-gray-900">{dog.weight} kg</p>
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
                        <p className="font-medium text-gray-900">
                          <LocalDateTime
                            value={dog.history[0].scheduled_at}
                            kind="date"
                            options={{ month: 'short', day: 'numeric', year: 'numeric' }}
                          />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Grooming Preferences - Editable */}
          <EditableGroomingPreferences
            dogId={dog.id}
            initialPreferences={dog.grooming_preferences}
            isDemo={dog.id.startsWith('demo-dog-')}
          />

          {/* General Notes - Editable */}
          <EditableGeneralNotes
            dogId={dog.id}
            dogName={dog.name}
            initialNotes={dog.notes}
            isDemo={dog.id.startsWith('demo-dog-')}
          />

          {/* Grooming History */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Grooming History</h3>
                <span className="text-sm text-gray-500">{dog.history.length} visits</span>
              </div>
              {dog.history.length > 0 ? (
                <div className="space-y-3">
                  {dog.history.map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        {appt.status === 'completed' ? (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {appt.services?.join(', ') || 'Grooming'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <LocalDateTime
                              value={appt.scheduled_at}
                              kind="date"
                              options={{ month: 'short', day: 'numeric', year: 'numeric' }}
                            />{' '}
                            at{' '}
                            <LocalDateTime
                              value={appt.scheduled_at}
                              kind="time"
                              options={{ hour: 'numeric', minute: '2-digit', hour12: true }}
                            />
                          </p>
                          {appt.notes && (
                            <p className="text-xs text-gray-400 mt-1">{appt.notes}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'warning' : 'info'}>
                        {appt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No grooming history yet</p>
                  <Link href={`/calendar/new?dogId=${dog.id}`} className="inline-block mt-3">
                    <Button variant="secondary" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book First Appointment
                    </Button>
                  </Link>
                </div>
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
            photoUrl={dog.photo_url}
            groomingPreferences={dog.grooming_preferences}
            isDemo={dog.id.startsWith('demo-dog-')}
          />
        </div>
      </div>
    </div>
  )
}
