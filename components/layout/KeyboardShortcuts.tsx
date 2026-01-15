'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const shortcuts: Record<string, string> = {
  '1': '/',              // Dashboard
  '2': '/clients',       // Humans
  '3': '/dogs',          // Dogs
  '4': '/calendar',      // Calendar
  '5': '/notifications', // Notifications
  '6': '/history',       // History
  '7': '/settings',      // Settings
  'n': '/calendar/new',  // New appointment
  'd': '/dogs',          // Dogs shortcut
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
