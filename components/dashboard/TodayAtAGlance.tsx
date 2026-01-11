import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Calendar, AlertTriangle, Sparkles, Clock } from 'lucide-react'
import type { TodayAtAGlance as TodayAtAGlanceData } from '@/lib/actions/dashboard'

interface TodayAtAGlanceProps {
  data: TodayAtAGlanceData
}

export function TodayAtAGlance({ data }: TodayAtAGlanceProps) {
  // Build items array, filtering out zero-value entries except "Remaining"
  const items = [
    {
      label: 'Appointments Remaining',
      value: data.remainingAppointments,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
      show: true // Always show remaining count
    },
    {
      label: 'Special Handling',
      value: data.specialHandlingCount,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
      show: data.specialHandlingCount > 0
    },
    {
      label: 'First-Time Dogs',
      value: data.firstTimeVisits,
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50',
      show: data.firstTimeVisits > 0
    },
    {
      label: 'Last Appointment',
      value: data.finalAppointmentTime || '—',
      icon: Clock,
      color: 'text-green-600 bg-green-50',
      show: !!data.finalAppointmentTime
    }
  ].filter(item => item.show)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📅</span> Today at a Glance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{item.value}</p>
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
