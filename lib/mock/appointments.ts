// Mock appointments data for calendar functionality
// Structured for easy filtering by date (YYYY-MM-DD)

export interface CalendarAppointment {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM AM/PM
  dogId: string
  dogName: string
  ownerName: string
  service: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export const mockAppointments: CalendarAppointment[] = [
  // January 2026 appointments
  {
    id: 'appt-1',
    date: '2026-01-15',
    time: '9:00 AM',
    dogId: 'dog-1',
    dogName: 'Bella',
    ownerName: 'Sarah Johnson',
    service: 'Full Groom',
    status: 'scheduled',
    notes: 'First visit, anxious about blow dryer'
  },
  {
    id: 'appt-2',
    date: '2026-01-15',
    time: '10:30 AM',
    dogId: 'dog-2',
    dogName: 'Max',
    ownerName: 'Mike Chen',
    service: 'Bath & Brush',
    status: 'scheduled'
  },
  {
    id: 'appt-3',
    date: '2026-01-15',
    time: '2:00 PM',
    dogId: 'dog-3',
    dogName: 'Daisy',
    ownerName: 'Emma Wilson',
    service: 'Full Groom + Nail Trim',
    status: 'completed'
  },
  {
    id: 'appt-4',
    date: '2026-01-16',
    time: '11:00 AM',
    dogId: 'dog-4',
    dogName: 'Rocky',
    ownerName: 'James Brown',
    service: 'Nail Trim Only',
    status: 'scheduled',
    notes: 'Nail sensitive, needs extra care'
  },
  {
    id: 'appt-5',
    date: '2026-01-16',
    time: '3:30 PM',
    dogId: 'dog-5',
    dogName: 'Luna',
    ownerName: 'Lisa Park',
    service: 'De-shedding Treatment',
    status: 'scheduled'
  },
  {
    id: 'appt-6',
    date: '2026-01-17',
    time: '8:30 AM',
    dogId: 'dog-6',
    dogName: 'Charlie',
    ownerName: 'Robert Davis',
    service: 'Teeth Cleaning',
    status: 'cancelled',
    notes: 'Owner sick, rescheduled for next week'
  },
  {
    id: 'appt-7',
    date: '2026-01-17',
    time: '1:00 PM',
    dogId: 'dog-1',
    dogName: 'Bella',
    ownerName: 'Sarah Johnson',
    service: 'Ear Cleaning',
    status: 'scheduled'
  },
  {
    id: 'appt-8',
    date: '2026-01-18',
    time: '10:00 AM',
    dogId: 'dog-7',
    dogName: 'Milo',
    ownerName: 'Jennifer Lee',
    service: 'Full Groom',
    status: 'scheduled'
  },
  {
    id: 'appt-9',
    date: '2026-01-18',
    time: '4:00 PM',
    dogId: 'dog-2',
    dogName: 'Max',
    ownerName: 'Mike Chen',
    service: 'Bath & Brush',
    status: 'scheduled'
  },
  {
    id: 'appt-10',
    date: '2026-01-20',
    time: '9:30 AM',
    dogId: 'dog-8',
    dogName: 'Coco',
    ownerName: 'Alex Turner',
    service: 'Full Groom',
    status: 'scheduled'
  },
  {
    id: 'appt-11',
    date: '2026-01-20',
    time: '2:30 PM',
    dogId: 'dog-9',
    dogName: 'Buddy',
    ownerName: 'Maria Garcia',
    service: 'De-shedding Treatment',
    status: 'scheduled'
  },
  {
    id: 'appt-12',
    date: '2026-01-22',
    time: '11:30 AM',
    dogId: 'dog-10',
    dogName: 'Lucy',
    ownerName: 'Thomas White',
    service: 'Nail Trim Only',
    status: 'scheduled'
  },
  {
    id: 'appt-13',
    date: '2026-01-23',
    time: '3:00 PM',
    dogId: 'dog-3',
    dogName: 'Daisy',
    ownerName: 'Emma Wilson',
    service: 'Bath & Brush',
    status: 'scheduled'
  },
  {
    id: 'appt-14',
    date: '2026-01-25',
    time: '10:30 AM',
    dogId: 'dog-4',
    dogName: 'Rocky',
    ownerName: 'James Brown',
    service: 'Full Groom',
    status: 'scheduled'
  },
  {
    id: 'appt-15',
    date: '2026-01-28',
    time: '1:30 PM',
    dogId: 'dog-5',
    dogName: 'Luna',
    ownerName: 'Lisa Park',
    service: 'Bath & Brush',
    status: 'scheduled'
  }
]

// Helper functions
export function getAppointmentsForDate(date: string): CalendarAppointment[] {
  return mockAppointments.filter(appt => appt.date === date)
}

export function getAppointmentsForWeek(startDate: string, endDate: string): CalendarAppointment[] {
  return mockAppointments.filter(appt => {
    return appt.date >= startDate && appt.date <= endDate
  })
}

export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getWeekRange(date: Date): { start: string; end: string } {
  const start = new Date(date)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}
