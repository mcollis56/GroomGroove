import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface HistoryAppointment {
  id: string
  dogId: string | null
  dogName: string
  dogBreed: string | null
  dogPhotoUrl: string | null
  ownerName: string
  services: string[]
  notes: string | null
  status: string
  time: string
  date: string
}

interface HistoryPageClientProps {
  appointments: HistoryAppointment[]
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') {
    return (
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
    )
  }
  if (status === 'cancelled') {
    return (
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="w-5 h-5 text-red-600" />
      </div>
    )
  }
  return (
    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
      <Clock className="w-5 h-5 text-blue-600" />
    </div>
  )
}

type BadgeVariant = 'default' | 'info' | 'success'

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    pending_confirmation: 'default',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'default'
  }
  const labels: Record<string, string> = {
    pending_confirmation: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
}

export function HistoryPageClient({ appointments }: HistoryPageClientProps) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">All Sessions</h3>
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              {/* Dog Photo */}
              {appt.dogPhotoUrl ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={appt.dogPhotoUrl}
                    alt={appt.dogName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🐕</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {appt.dogId ? (
                    <Link
                      href={`/dogs/${appt.dogId}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {appt.dogName}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {appt.dogName}
                    </span>
                  )}
                  {appt.dogBreed && (
                    <span className="text-sm text-gray-500">({appt.dogBreed})</span>
                  )}
                  <StatusBadge status={appt.status} />
                </div>
                <p className="text-sm text-gray-500">{appt.ownerName}</p>
                <p className="text-xs text-gray-400">
                  {appt.services?.join(', ') || 'No services'}
                </p>
                {appt.notes && (
                  <p className="text-xs text-gray-400 italic mt-1">{appt.notes}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{appt.time}</p>
                <p className="text-xs text-gray-500">{appt.date}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No sessions recorded yet</p>
          <p className="text-sm mt-1">Sessions will appear here after appointments are completed</p>
        </div>
      )}
    </Card>
  )
}
