import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/Card'
import { HistoryPageClient } from './HistoryPageClient'

interface AppointmentHistory {
  id: string
  scheduled_at: string
  services: string[]
  notes: string | null
  status: string
  customer: { name: string } | null
  dog: { id: string; name: string; breed: string } | null
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
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

export default async function HistoryPage() {
  const supabase = await createClient()

  // Fetch all appointments (past and present)
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      services,
      notes,
      status,
      customer:customers(name),
      dog:dogs(id, name, breed)
    `)
    .order('scheduled_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch appointments:', error)
  }

  const allAppointments: AppointmentHistory[] = (appointments || []).map(appt => ({
    ...appt,
    customer: Array.isArray(appt.customer) ? appt.customer[0] : appt.customer,
    dog: Array.isArray(appt.dog) ? appt.dog[0] : appt.dog
  }))

  // Calculate stats
  const completedAppointments = allAppointments.filter(a => a.status === 'completed')
  const totalSessions = allAppointments.length
  const completedSessions = completedAppointments.length

  // Get unique dogs served
  const uniqueDogs = new Set(allAppointments.map(a => a.dog?.name).filter(Boolean))

  // Transform for client component
  const appointmentsForClient = allAppointments.map(appt => ({
    id: appt.id,
    dogId: appt.dog?.id || null,
    dogName: appt.dog?.name || 'Unknown Dog',
    dogBreed: appt.dog?.breed || null,
    ownerName: appt.customer?.name || 'Unknown Client',
    services: appt.services || [],
    notes: appt.notes,
    status: appt.status,
    time: formatTime(appt.scheduled_at),
    date: formatDate(appt.scheduled_at)
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
        <p className="text-gray-500">Complete record of all grooming sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Dogs Served</p>
          <p className="text-2xl font-bold text-gray-900">{uniqueDogs.size}</p>
        </Card>
      </div>

      <HistoryPageClient appointments={appointmentsForClient} />
    </div>
  )
}
