'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const shortcuts: Record<string, string> = {
  '1': '/',              // Dashboard
  '2': '/clients',       // Clients
  '3': '/calendar',      // Calendar
  '4': '/notifications', // Notifications
  '5': '/history',       // History
  '6': '/settings',      // Settings
  'n': '/calendar/new',  // New appointment
  'r': '/notifications', // Send reminders
}

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ⌘ + ⌥ + number (Mac) or Ctrl + Alt + number (Windows)
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        const route = shortcuts[e.key]
        if (route) {
          e.preventDefault()
          router.push(route)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}
