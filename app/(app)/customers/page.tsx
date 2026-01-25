'use client'

import { useState } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { mockCustomerStats, mockCustomers, type Customer } from '@/lib/mock/customers'
import { Users, UserCheck, DollarSign, Mail, Phone, Calendar, Dog, MessageSquare, History, X, Plus } from 'lucide-react'

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

function CustomerDetailPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const visits = Math.round(customer.lifetimeSpend / 70)
  const avgTicket = Math.round(customer.lifetimeSpend / visits)

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Customer Overview</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {customer.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {customer.phone}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Lifetime Spend</p>
              <p className="text-2xl font-semibold text-gray-900">${customer.lifetimeSpend}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Estimated Visits</p>
              <p className="text-2xl font-semibold text-gray-900">{visits}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Avg Ticket</p>
              <p className="text-2xl font-semibold text-gray-900">${avgTicket}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Last Visit</p>
              <p className="text-2xl font-semibold text-gray-900">{customer.lastVisit}</p>
            </div>
          </div>

          {/* Dogs */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Dog className="w-4 h-4" />
              Dogs ({customer.dogs.length})
            </h4>
            <div className="space-y-2">
              {customer.dogs.map((dogName, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{dogName}</p>
                    <p className="text-sm text-gray-500">Dog</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="secondary" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="secondary" className="justify-start">
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
              <Button variant="secondary" className="justify-start">
                <Dog className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage pet parents, contact details, and spending history.</p>
        </div>
        <Button href="/customers/new">
          <Plus className="w-4 h-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Customers"
          value={mockCustomerStats.totalCustomers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active This Month"
          value={mockCustomerStats.activeThisMonth}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Avg Spend / Customer"
          value={`$${mockCustomerStats.avgSpendPerCustomer.toFixed(2)}`}
          icon={DollarSign}
          color="rose"
        />
      </div>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dogs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{customer.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Dog className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{customer.dogs.length} dogs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.lifetimeSpend}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={customer.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedCustomer(null)}
          />
          <CustomerDetailPanel
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      )}
    </div>
  )
}
