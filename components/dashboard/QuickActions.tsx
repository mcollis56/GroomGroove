'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CalendarPlus, UserPlus, Bell, BarChart3 } from 'lucide-react'

const actions = [
  { id: 'new-appointment', label: 'New Appointment', icon: CalendarPlus, color: 'bg-blue-600', href: '/calendar/new' },
  { id: 'add-client', label: 'New Client', icon: UserPlus, color: 'bg-blue-500', href: '/clients/new' },
  { id: 'send-reminder', label: 'Send Reminders', icon: Bell, color: 'bg-amber-500', href: '/notifications' },
  { id: 'view-reports', label: 'View Reports', icon: BarChart3, color: 'bg-green-500', href: '/reports' },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="secondary"
                href={action.href}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <div className={`${action.color} p-2 rounded-lg text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
