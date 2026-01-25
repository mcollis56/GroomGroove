'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import LogoutButton from '@/components/LogoutButton'

interface HeaderProps {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search dogs, appointments..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative text-stone-500 hover:text-stone-700 hover:bg-stone-100">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </Button>

        {userEmail && (
          <span className="text-sm text-stone-500 hidden sm:block">
            {userEmail}
          </span>
        )}

        <LogoutButton />
      </div>
    </header>
  )
}
