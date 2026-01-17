'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dog, User, Calendar, Scissors, AlertCircle, Save, Clock, CheckCircle } from 'lucide-react'
import { getDogDetail, updateGroomingPreferences, type DogDetail, type GroomingPreferences } from '@/lib/actions/dogs'
import { safeParseDate } from '@/lib/utils/date'

interface DogDetailModalProps {
  dogId: string | null
  isOpen: boolean
  onClose: () => void
}

export function DogDetailModal({ dogId, isOpen, onClose }: DogDetailModalProps) {
  const [dog, setDog] = useState<DogDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable preferences state
  const [preferences, setPreferences] = useState<GroomingPreferences>({})

  const loadDogDetail = useCallback(async () => {
    if (!dogId) return

    setLoading(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const data = await getDogDetail(dogId)
      if (data) {
        setDog(data)
        setPreferences(data.grooming_preferences || {})
      } else {
        setError('Dog not found')
      }
    } catch (err) {
      console.error('Failed to load dog:', err)
      setError('Failed to load dog details')
    } finally {
      setLoading(false)
    }
  }, [dogId])

  // Load dog data when modal opens
  useEffect(() => {
    if (isOpen && dogId) {
      loadDogDetail()
    }
  }, [isOpen, dogId, loadDogDetail])

  async function handleSavePreferences() {
    if (!dogId) return

    setSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const result = await updateGroomingPreferences(dogId, preferences)
      if (result.success) {
        setSaveSuccess(true)
        // Update local dog state
        if (dog) {
          setDog({ ...dog, grooming_preferences: preferences })
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to save preferences')
      }
    } catch (err) {
      console.error('Failed to save preferences:', err)
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  function updatePreference<K extends keyof GroomingPreferences>(key: K, value: GroomingPreferences[K]) {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setSaveSuccess(false) // Clear success when editing
  }

  function formatDate(isoString: string): string {
    const date = safeParseDate(isoString)
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatTime(isoString: string): string {
    const date = safeParseDate(isoString)
    if (!date) return 'N/A'
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Dog Details" size="xl">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Modal>
    )
  }

  if (error && !dog) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Dog Details" size="xl">
        <div className="text-center py-12 px-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Error</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </Modal>
    )
  }

  if (!dog) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${dog.name}'s Profile`} size="xl">
      <div className="px-6 py-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">Preferences saved successfully</p>
          </div>
        )}

        <section className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Dog className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{dog.name}</h3>
                {dog.history.length > 0 && (
                  <Badge variant="info">{dog.history.length} visits</Badge>
                )}
              </div>
              <p className="text-gray-600">{dog.breed || 'Unknown breed'}</p>
              {dog.weight && <p className="text-sm text-gray-500">{dog.weight} lbs</p>}

              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{dog.customer?.name || 'No owner'}</p>
                    {dog.customer?.phone && (
                      <p className="text-xs text-gray-500">{dog.customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Visit</p>
                    <p className="text-xs text-gray-500">
                      {dog.history[0] ? formatDate(dog.history[0].scheduled_at) : 'No visits yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Grooming Preferences</h4>
            </div>
            <Button
              onClick={handleSavePreferences}
              disabled={saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clipper Blade Size
                </label>
                <select
                  value={preferences.clipping_length || ''}
                  onChange={(e) => updatePreference('clipping_length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                >
                  <option value="">Not specified</option>
                  <option value="#3 (13mm) - Longer Body">#3 (13mm) - Longer Body</option>
                  <option value="#4 (10mm) - Winter Trim">#4 (10mm) - Winter Trim</option>
                  <option value="#5 (6mm) - Short Puppy Cut">#5 (6mm) - Short Puppy Cut</option>
                  <option value="#7 (3mm) - Summer Cut / Matted">#7 (3mm) - Summer Cut / Matted</option>
                  <option value="#10 (1.8mm) - Sanitary / Paws">#10 (1.8mm) - Sanitary / Paws</option>
                  <option value="#15 (1.2mm) - Pads">#15 (1.2mm) - Pads</option>
                  <option value="#30 (0.5mm) - Under Comb">#30 (0.5mm) - Under Comb</option>
                  <option value="custom">Custom (see notes)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clipping Notes
                </label>
                <input
                  type="text"
                  value={preferences.clipping_notes || ''}
                  onChange={(e) => updatePreference('clipping_notes', e.target.value)}
                  placeholder="e.g., Shorter on belly, leave ears longer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nail Clipper Size
                </label>
                <select
                  value={preferences.nail_clipper_size || ''}
                  onChange={(e) => updatePreference('nail_clipper_size', e.target.value as GroomingPreferences['nail_clipper_size'])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                >
                  <option value="">Not specified</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nail Tool Preference
                </label>
                <select
                  value={preferences.nail_tool || ''}
                  onChange={(e) => updatePreference('nail_tool', e.target.value as GroomingPreferences['nail_tool'])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                >
                  <option value="">Not specified</option>
                  <option value="clipper">Clipper</option>
                  <option value="grinder">Grinder</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coat Handling Notes
              </label>
              <textarea
                value={preferences.coat_notes || ''}
                onChange={(e) => updatePreference('coat_notes', e.target.value)}
                placeholder="e.g., Heavy shedder, prone to matting behind ears, sensitive skin"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Behavior Notes
              </label>
              <textarea
                value={preferences.behavior_notes || ''}
                onChange={(e) => updatePreference('behavior_notes', e.target.value)}
                placeholder="e.g., Anxious around dryers, doesn't like paws touched, needs breaks"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={preferences.special_instructions || ''}
                onChange={(e) => updatePreference('special_instructions', e.target.value)}
                placeholder="e.g., Use calming spray before grooming, owner prefers specific shampoo"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Grooming History</h4>
          </div>

          {dog.history.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dog.history.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(appt.scheduled_at)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(appt.scheduled_at)}
                      </span>
                    </div>
                    <Badge
                      variant={appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'default' : 'info'}
                    >
                      {appt.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {appt.services?.join(', ') || 'No services recorded'}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {appt.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No grooming history yet</p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}
