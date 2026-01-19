'use client'

import { useState } from 'react'
import { Smile, UserPlus, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { type Groomer } from '@/lib/actions/groomers'

interface GroomersPageClientProps {
  initialGroomers: Groomer[]
}

// Generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Get role badge color
const getRoleBadgeClass = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'bg-purple-100 text-purple-800'
    case 'senior groomer':
      return 'bg-blue-100 text-blue-800'
    case 'groomer':
      return 'bg-green-100 text-green-800'
    case 'trainee':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function GroomersPageClient({ initialGroomers }: GroomersPageClientProps) {
  const [groomers, setGroomers] = useState<Groomer[]>(initialGroomers)

  const totalGroomers = groomers.length
  const activeGroomers = groomers.filter(m => m.role.toLowerCase().includes('groomer')).length
  const ownersAdmins = groomers.filter(m => m.role.toLowerCase() === 'owner' || m.role.toLowerCase() === 'admin').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Smile className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groomers</h1>
            <p className="text-gray-500">Manage your grooming team</p>
          </div>
        </div>
        <Button
          href="/groomers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Groomer
        </Button>
      </div>

      {/* Groomer Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Groomers</p>
          <p className="text-2xl font-bold text-gray-900">{totalGroomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active Groomers</p>
          <p className="text-2xl font-bold text-gray-900">{activeGroomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Owners/Admins</p>
          <p className="text-2xl font-bold text-gray-900">{ownersAdmins}</p>
        </div>
      </div>

      {/* Groomers List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {groomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smile className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No groomers yet</h2>
            <p className="text-gray-500 mb-6">Add your first groomer to get started.</p>
            <Button
              href="/groomers/new"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Groomer
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Groomer
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Calendar Color
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groomers.map((groomer) => (
                <tr key={groomer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {groomer.avatar_url ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={groomer.avatar_url}
                            alt={groomer.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: groomer.color || '#3B82F6' }}
                        >
                          {getInitials(groomer.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{groomer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {groomer.email ? (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span>{groomer.email}</span>
                        </div>
                      ) : null}
                      {groomer.phone ? (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{groomer.phone}</span>
                        </div>
                      ) : null}
                      {!groomer.email && !groomer.phone && (
                        <span className="text-gray-400 italic text-sm">No contact info</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(groomer.role)}`}>
                      {groomer.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: groomer.color || '#3B82F6' }}
                      />
                      <span className="text-sm text-gray-500">{groomer.color || '#3B82F6'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Groomers will appear in the calendar with their assigned color.
          You can manage groomers in the Settings page.
        </p>
      </div>
    </div>
  )
}
