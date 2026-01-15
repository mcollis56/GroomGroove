'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Mail, Phone, Calendar, Dog, MessageSquare, History, X, Trash2 } from 'lucide-react'
import { deleteClient } from '@/lib/actions/clients'

interface ClientDog {
  id: string
  name: string
  breed: string | null
  notes: string | null
}

interface Client {
  id: string
  surname: string
  firstName: string
  email: string
  phone: string
  dogs: ClientDog[]
  lastVisit: string | null
  concerns: string | null
  status: 'active' | 'vip' | 'inactive'
}

interface ClientsTableProps {
  clients: Client[]
}

function StatusBadge({ status }: { status: 'active' | 'vip' | 'inactive' }) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    vip: 'bg-purple-100 text-purple-700',
    inactive: 'bg-gray-100 text-gray-600',
  }
  const labels = {
    active: 'Active',
    vip: 'VIP',
    inactive: 'Inactive',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function ClientDetailPanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClient = async () => {
    setDeleting(true)
    const result = await deleteClient(client.id)
    
    if (result.success) {
      router.refresh()
      onClose()
    } else {
      alert(result.error || 'Failed to delete client')
      setDeleting(false)
    }
  }

  return (
    <>
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Human Overview</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {client.surname}, {client.firstName}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {client.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </p>
              )}
              {client.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </p>
              )}
            </div>
          </div>

          {/* Dogs */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Dog className="w-4 h-4" />
              Dogs ({client.dogs.length})
            </h4>
            <div className="space-y-2">
              {client.dogs.map((dog) => (
                <Link
                  key={dog.id}
                  href={`/dogs/${dog.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{dog.name}</p>
                    <p className="text-sm text-gray-500">{dog.breed || 'Unknown breed'}</p>
                    {dog.notes && (
                      <p className="text-xs text-amber-600 mt-1">{dog.notes}</p>
                    )}
                  </div>
                  <Badge variant="default">View</Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              {client.phone && (
                <a href={`sms:${client.phone}`}>
                  <Button variant="secondary" className="justify-start w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </a>
              )}
              {!client.phone && (
                <Button variant="secondary" className="justify-start" disabled>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              )}
              <Link href="/calendar/new" onClick={onClose}>
                <Button variant="secondary" className="justify-start w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <Link href="/history" onClick={onClose}>
                <Button variant="secondary" className="justify-start w-full">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </Link>
              {client.dogs.length > 0 && (
                <Link href={`/dogs/${client.dogs[0].id}`} onClick={onClose}>
                  <Button variant="secondary" className="justify-start w-full">
                    <Dog className="w-4 h-4 mr-2" />
                    View Dog
                  </Button>
                </Link>
              )}
              {client.dogs.length === 0 && (
                <Button variant="secondary" className="justify-start" disabled>
                  <Dog className="w-4 h-4 mr-2" />
                  No Dogs
                </Button>
              )}
            </div>
          </div>

          {/* Delete Section */}
          <div className="pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Human
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Human?"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-semibold">{client.firstName} {client.surname}</span>? 
            This will also delete:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
            <li>All {client.dogs.length} dog(s)</li>
            <li>All grooming history and appointments</li>
            <li>All associated records</li>
          </ul>
          <p className="text-sm text-red-600 mb-6">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteClient}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Human'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  )
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concerns</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{client.surname || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {client.firstName || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.dogs.length > 0 ? (
                        client.dogs.map((dog, i) => (
                          <span key={dog.id}>
                            {i > 0 && ', '}
                            <Link
                              href={`/dogs/${dog.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {dog.name}
                            </Link>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No dogs</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.phone || '—'}</div>
                    {client.email && <div className="text-sm text-gray-400">{client.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {client.concerns ? (
                      <span className="text-sm text-amber-700">{client.concerns}</span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.lastVisit || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={client.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedClient && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedClient(null)}
          />
          <ClientDetailPanel
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        </>
      )}
    </>
  )
}
