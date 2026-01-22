'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client' // Ensure you have this utility
import { Loader2, Save } from 'lucide-react'
import { BLADE_SIZES } from '@/lib/constants/grooming'

export default function DogForm({ onSuccess }: { onSuccess?: () => void }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    dog_name: '',
    breed: '',
    clipper_blade_size: '10',
    comb_attachment: '',
    default_service: '',
    nail_clipper_size: '',
    grooming_notes: '',
    behavioral_notes: ''
  })

  const COMB_ATTACHMENTS = [
    { value: '3mm', label: '3mm' },
    { value: '6mm', label: '6mm' },
    { value: '10mm', label: '10mm' },
    { value: '13mm', label: '13mm' },
    { value: '16mm', label: '16mm' },
    { value: '19mm', label: '19mm' },
  ]

  const DEFAULT_SERVICES = [
    { value: 'Full Groom', label: 'Full Groom' },
    { value: 'Bath and tidy', label: 'Bath and tidy' },
    { value: 'Bath and dry', label: 'Bath and dry' },
    { value: 'Bath/tidy/de-shed', label: 'Bath/tidy/de-shed' },
    { value: 'Nail trim', label: 'Nail trim' },
    { value: 'Puppy Groom', label: 'Puppy Groom' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      // Build grooming notes with comb attachment and default service appended
      let groomingNotes = formData.grooming_notes || ''
      if (formData.comb_attachment) {
        groomingNotes += `${groomingNotes ? '\n' : ''}Comb Attachment: ${formData.comb_attachment}`
      }
      if (formData.default_service) {
        groomingNotes += `${groomingNotes ? '\n' : ''}Default Service: ${formData.default_service}`
      }

      // Prepare data for insertion
      const dataToInsert = {
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_email: formData.owner_email,
        dog_name: formData.dog_name,
        breed: formData.breed,
        clipper_blade_size: formData.clipper_blade_size,
        nail_clipper_size: formData.nail_clipper_size,
        grooming_notes: groomingNotes,
        behavioral_notes: formData.behavioral_notes,
        user_id: user.id
      }

      const { error } = await supabase
        .from('dogs')
        .insert([dataToInsert])

      if (error) throw error

      setMessage('✅ Dog saved successfully!')
      setFormData({
        owner_name: '', owner_phone: '', owner_email: '',
        dog_name: '', breed: '', clipper_blade_size: '10',
        comb_attachment: '', default_service: '', nail_clipper_size: '', grooming_notes: '', behavioral_notes: ''
      })
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      setMessage('❌ Error saving dog. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full p-4 rounded-lg border border-gray-300 text-lg min-h-[50px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide"

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Human & Dog</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg text-lg font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Owner Section */}
        <div className="bg-gray-50 p-6 rounded-xl space-y-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">👤 Owner Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Owner Name *</label>
              <input 
                required
                type="text" 
                className={inputClass}
                value={formData.owner_name}
                onChange={e => setFormData({...formData, owner_name: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input 
                required
                type="tel" 
                className={inputClass}
                value={formData.owner_phone}
                onChange={e => setFormData({...formData, owner_phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Email (Optional)</label>
              <input 
                type="email" 
                className={inputClass}
                value={formData.owner_email}
                onChange={e => setFormData({...formData, owner_email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Dog Section */}
        <div className="bg-blue-50 p-6 rounded-xl space-y-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">🐕 Dog Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Dog Name *</label>
              <input 
                required
                type="text" 
                className={inputClass}
                value={formData.dog_name}
                onChange={e => setFormData({...formData, dog_name: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Breed</label>
              <input 
                type="text" 
                className={inputClass}
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Grooming Specifics - CRITICAL */}
        <div className="bg-amber-50 p-6 rounded-xl space-y-6 border-2 border-amber-100">
          <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">✂️ Grooming Specifics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Blade Size *</label>
              <select 
                className={`${inputClass} bg-white`}
                value={formData.clipper_blade_size}
                onChange={e => setFormData({...formData, clipper_blade_size: e.target.value})}
              >
                {BLADE_SIZES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Comb Attachment</label>
              <select
                className={`${inputClass} bg-white`}
                value={formData.comb_attachment}
                onChange={e => setFormData({...formData, comb_attachment: e.target.value})}
              >
                <option value="">Select comb attachment</option>
                {COMB_ATTACHMENTS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Service</label>
              <select
                className={`${inputClass} bg-white`}
                value={formData.default_service}
                onChange={e => setFormData({...formData, default_service: e.target.value})}
              >
                <option value="">Select default service</option>
                {DEFAULT_SERVICES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Nail Clipper Size</label>
              <input 
                type="text" 
                placeholder="e.g. Small / Large / Dremel"
                className={inputClass}
                value={formData.nail_clipper_size}
                onChange={e => setFormData({...formData, nail_clipper_size: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Grooming Notes</label>
              <textarea 
                rows={3}
                className={inputClass}
                placeholder="Style preferences, pattern notes..."
                value={formData.grooming_notes}
                onChange={e => setFormData({...formData, grooming_notes: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Behavioral Notes ⚠️</label>
              <textarea 
                rows={2}
                className={`${inputClass} border-red-200 focus:border-red-500 focus:ring-red-200`}
                placeholder="Nervous with dryers, cage aggressive, etc."
                value={formData.behavioral_notes}
                onChange={e => setFormData({...formData, behavioral_notes: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-5 rounded-xl shadow-lg transform transition active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />}
          Save New Human
        </button>
      </form>
    </div>
  )
}
