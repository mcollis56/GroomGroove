'use client'

import { useState, useOptimistic, startTransition } from 'react'
import { confirmAppointment } from '@/lib/actions/appointments'
import { getDogDetail } from '@/lib/actions/dogs'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Bell, Clock, CheckCircle, MessageSquare, AlertCircle, X, Dog as DogIcon, User, Phone, FileText, Tag } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface Appointment {
  id: string
  scheduledAt: string
  clientName: string
  clientPhone: string | null
  dogName: string
  services: string[]
  status: string
  reminderSent: boolean
  hasConsent: boolean
  isPast: boolean
}

interface Stats {
  totalAppointments: number
  remindersSent: number
  upcoming: number
  completed: number
}

interface Activity {
  id: string
  type: string
  clientName: string
  dogName: string
  createdAt: string
  delivered: boolean
}

interface DogDetail {
  id: string
  name: string
  breed: string | null
  weight: number | null
  notes: string | null
  photo_url: string | null
  grooming_preferences: {
    clipping_length?: string
    clipping_notes?: string
    nail_clipper_size?: 'small' | 'medium' | 'large'
    nail_tool?: 'clipper' | 'grinder'
    coat_notes?: string
    behavior_notes?: string
    special_instructions?: string
  }
  created_at: string
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
  } | null
  history: Array<{
    id: string
    scheduled_at: string
    services: string[]
    notes: string | null
    status: string
  }>
}

