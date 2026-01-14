'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Users, Dog, Calendar, Bell, Clock, Settings, Image as ImageIcon } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/dogs', label: 'Dogs', icon: Dog },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/photos', label: 'Photos', icon: ImageIcon },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/oh-my-dawg-logo.png"
            alt="Oh My Dawg! Grooming"
            width={180}
            height={120}
            priority
            className="object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Pro Tip</p>
          <p className="text-sm text-gray-700">
            Use keyboard shortcuts for faster navigation!
          </p>
        </div>
      </div>
    </aside>
  )
}
