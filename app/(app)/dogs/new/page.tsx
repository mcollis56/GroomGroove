'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Owner {
  id: string
  name: string
  phone: string | null
  email: string | null
}

export default function NewDogPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [owners, setOwners] = useState<Owner[]>([])
  const [loadingOwners, setLoadingOwners] = useState(true)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    customer_id: '',
    weight: '',
    notes: ''
  })

  // New Owner Modal state
  const [showNewOwnerModal, setShowNewOwnerModal] = useState(false)
  const [newOwnerLoading, setNewOwnerLoading] = useState(false)
  const [newOwnerData, setNewOwnerData] = useState({
    name: '',
    phone: '',
    email: ''
  })

  // Load owners on mount
  useEffect(() => {
    async function loadOwners() {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .order('name')

      if (error) {
        console.error('Failed to load owners:', error)
      } else {
        setOwners(data || [])
      }
      setLoadingOwners(false)
    }
    loadOwners()
  }, [])

  // Handle creating a new owner
  const handleCreateOwner = async () => {
    if (!newOwnerData.name.trim()) {
      alert('Owner name is required')
      return
    }

    setNewOwnerLoading(true)

    try {
      // Convert empty strings to null to avoid duplicate key violations
      const emailValue = newOwnerData.email.trim() === '' ? null : newOwnerData.email.trim()
      const phoneValue = newOwnerData.phone.trim() === '' ? null : newOwnerData.phone.trim()

      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: newOwnerData.name.trim(),
          phone: phoneValue,
          email: emailValue
        })
        .select()
        .single()

      if (error) throw error

      // Add to owners list and select the new owner
      setOwners(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setFormData(prev => ({ ...prev, customer_id: data.id }))

      // Reset and close modal
      setNewOwnerData({ name: '', phone: '', email: '' })
      setShowNewOwnerModal(false)
    } catch (error: any) {
      alert('Failed to create owner: ' + error.message)
    } finally {
      setNewOwnerLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Dog name is required')
      return
    }
    if (!formData.customer_id) {
      alert('Please select an owner')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('dogs')
        .insert({
          name: formData.name.trim(),
          breed: formData.breed || null,
          customer_id: formData.customer_id,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          notes: formData.notes || null
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
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link href="/dogs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dogs
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Dog</h1>
        <p className="text-gray-500">Register a new furry client</p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dog Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dog Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Bella"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Breed */}
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

            {/* Owner - with Add New button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner *
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className={`${inputClass} flex-1`}
                  disabled={loadingOwners}
                >
                  <option value="">
                    {loadingOwners ? 'Loading...' : 'Select owner...'}
                  </option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewOwnerModal(true)}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                placeholder="e.g., 45"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Any special care instructions, allergies, or behavioral notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Dog'
              )}
            </Button>
            <Link href="/dogs">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      {/* New Owner Modal */}
      <Modal
        isOpen={showNewOwnerModal}
        onClose={() => setShowNewOwnerModal(false)}
        title="Add New Owner"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g., John Smith"
              value={newOwnerData.name}
              onChange={(e) => setNewOwnerData({ ...newOwnerData, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              placeholder="e.g., (555) 123-4567"
              value={newOwnerData.phone}
              onChange={(e) => setNewOwnerData({ ...newOwnerData, phone: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="e.g., john@example.com"
              value={newOwnerData.email}
              onChange={(e) => setNewOwnerData({ ...newOwnerData, email: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCreateOwner}
              disabled={newOwnerLoading}
              className="flex-1"
            >
              {newOwnerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Select'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNewOwnerModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