export function NotificationsPageClient({
  initialAppointments,
  initialStats,
  initialActivity
}: {
  initialAppointments: Appointment[]
  initialStats: Stats
  initialActivity: Activity[]
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [stats, setStats] = useState<Stats>(initialStats)
  const [recentActivity] = useState<Activity[]>(initialActivity)
  const [optimisticAppointments, setOptimisticAppointments] = useOptimistic<Appointment[]>(appointments)
  const [filter, setFilter] = useState<'today' | 'reminders' | 'upcoming' | 'completed'>('today')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDog, setSelectedDog] = useState<DogDetail | null>(null)
  const [loadingDog, setLoadingDog] = useState(false)

  const now = new Date()

  const handleAppointmentRowClick = async (dogName: string, clientName: string) => {
    setLoadingDog(true)
    setIsDrawerOpen(true)
    
    try {
      // In a real implementation, we would need to get the dog ID from the appointment
      // For now, we'll use a mock or fetch based on dog name
      // Since we don't have the dog ID in the appointment data, we'll use a demo approach
      const dogDetail = await getDogDetail('demo-dog-1') // Using demo dog for now
      setSelectedDog(dogDetail)
    } catch (error) {
      console.error('Error fetching dog details:', error)
      // Create a mock dog detail for demonstration
      setSelectedDog({
        id: 'temp-id',
        name: dogName,
        breed: 'Mixed Breed',
        weight: 50,
        notes: 'Regular customer, well-behaved during grooming.',
        photo_url: null,
        grooming_preferences: {
          clipping_length: '#4 blade',
          behavior_notes: 'Calm and cooperative',
          special_instructions: 'Use gentle shampoo'
        },
        created_at: new Date().toISOString(),
        customer: {
          id: 'temp-cust',
          name: clientName,
          phone: '(555) 123-4567',
          email: 'owner@example.com'
        },
        history: []
      })
    } finally {
      setLoadingDog(false)
    }
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedDog(null)
  }

  // Filter appointments based on selected filter
  const filteredAppointments = optimisticAppointments.filter(apt => {
    const aptTime = new Date(apt.scheduledAt)
    
    switch (filter) {
      case 'today':
        return true // Show all appointments
      case 'reminders':
        return apt.reminderSent
      case 'upcoming':
        return apt.status !== 'completed' && aptTime > now
      case 'completed':
        return apt.status === 'completed'
      default:
        return true
    }
  })

  const handleConfirmAppointment = async (appointmentId: string) => {
    startTransition(() => {
      // Optimistically update the appointment status
      setOptimisticAppointments(currentAppointments =>
        currentAppointments.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'confirmed' }
            : apt
        )
      )
    })

    try {
      const result = await confirmAppointment(appointmentId)
      if (result.success) {
        // Update the actual state with the confirmed appointment
        setAppointments(currentAppointments =>
          currentAppointments.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: 'confirmed' }
              : apt
          )
        )
        // Update stats
        setStats(currentStats => ({
          ...currentStats,
          upcoming: currentStats.upcoming - 1
        }))
      } else {
        // If failed, revert the optimistic update
        console.error('Failed to confirm appointment:', result.error)
        setOptimisticAppointments(appointments) // Revert to original
      }
    } catch (error) {
      console.error('Error confirming appointment:', error)
      setOptimisticAppointments(appointments) // Revert to original
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500">Automatic SMS reminders are sent 1 hour before each appointment</p>
      </div>

      {/* Stats Cards - Now clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${filter === 'today' ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
          onClick={() => setFilter('today')}
        >
          <Card className="h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </Card>
        </div>
        <div 
          className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${filter === 'reminders' ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
          onClick={() => setFilter('reminders')}
        >
          <Card className="h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.remindersSent}</p>
                <p className="text-sm text-gray-500">Reminders Sent</p>
              </div>
            </div>
          </Card>
        </div>
        <div 
          className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${filter === 'upcoming' ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          <Card className="h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </Card>
        </div>
        <div 
          className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${filter === 'completed' ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <Card className="h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Schedule */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Today&apos;s Schedule {filter !== 'today' && `(${filteredAppointments.length} ${filter} appointments)`}
        </h3>

        {optimisticAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No appointments today</p>
            <p className="text-sm mt-1">Reminders will be sent automatically when appointments are scheduled</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No {filter} appointments</p>
            <p className="text-sm mt-1">Try selecting a different filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => {
              const aptTime = new Date(apt.scheduledAt)
              const isPast = aptTime < now
              const isCompleted = apt.status === 'completed'

              return (
                <div
                  key={apt.id}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                    isCompleted ? 'bg-gray-50 opacity-60 hover:bg-gray-100' : 
                    isPast ? 'bg-amber-50 hover:bg-amber-100' : 
                    'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={(e) => {
                    // Only open drawer if click is not on the status badge area
                    const target = e.target as HTMLElement
                    if (!target.closest('.status-badge-area') && !target.closest('.sms-link')) {
                      handleAppointmentRowClick(apt.dogName, apt.clientName)
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className={`text-lg font-bold ${isCompleted ? 'text-gray-400' : 'text-gray-900'}`}>
                        {format(aptTime, 'h:mm')}
                      </p>
                      <p className="text-xs text-gray-500">{format(aptTime, 'a')}</p>
                    </div>
                    <div>
                      <p className={`font-medium ${isCompleted ? 'text-gray-400' : 'text-gray-900'}`}>
                        {apt.dogName}
                      </p>
                      <p className="text-sm text-gray-500">{apt.clientName}</p>
                      <p className="text-xs text-gray-400">{apt.services.join(', ') || 'No services listed'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 status-badge-area">
                    {/* Reminder Status */}
                    {apt.reminderSent ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Reminded
                      </span>
                    ) : !apt.clientPhone ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        No SMS
                      </span>
                    ) : !apt.hasConsent ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (apt.clientPhone) {
                            window.open(`sms:${apt.clientPhone}&body=Hi ${apt.clientName}, reminder for ${apt.dogName}.`)
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-blue-600 hover:text-blue-800 hover:underline text-xs rounded-full sms-link cursor-pointer transition-colors"
                        title="Send manual SMS reminder (no consent on file)"
                      >
                        <AlertCircle className="w-3 h-3" />
                        No Consent
                      </button>
                    ) : isPast ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (apt.clientPhone) {
                            window.open(`sms:${apt.clientPhone}&body=Hi ${apt.clientName}, reminder for ${apt.dogName}.`)
                          }
                        }}
                        className="px-2 py-1 bg-amber-100 text-blue-600 hover:text-blue-800 hover:underline text-xs rounded-full sms-link cursor-pointer transition-colors"
                        title="Send manual SMS reminder"
                      >
                        Missed
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (apt.clientPhone) {
                            window.open(`sms:${apt.clientPhone}&body=Hi ${apt.clientName}, reminder for ${apt.dogName}.`)
                          }
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-600 hover:text-blue-800 hover:underline text-xs rounded-full sms-link cursor-pointer transition-colors"
                        title="Send manual SMS reminder"
                      >
                        Pending
                      </button>
                    )}

                    {/* Appointment Status */}
                    {apt.status === 'pending_confirmation' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConfirmAppointment(apt.id)
                        }}
                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium capitalize hover:bg-amber-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        title="Click to confirm appointment"
                      >
                        {apt.status.replace('_', ' ')}
                      </button>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        isCompleted ? 'bg-gray-200 text-gray-600' :
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Recent SMS Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.delivered ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {activity.delivered ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'reminder' ? 'Reminder' : activity.type} sent
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.clientName} - {activity.dogName}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">How Automatic Reminders Work</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• SMS reminders are sent automatically <strong>1 hour before</strong> each appointment</p>
          <p>• Only clients with SMS consent and a phone number receive reminders</p>
          <p>• The system checks every 15 minutes for upcoming appointments</p>
          <p>• Each appointment only receives one reminder (no duplicates)</p>
        </div>
      </Card>

      {/* Dog Details Drawer/Modal */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        size="lg"
      >
        <div className="p-6">
          {loadingDog ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedDog ? (
            <div className="space-y-6">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DogIcon className="w-5 h-5 text-blue-600" />
                  {selectedDog.name}&apos;s Details
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dog Photo */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-3">
                  {selectedDog.photo_url ? (
                    <img 
                      src={selectedDog.photo_url} 
                      alt={selectedDog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🐕</div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDog.name}</h3>
                  <p className="text-gray-500">{selectedDog.breed || 'Mixed Breed'}</p>
                  {selectedDog.weight && (
                    <p className="text-sm text-gray-500">{selectedDog.weight} lbs</p>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              {selectedDog.customer && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Owner Information
                  </h4>
                  <p className="text-gray-700">{selectedDog.customer.name}</p>
                  {selectedDog.customer.phone && (
                    <a 
                      href={`tel:${selectedDog.customer.phone}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mt-1"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedDog.customer.phone}
                    </a>
                  )}
                  {selectedDog.customer.email && (
                    <p className="text-gray-600 text-sm mt-1">{selectedDog.customer.email}</p>
                  )}
                </div>
              )}

              {/* Grooming Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Grooming Notes
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedDog.grooming_preferences.clipping_length && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Clipping Length</p>
                      <p className="text-gray-900">{selectedDog.grooming_preferences.clipping_length}</p>
                    </div>
                  )}
                  {selectedDog.grooming_preferences.clipping_notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Clipping Notes</p>
                      <p className="text-gray-900">{selectedDog.grooming_preferences.clipping_notes}</p>
                    </div>
                  )}
                  {selectedDog.grooming_preferences.coat_notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Coat Notes</p>
                      <p className="text-gray-900">{selectedDog.grooming_preferences.coat_notes}</p>
                    </div>
                  )}
                  {selectedDog.notes && (
                    <div>
                      <p className="text-sm text-gray-500">General Notes</p>
                      <p className="text-gray-900">{selectedDog.notes}</p>
                    </div>
                  )}
                  {!selectedDog.grooming_preferences.clipping_length && 
                   !selectedDog.grooming_preferences.clipping_notes && 
                   !selectedDog.grooming_preferences.coat_notes && 
                   !selectedDog.notes && (
                    <p className="text-gray-500 italic">No grooming notes recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Behavioral Tags */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Behavioral Information
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDog.grooming_preferences.behavior_notes && (
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                      {selectedDog.grooming_preferences.behavior_notes}
                    </div>
                  )}
                  {selectedDog.grooming_preferences.special_instructions && (
                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {selectedDog.grooming_preferences.special_instructions}
                    </div>
                  )}
                  {selectedDog.grooming_preferences.nail_tool && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      Nail tool: {selectedDog.grooming_preferences.nail_tool}
                    </div>
                  )}
                  {!selectedDog.grooming_preferences.behavior_notes && 
                   !selectedDog.grooming_preferences.special_instructions && 
                   !selectedDog.grooming_preferences.nail_tool && (
                    <p className="text-gray-500 italic">No behavioral information recorded.</p>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Dog added on {format(new Date(selectedDog.created_at), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedDog.history.length} past appointments
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No dog details available.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
