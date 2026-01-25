import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { KeyboardShortcuts } from './KeyboardShortcuts'

interface AppShellProps {
  children: React.ReactNode
  userEmail?: string
}

export function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#FEFDFB]">
      <KeyboardShortcuts />
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header userEmail={userEmail} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
