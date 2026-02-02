'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Check, Dog as DogIcon, User, Calendar as CalendarIcon } from 'lucide-react'
import CalendarGrid from './CalendarGrid'
import QuickBookModal from '@/components/booking/QuickBookModal'
import { formatTime as safeFormatTime, parseDateString, getLocalDateKey } from '@/lib/utils/date'

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
  return safeFormatTime(isoString)
}

function formatDateForDisplay(dateStr: string): string {
  const date = parseDateString(dateStr)
  if (!date) return 'Invalid Date'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getDateFromISO(isoString: string): string {
  return getLocalDateKey(isoString) || ''
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'info' | 'success'> = {
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

export default function CalendarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedDate = searchParams.get('date')
  const supabase = createClient()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [datesWithAppointments, setDatesWithAppointments] = useState<string[]>([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const loadAppointments = async () => {
    const { data: appointmentsData, error: appointmentsError } = await supabase
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
      .order('scheduled_at', { ascending: true })

    if (appointmentsError) {
      console.error('Failed to fetch appointments:', appointmentsError)
    } else {
      const allAppointments: Appointment[] = (appointmentsData || []).map(appt => ({
        ...appt,
        customer: Array.isArray(appt.customer) ? appt.customer[0] : appt.customer,
        dog: Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
      }))

      setAppointments(allAppointments)

      // Get dates that have appointments
      const dates = [...new Set(allAppointments.map(appt => getDateFromISO(appt.scheduled_at)).filter(Boolean))]
      setDatesWithAppointments(dates)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? appointments.filter(appt => getDateFromISO(appt.scheduled_at) === selectedDate)
    : []

  // Handle date selection from calendar
  const handleDateSelect = (date: string) => {
    router.push(`/calendar?date=${date}`)
  }

  // Handle booking success - refresh appointments
  const handleBookingSuccess = () => {
    loadAppointments()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500">Schedule and manage appointments</p>
        </div>
        <Button href="/calendar/new" className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarGrid
          selectedDate={selectedDate}
          datesWithAppointments={datesWithAppointments}
          onDateSelect={handleDateSelect}
        />

        <Card>
          {selectedDate ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDateForDisplay(selectedDate)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  size="sm"
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
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
                              <div className="flex items-center gap-1">
                                <DogIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{appt.dog?.name || 'Unknown Dog'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500">{appt.customer?.name || 'Unknown Owner'}</span>
                              </div>
                              <div className="text-gray-600 mt-2">
                                {appt.services?.join(', ') || 'No services'}
                              </div>
                              {appt.notes && (
                                <div className="text-gray-500 text-xs mt-2 italic">
                                  {appt.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                            <a href={`/checkout/${appt.id}`}>
                              <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                <Check className="w-4 h-4" />
                                Complete
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-lg mb-2">No appointments scheduled</p>
                    <p className="text-sm mb-4">Click &quot;Book Appointment&quot; to add one</p>
                    <Button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-lg mb-2">Select a date</p>
              <p className="text-sm">Click on a day in the calendar to view appointments</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Book Modal */}
      {selectedDate && (
        <QuickBookModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          selectedDate={selectedDate}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
