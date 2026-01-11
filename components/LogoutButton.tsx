'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-3 text-sm font-medium text-rose-700 bg-white/80 backdrop-blur-sm border-2 border-rose-200 rounded-xl hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 min-h-[44px] shadow-md transition-all duration-200"
    >
      👋 Logout
    </button>
  )
}
