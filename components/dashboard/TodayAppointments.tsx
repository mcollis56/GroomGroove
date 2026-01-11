'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Clock, AlertTriangle, Sparkles, Scissors, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisplayAppointment {
  id: string
  time: string
  dogName: string
  breed: string
  ownerName: string
  service: string
  flags: string[]
  status: 'confirmed' | 'in-progress' | 'pending' | 'completed'
  dogId: string | null
}

interface TodayAppointmentsProps {
  appointments: DisplayAppointment[]
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-500',
}

const flagIcons: Record<string, { icon: typeof AlertTriangle; label: string; variant: 'warning' | 'info' | 'default' }> = {
  'anxious': { icon: AlertTriangle, label: 'Anxious', variant: 'warning' },
  'first-visit': { icon: Sparkles, label: 'First Visit', variant: 'info' },
  'nail-sensitive': { icon: Scissors, label: 'Nail Sensitive', variant: 'warning' },
  'heavy-shedder': { icon: Scissors, label: 'Heavy Shedder', variant: 'default' },
}

export function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today&apos;s Appointments</CardTitle>
        <span className="text-sm text-gray-500">{appointments.length} scheduled</span>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No appointments today</p>
            <p className="text-sm mt-1">Schedule a new appointment to get started</p>
          </div>
        ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-2 w-20 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {apt.time}
              </div>

              <Link
                href={apt.dogId ? `/dogs/${apt.dogId}` : '#'}
                className="flex-1 min-w-0 hover:bg-gray-100 rounded-lg p-1 -m-1 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{apt.dogName}</span>
                  <span className="text-sm text-gray-500">({apt.breed})</span>
                </div>
                <p className="text-sm text-gray-500">{apt.ownerName}</p>
                <p className="text-xs text-gray-400 truncate">{apt.service}</p>
              </Link>

              <div className="flex items-center gap-2">
                {apt.flags.map((flag) => {
                  const flagInfo = flagIcons[flag]
                  if (!flagInfo) return null
                  return (
                    <Badge key={flag} variant={flagInfo.variant}>
                      {flagInfo.label}
                    </Badge>
                  )
                })}
              </div>

              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium capitalize',
                statusStyles[apt.status] || statusStyles.pending
              )}>
                {apt.status.replace('-', ' ')}
              </span>

              {/* Complete/Checkout button - only show for non-completed appointments */}
              {apt.status !== 'completed' ? (
                <Link href={`/checkout/${apt.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </Link>
              ) : (
                <span className="text-xs text-gray-400 px-3">Done</span>
              )}
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
