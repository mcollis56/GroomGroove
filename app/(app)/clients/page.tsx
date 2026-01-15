import { StatCard } from '@/components/dashboard/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, UserCheck, Plus } from 'lucide-react'
import { getAllClients } from '@/lib/actions/clients'
import { ClientsTable } from './ClientsTable'

export default async function ClientsPage() {
  const clients = await getAllClients()

  const totalClients = clients.length
  const activeThisMonth = clients.filter(c => c.lastVisit !== null).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Humans</h1>
          <p className="text-gray-500">Manage pet parents and their dogs.</p>
        </div>
        <Button href="/clients/new">
          <Plus className="w-4 h-4 mr-2" />
          Add New Human
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Humans"
          value={totalClients}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active This Month"
          value={activeThisMonth}
          icon={UserCheck}
          color="green"
        />
      </div>

      {/* Clients Table */}
      {clients.length > 0 ? (
        <ClientsTable clients={clients} />
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">No humans yet</h3>
          <p className="text-gray-500 mb-4">Add your first human to get started.</p>
          <Button href="/clients/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Human
          </Button>
        </Card>
      )}
    </div>
  )
}
