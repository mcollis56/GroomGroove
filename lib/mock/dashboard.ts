// Mock data for dashboard - will be replaced with real DB calls later

export const mockStats = {
  todayAppointments: 8,
  totalDogs: 47,
  pendingConfirmations: 3,
}

export const mockStaffOnDuty = [
  {
    id: '1',
    name: 'Jessica Martinez',
    status: 'working' as const,
  },
  {
    id: '2',
    name: 'David Kim',
    status: 'working' as const,
  },
  {
    id: '3',
    name: 'Ashley Thompson',
    status: 'break' as const,
  },
]

export type StaffMember = typeof mockStaffOnDuty[number]

export const mockTodayAppointments = [
  {
    id: '1',
    time: '9:00 AM',
    dogName: 'Bella',
    breed: 'Golden Retriever',
    ownerName: 'Sarah Johnson',
    service: 'Full Groom',
    flags: ['first-visit'],
    status: 'confirmed' as const,
  },
  {
    id: '2',
    time: '10:30 AM',
    dogName: 'Max',
    breed: 'German Shepherd',
    ownerName: 'Mike Chen',
    service: 'Bath & Brush',
    flags: ['anxious'],
    status: 'confirmed' as const,
  },
  {
    id: '3',
    time: '12:00 PM',
    dogName: 'Daisy',
    breed: 'Poodle',
    ownerName: 'Emma Wilson',
    service: 'Full Groom + Nail Trim',
    flags: [],
    status: 'in_progress' as const,
  },
  {
    id: '4',
    time: '2:00 PM',
    dogName: 'Rocky',
    breed: 'Bulldog',
    ownerName: 'James Brown',
    service: 'Nail Trim Only',
    flags: ['nail-sensitive'],
    status: 'pending_confirmation' as const,
  },
  {
    id: '5',
    time: '3:30 PM',
    dogName: 'Luna',
    breed: 'Husky',
    ownerName: 'Lisa Park',
    service: 'De-shedding Treatment',
    flags: ['heavy-shedder'],
    status: 'pending_confirmation' as const,
  },
]

export const mockQuickActions = [
  { id: 'new-appointment', label: 'New Appointment', icon: 'calendar-plus' },
  { id: 'add-dog', label: 'Add Dog', icon: 'dog' },
  { id: 'send-reminder', label: 'Send Reminders', icon: 'bell' },
  { id: 'view-reports', label: 'View Reports', icon: 'chart' },
]

export type Appointment = typeof mockTodayAppointments[number]
export type Stats = typeof mockStats
