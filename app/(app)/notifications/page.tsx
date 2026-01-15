import { getTodaysAppointments, getTodayStats, getRecentActivity } from '@/lib/actions/notifications'
import { NotificationsPageClient } from './NotificationsPageClient'

/**
 * Notifications Page (Server Component)
 * Fetches today's appointments, stats, and recent activity
 * Passes data to client component for interactive features
 */
export default async function NotificationsPage() {
  const [appointments, stats, activity] = await Promise.all([
    getTodaysAppointments(),
    getTodayStats(),
    getRecentActivity(5),
  ])

  return (
    <NotificationsPageClient
      initialAppointments={appointments}
      initialStats={stats}
      initialActivity={activity}
    />
  )
}
