import { createClient } from '@/utils/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware handles redirect if not authenticated
  // This just gets the user for display purposes
  return <AppShell userEmail={user?.email}>{children}</AppShell>
}
