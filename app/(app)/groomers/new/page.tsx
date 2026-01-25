'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export default function AddGroomerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [role, setRole] = useState('Groomer')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase
      .from('groomers')
      .insert([{ name, role, color: '#3b82f6' }])
    
    if (error) {
      alert('Error adding groomer: ' + error.message)
      setLoading(false)
    } else {
      router.push('/groomers')
      router.refresh()
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Groomer</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
            {loading ? 'Adding...' : 'Add Groomer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
