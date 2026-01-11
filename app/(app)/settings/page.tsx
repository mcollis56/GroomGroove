'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Bell, CreditCard, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <User className="w-5 h-5 text-rose-600" />
            </div>
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              placeholder="Your grooming business name"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive appointment reminders</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-rose-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Reminders</p>
              <p className="text-sm text-gray-500">Send SMS to clients</p>
            </div>
            <input type="checkbox" className="w-5 h-5 accent-rose-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle>Billing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Billing integration coming soon...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="secondary">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}
