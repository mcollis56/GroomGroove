'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

// --- Types ---
interface Owner {
  id: string
  name: string
  phone: string | null
  email: string | null
}

// --- ISOLATED FORM COMPONENT (Prevents Focus Jumping) ---
function AddOwnerForm({ 
  userId, 
  onSuccess, 
  onCancel 
}: { 
  userId: string | null, 
  onSuccess: (owner: Owner) => void, 
  onCancel: () => void 
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return alert('Owner name is required')
    if (!userId) return alert('You must be logged in')

    setLoading(true)
    try {
      const emailValue = formData.email.trim() === '' ? null : formData.email.trim()
      const phoneValue = formData.phone.trim() === '' ? null : formData.phone.trim()

      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: formData.name.trim(),
          phone: phoneValue,
          email: emailValue,
          user_id: userId
        })
        .select()
        .single()

      if (error) throw error
      onSuccess(data)
    } catch (error: any) {
      alert('Failed to create owner: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"

  return (
    <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          autoFocus // We only autofocus this ONCE when this specific component mounts
          placeholder="e.g., John Smith"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={inputClass}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          placeholder="e.g., (555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className={inputClass}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="e.g., john@example.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={inputClass}
          autoComplete="new-password"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Owner'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function NewDogPage() {
  const router = useRouter()
  const supabase = createClient()

  // Main Form State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [owners, setOwners] = useState<Owner[]>([])
  const [loadingOwners, setLoadingOwners] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Modal State (Simplified)
  const [showNewOwnerModal, setShowNewOwnerModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    customer_id: '',
    weight: '',
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .order('name')

      if (error) console.error('Failed to load owners:', error)
      else setOwners(data || [])
      setLoadingOwners(false)
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return alert('Dog name is required')
    if (!formData.customer_id) return alert('Please select an owner')
    if (!userId) return alert('You must be logged in')

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('dogs').insert({
        name: formData.name.trim(),
        breed: formData.breed || null,
        customer_id: formData.customer_id,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: formData.notes || null,
        user_id: userId
      })
      if (error) throw error
      router.push('/dogs')
      router.refresh()
    } catch (error: any) {
      alert('Failed to add dog: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dogs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dogs
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Dog</h1>
        <p className="text-gray-500">Register a new furry client</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dog Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Bella"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                placeholder="e.g., Golden Retriever"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
              <div className="flex gap-2">
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className={`${inputClass} flex-1`}
                  disabled={loadingOwners}
                >
                  <option value="">{loadingOwners ? 'Loading...' : 'Select owner...'}</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                  ))}
                </select>
                <Button type="button" variant="secondary" onClick={() => setShowNewOwnerModal(true)} className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g., 45"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Dog'}
            </Button>
            <Link href="/dogs"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </Card>

      {/* MODAL USAGE */}
      <Modal
        isOpen={showNewOwnerModal}
        onClose={() => setShowNewOwnerModal(false)}
        title="Add New Owner"
        size="sm"
      >
        <div className="p-6">
          {/* We render the isolated form here. 
              Typing inside it DOES NOT trigger a re-render of NewDogPage, 
              so the Modal doesn't blink or reset focus. */}
          <AddOwnerForm
            userId={userId}
            onCancel={() => setShowNewOwnerModal(false)}
            onSuccess={(newOwner) => {
              setOwners(prev => [...prev, newOwner].sort((a, b) => a.name.localeCompare(b.name)))
              setFormData(prev => ({ ...prev, customer_id: newOwner.id }))
              setShowNewOwnerModal(false)
            }}
          />
        </div>
      </Modal>
    </div>
  )
}