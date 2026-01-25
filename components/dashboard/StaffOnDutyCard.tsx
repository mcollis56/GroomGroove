'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  status: 'working' | 'break' | 'clocked_out'
  avatarUrl?: string
}

interface StaffOnDutyCardProps {
  staff: StaffMember[]
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
      <span className="text-sm font-medium text-rose-600">{initials}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: 'working' | 'break' | 'clocked_out' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        status === 'working' && 'bg-green-100 text-green-700',
        status === 'break' && 'bg-amber-100 text-amber-700',
        status === 'clocked_out' && 'bg-gray-100 text-gray-600'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'working' && 'bg-green-500',
          status === 'break' && 'bg-amber-500',
          status === 'clocked_out' && 'bg-gray-400'
        )}
      />
      {status === 'working' && 'Working'}
      {status === 'break' && 'On Break'}
      {status === 'clocked_out' && 'Clocked Out'}
    </span>
  )
}

function ActionButton({ status }: { status: 'working' | 'break' | 'clocked_out' }) {
  const label = status === 'working' ? 'Clock Out' : status === 'break' ? 'Resume' : 'Clock In'

  return (
    <Button variant="ghost" size="sm">
      <Clock className="w-4 h-4 mr-1" />
      {label}
    </Button>
  )
}

export function StaffOnDutyCard({ staff }: StaffOnDutyCardProps) {
  const isEmpty = staff.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff On Duty</CardTitle>
        <p className="text-sm text-gray-500">Today&apos;s team</p>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              No staff currently clocked in
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Staff can clock in from the dashboard
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {member.name}
                  </p>
                  <StatusBadge status={member.status} />
                </div>
                <ActionButton status={member.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
