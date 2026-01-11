import { getTodaysAppointments, getTodayStats, getRecentActivity } from '@/lib/actions/notifications'
import { Card } from '@/components/ui/Card'
import { Bell, Clock, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export default async function NotificationsPage() {
  const [appointments, stats, recentActivity] = await Promise.all([
    getTodaysAppointments(),
    getTodayStats(),
    getRecentActivity(5),
  ])

  const now = new Date()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500">Automatic SMS reminders are sent 1 hour before each appointment</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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

      {/* Today's Schedule */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Today&apos;s Schedule
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No appointments today</p>
            <p className="text-sm mt-1">Reminders will be sent automatically when appointments are scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const aptTime = new Date(apt.scheduledAt)
              const isPast = aptTime < now
              const isCompleted = apt.status === 'completed'

              return (
                <div
                  key={apt.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isCompleted ? 'bg-gray-50 opacity-60' : isPast ? 'bg-amber-50' : 'bg-blue-50'
                  }`}
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

                  <div className="flex items-center gap-3">
                    {/* Reminder Status */}
                    {apt.reminderSent ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Reminded
                      </span>
                    ) : !apt.hasConsent || !apt.clientPhone ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        No SMS
                      </span>
                    ) : isPast ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                        Missed
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Pending
                      </span>
                    )}

                    {/* Appointment Status */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      isCompleted ? 'bg-gray-200 text-gray-600' :
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {apt.status.replace('_', ' ')}
                    </span>
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
    </div>
  )
}
