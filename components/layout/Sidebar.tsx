'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Dog, Calendar, Bell, Clock, Settings, Image as ImageIcon, Smile } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dogs', label: 'Dogs', icon: Dog },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/photos', label: 'Photos', icon: ImageIcon },
  { href: '/groomers', label: 'Groomers', icon: Smile },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-stone-100 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-stone-100">
        <Link href="/dashboard" className="flex items-center justify-center">
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

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-stone-400')} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Pro Tip Footer */}
      <div className="p-4 border-t border-stone-100">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-4 border border-teal-100">
          <p className="text-xs font-semibold text-teal-700 mb-1">Pro Tip</p>
          <p className="text-sm text-stone-600">
            Use keyboard shortcuts for faster navigation!
          </p>
        </div>
      </div>
    </aside>
  )
}
