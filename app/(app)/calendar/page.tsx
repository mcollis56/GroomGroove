import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Check } from 'lucide-react'
import Link from 'next/link'
import CalendarGrid from './CalendarGrid'

interface Appointment {
  id: string
  scheduled_at: string
  services: string[]
  notes: string | null
  status: string
  customer: { name: string } | null
  dog: { name: string } | null
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getDateFromISO(isoString: string): string {
  return isoString.split('T')[0]
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

export default async function CalendarPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const selectedDate = params.date || null
  const supabase = await createClient()

  // Fetch all appointments for the current month and beyond
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      services,
      notes,
      status,
      customer:customers(name),
      dog:dogs(name)
    `)
    .gte('scheduled_at', startOfMonth.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch appointments:', error)
  }

  const allAppointments: Appointment[] = (appointments || []).map(appt => ({
    ...appt,
    customer: Array.isArray(appt.customer) ? appt.customer[0] : appt.customer,
    dog: Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
  }))

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? allAppointments.filter(appt => getDateFromISO(appt.scheduled_at) === selectedDate)
    : []

  // Get this week's appointments
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const thisWeekAppointments = allAppointments.filter(appt => {
    const apptDate = new Date(appt.scheduled_at)
    return apptDate >= startOfWeek && apptDate <= endOfWeek
  })

  // Get dates that have appointments (for calendar indicators)
  const datesWithAppointments = [...new Set(allAppointments.map(appt => getDateFromISO(appt.scheduled_at)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500">Schedule and manage appointments</p>
        </div>
        <Button href="/calendar/new" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Main Content - Calendar and Day View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Grid - Client Component */}
        <CalendarGrid
          selectedDate={selectedDate}
          datesWithAppointments={datesWithAppointments}
        />

        {/* Day View Panel */}
        <Card>
          {selectedDate ? (
            <>
              {/* Day View Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDateForDisplay(selectedDate)}
                </h3>
                <Button
                  href={`/calendar/new?date=${selectedDate}`}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appointment
                </Button>
              </div>

              {/* Appointments List */}
              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {formatTime(appt.scheduled_at)}
                            </span>
                            <StatusBadge status={appt.status} />
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium">{appt.dog?.name || 'Unknown Dog'}</span>
                              <span className="text-gray-500"> • {appt.customer?.name || 'Unknown Owner'}</span>
                            </div>
                            <div className="text-gray-600">
                              {appt.services?.join(', ') || 'No services'}
                            </div>
                            {appt.notes && (
                              <div className="text-gray-500 text-xs mt-2 italic">
                                {appt.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Checkout button for non-completed appointments */}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <Link href={`/checkout/${appt.id}`}>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                              <Check className="w-4 h-4" />
                              Complete
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No appointments scheduled for this day</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Select a date</p>
              <p className="text-sm">Click on a day in the calendar to view appointments</p>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming This Week */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Upcoming This Week</h3>
        {thisWeekAppointments.length > 0 ? (
          <div className="space-y-2">
            {thisWeekAppointments.map((appt) => {
              const apptDate = getDateFromISO(appt.scheduled_at)
              return (
                <a
                  key={appt.id}
                  href={`/calendar?date=${apptDate}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {new Date(appt.scheduled_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-500">{formatTime(appt.scheduled_at)}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{appt.dog?.name || 'Unknown Dog'}</div>
                      <div className="text-gray-500">{appt.customer?.name || 'Unknown Owner'}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {appt.services?.join(', ') || 'No services'}
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </a>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No appointments this week</p>
        )}
      </Card>
    </div>
  )
}
