'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, FileText, Camera, X, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { addGroomingNote, updateGroomingPreferences, deleteDog, type GroomingPreferences } from '@/lib/actions/dogs'
import { uploadDogPhoto, deleteDogPhoto } from '@/lib/actions/photos'
import { useRouter } from 'next/navigation'

interface DogQuickActionsProps {
  dogId: string
  dogName: string
  customerPhone: string | null
  photoUrl: string | null
  groomingPreferences?: GroomingPreferences
  isDemo?: boolean
}

// Editable Grooming Preferences Panel
interface EditableGroomingPreferencesProps {
  dogId: string
  initialPreferences: GroomingPreferences
  isDemo?: boolean
}

export function EditableGroomingPreferences({ dogId, initialPreferences, isDemo }: EditableGroomingPreferencesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [preferences, setPreferences] = useState<GroomingPreferences>(initialPreferences)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsEditing(false)
      setSaving(false)
      return
    }

    const result = await updateGroomingPreferences(dogId, preferences)
    if (result.success) {
      setIsEditing(false)
      window.location.reload()
    }

    setSaving(false)
  }

  const handleCancel = () => {
    setPreferences(initialPreferences)
    setIsEditing(false)
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Grooming Preferences</h3>
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blade Size
                </label>
                <select
                  value={preferences.blade_size || ''}
                  onChange={(e) => setPreferences({ ...preferences, blade_size: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select blade</option>
                  <option value="3F">3F</option>
                  <option value="4F">4F</option>
                  <option value="5f">5f</option>
                  <option value="7f">7f</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comb Attachment
                </label>
                <select
                  value={preferences.comb_attachment || ''}
                  onChange={(e) => setPreferences({ ...preferences, comb_attachment: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select comb</option>
                  <option value="3mm">3mm</option>
                  <option value="6mm">6mm</option>
                  <option value="10mm">10mm</option>
                  <option value="13mm">13mm</option>
                  <option value="16mm">16mm</option>
                  <option value="19mm">19mm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Service
              </label>
              <select
                value={preferences.default_service || ''}
                onChange={(e) => setPreferences({ ...preferences, default_service: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Select service</option>
                <option value="Full Groom">Full Groom</option>
                <option value="Bath and tidy">Bath and tidy</option>
                <option value="Bath and dry">Bath and dry</option>
                <option value="Bath/tidy/de-shed">Bath/tidy/de-shed</option>
                <option value="Nail trim">Nail trim</option>
                <option value="Puppy Groom">Puppy Groom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clipping Notes
              </label>
              <textarea
                value={preferences.clipping_notes || ''}
                onChange={(e) => setPreferences({ ...preferences, clipping_notes: e.target.value })}
                placeholder="e.g. Shorter on belly, leave tail fluffy..."
                className="w-full h-16 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coat Notes
              </label>
              <textarea
                value={preferences.coat_notes || ''}
                onChange={(e) => setPreferences({ ...preferences, coat_notes: e.target.value })}
                placeholder="e.g. Heavy shedder..."
                className="w-full h-16 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Behavior Notes
              </label>
              <textarea
                value={preferences.behavior_notes || ''}
                onChange={(e) => setPreferences({ ...preferences, behavior_notes: e.target.value })}
                placeholder="e.g. Anxious around dryers..."
                className="w-full h-16 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={preferences.special_instructions || ''}
                onChange={(e) => setPreferences({ ...preferences, special_instructions: e.target.value })}
                placeholder="e.g. Use calming spray..."
                className="w-full h-16 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="space-y-4 cursor-pointer hover:bg-gray-50 -mx-2 -mb-2 p-2 rounded-lg transition-colors"
          >
            {preferences.blade_size && (
              <div>
                <p className="text-sm text-gray-500">Blade Size</p>
                <p className="text-gray-900">{preferences.blade_size}</p>
              </div>
            )}
            {preferences.comb_attachment && (
              <div>
                <p className="text-sm text-gray-500">Comb Attachment</p>
                <p className="text-gray-900">{preferences.comb_attachment}</p>
              </div>
            )}
            {preferences.default_service && (
              <div>
                <p className="text-sm text-gray-500">Default Service</p>
                <p className="text-gray-900">{preferences.default_service}</p>
              </div>
            )}
            {preferences.clipping_notes && (
              <div>
                <p className="text-sm text-gray-500">Clipping Notes</p>
                <p className="text-gray-900">{preferences.clipping_notes}</p>
              </div>
            )}
            {preferences.coat_notes && (
              <div>
                <p className="text-sm text-gray-500">Coat Notes</p>
                <p className="text-gray-900">{preferences.coat_notes}</p>
              </div>
            )}
            {preferences.behavior_notes && (
              <div>
                <p className="text-sm text-gray-500">Behavior Notes</p>
                <p className="text-gray-900">{preferences.behavior_notes}</p>
              </div>
            )}
            {preferences.special_instructions && (
              <div>
                <p className="text-sm text-gray-500">Special Instructions</p>
                <p className="text-gray-900">{preferences.special_instructions}</p>
              </div>
            )}
            {Object.keys(preferences).length === 0 && (
              <p className="text-gray-500 italic">No grooming preferences recorded yet. Tap to add.</p>
            )}
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Tap anywhere to edit
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// Editable General Notes Panel
interface EditableGeneralNotesProps {
  dogId: string
  dogName: string
  initialNotes: string | null
  isDemo?: boolean
}

export function EditableGeneralNotes({ dogId, dogName, initialNotes, isDemo }: EditableGeneralNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsEditing(false)
      setSaving(false)
      return
    }

    const result = await addGroomingNote(dogId, notes)
    if (result.success) {
      setIsEditing(false)
      window.location.reload()
    }

    setSaving(false)
  }

  const handleCancel = () => {
    setNotes(initialNotes || '')
    setIsEditing(false)
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Notes</h3>
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Add notes about ${dogName}...`}
            className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-gray-50 -mx-2 -mb-2 p-2 rounded-lg transition-colors"
          >
            <p className="text-gray-700 whitespace-pre-wrap mb-3">
              {notes || <span className="text-gray-500 italic">No notes yet. Tap to add.</span>}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Tap anywhere to edit
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// Dog Photo Component
interface DogPhotoProps {
  dogId: string
  dogName: string
  photoUrl: string | null
  isDemo?: boolean
}

export function DogPhoto({ dogId, dogName, photoUrl, isDemo }: DogPhotoProps) {
  const [currentPhoto, setCurrentPhoto] = useState(photoUrl)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    if (isDemo) {
      // Demo mode - create a local preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setCurrentPhoto(event.target?.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
      return
    }

    const formData = new FormData()
    formData.append('photo', file)

    const result = await uploadDogPhoto(dogId, formData)

    if (result.success && result.url) {
      setCurrentPhoto(result.url)
    } else {
      setError(result.error || 'Upload failed')
    }

    setUploading(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (isDemo) {
      setCurrentPhoto(null)
      return
    }

    setDeleting(true)
    const result = await deleteDogPhoto(dogId)

    if (result.success) {
      setCurrentPhoto(null)
    } else {
      setError(result.error || 'Delete failed')
    }

    setDeleting(false)
  }

  return (
    <div className="relative">
      {currentPhoto ? (
        <div className="relative w-24 h-24 rounded-full overflow-hidden group">
          <Image
            src={currentPhoto}
            alt={dogName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
              className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
              title="Change photo"
            >
              <Camera className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleDelete}
              disabled={uploading || deleting}
              className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
              title="Remove photo"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
              ) : (
                <X className="w-4 h-4 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 bg-rose-100 rounded-full flex flex-col items-center justify-center text-rose-600 hover:bg-rose-200 transition-colors cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <span className="text-3xl mb-1">🐕</span>
              <span className="text-xs flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Add
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  )
}

export function DogQuickActions({ dogId, dogName, customerPhone, photoUrl, groomingPreferences = {}, isDemo }: DogQuickActionsProps) {
  const router = useRouter()
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(photoUrl)
  const [uploading, setUploading] = useState(false)
  const [preferences, setPreferences] = useState<GroomingPreferences>(groomingPreferences)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    if (isDemo) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCurrentPhoto(event.target?.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
      return
    }

    const formData = new FormData()
    formData.append('photo', file)

    const result = await uploadDogPhoto(dogId, formData)

    if (result.success && result.url) {
      setCurrentPhoto(result.url)
    }

    setUploading(false)
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  // Focus textarea when modal opens
  useEffect(() => {
    if (showNoteModal && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [showNoteModal])

  const handleSave = async () => {
    if (!note.trim()) return

    setSaving(true)

    if (isDemo) {
      // Demo mode - just show success without persisting
      await new Promise(resolve => setTimeout(resolve, 500))
      setSaved(true)
      setTimeout(() => {
        setShowNoteModal(false)
        setNote('')
        setSaved(false)
      }, 1000)
    } else {
      const result = await addGroomingNote(dogId, note.trim())
      if (result.success) {
        setSaved(true)
        setTimeout(() => {
          setShowNoteModal(false)
          setNote('')
          setSaved(false)
        }, 1000)
      }
    }

    setSaving(false)
  }

  const handleCancel = () => {
    setShowNoteModal(false)
    setNote('')
  }

  const handleSavePreferences = async () => {
    setSaving(true)

    if (isDemo) {
      // Demo mode - just show success without persisting
      await new Promise(resolve => setTimeout(resolve, 500))
      setSaved(true)
      setTimeout(() => {
        setShowPreferencesModal(false)
        setSaved(false)
      }, 1000)
    } else {
      const result = await updateGroomingPreferences(dogId, preferences)
      if (result.success) {
        setSaved(true)
        setTimeout(() => {
          setShowPreferencesModal(false)
          setSaved(false)
          // Reload page to show updated preferences
          window.location.reload()
        }, 1000)
      }
    }

    setSaving(false)
  }

  const handleCancelPreferences = () => {
    setShowPreferencesModal(false)
    setPreferences(groomingPreferences)
  }

  const handleDeleteDog = async () => {
    if (isDemo) {
      // In demo mode, just navigate away
      router.push('/dogs')
      return
    }

    setDeleting(true)
    const result = await deleteDog(dogId)
    
    if (result.success) {
      router.push('/dogs')
    } else {
      alert(result.error || 'Failed to delete dog')
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/calendar/new" className="block">
              <Button variant="secondary" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Grooming
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => setShowPreferencesModal(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Grooming Notes & Preferences
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : currentPhoto ? 'Change Photo' : 'Add Photo'}
            </Button>
            <div className="pt-3 border-t border-gray-200">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Dog
              </Button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Add Grooming Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={handleCancel}
        title={`Add Grooming Note for ${dogName}`}
        size="md"
      >
        <div className="p-6">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Nervous during dryer, prefers low heat..."
            className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            disabled={saving || saved}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!note.trim() || saving || saved}
            >
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Grooming Preferences Modal */}
      <Modal
        isOpen={showPreferencesModal}
        onClose={handleCancelPreferences}
        title={`Grooming Preferences for ${dogName}`}
        size="lg"
      >
        <div className="p-6 space-y-6">
          {/* Blade & Comb */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blade Size
              </label>
              <select
                value={preferences.blade_size || ''}
                onChange={(e) => setPreferences({ ...preferences, blade_size: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving || saved}
              >
                <option value="">Select blade</option>
                <option value="3F">3F</option>
                <option value="4F">4F</option>
                <option value="5f">5f</option>
                <option value="7f">7f</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comb Attachment
              </label>
              <select
                value={preferences.comb_attachment || ''}
                onChange={(e) => setPreferences({ ...preferences, comb_attachment: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving || saved}
              >
                <option value="">Select comb</option>
                <option value="3mm">3mm</option>
                <option value="6mm">6mm</option>
                <option value="10mm">10mm</option>
                <option value="13mm">13mm</option>
                <option value="16mm">16mm</option>
                <option value="19mm">19mm</option>
              </select>
            </div>
          </div>

          {/* Default Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Service
            </label>
            <select
              value={preferences.default_service || ''}
              onChange={(e) => setPreferences({ ...preferences, default_service: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving || saved}
            >
              <option value="">Select service</option>
              <option value="Full Groom">Full Groom</option>
              <option value="Bath and tidy">Bath and tidy</option>
              <option value="Bath and dry">Bath and dry</option>
              <option value="Bath/tidy/de-shed">Bath/tidy/de-shed</option>
              <option value="Nail trim">Nail trim</option>
              <option value="Puppy Groom">Puppy Groom</option>
            </select>
          </div>

          {/* Clipping Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clipping Notes
            </label>
            <textarea
              value={preferences.clipping_notes || ''}
              onChange={(e) => setPreferences({ ...preferences, clipping_notes: e.target.value })}
              placeholder="e.g. Shorter on belly, leave tail fluffy..."
              className="w-full h-20 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving || saved}
            />
          </div>

          {/* Coat Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coat Notes
            </label>
            <textarea
              value={preferences.coat_notes || ''}
              onChange={(e) => setPreferences({ ...preferences, coat_notes: e.target.value })}
              placeholder="e.g. Heavy shedder, matting behind ears, sensitive skin..."
              className="w-full h-20 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving || saved}
            />
          </div>

          {/* Behavior Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Behavior Notes
            </label>
            <textarea
              value={preferences.behavior_notes || ''}
              onChange={(e) => setPreferences({ ...preferences, behavior_notes: e.target.value })}
              placeholder="e.g. Anxious around dryers, doesn't like paws touched..."
              className="w-full h-20 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving || saved}
            />
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={preferences.special_instructions || ''}
              onChange={(e) => setPreferences({ ...preferences, special_instructions: e.target.value })}
              placeholder="e.g. Use calming spray, take frequent breaks..."
              className="w-full h-20 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving || saved}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleCancelPreferences}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePreferences}
              disabled={saving || saved}
            >
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Dog?"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-semibold">{dogName}</span>? 
            This will also delete all associated grooming history and appointments.
          </p>
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
              onClick={handleDeleteDog}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Dog'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
