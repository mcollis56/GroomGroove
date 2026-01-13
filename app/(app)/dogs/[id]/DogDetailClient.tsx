'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, FileText, Dog, User, Camera, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { addGroomingNote } from '@/lib/actions/dogs'
import { uploadDogPhoto, deleteDogPhoto } from '@/lib/actions/photos'

interface DogQuickActionsProps {
  dogId: string
  dogName: string
  customerPhone: string | null
  photoUrl: string | null
  isDemo?: boolean
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

export function DogQuickActions({ dogId, dogName, customerPhone, photoUrl, isDemo }: DogQuickActionsProps) {
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(photoUrl)
  const [uploading, setUploading] = useState(false)
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
              onClick={() => setShowNoteModal(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Grooming Note
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
            <Button variant="secondary" className="w-full justify-start">
              <Dog className="w-4 h-4 mr-2" />
              Update Preferences
            </Button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {customerPhone && (
              <a href={`tel:${customerPhone}`} className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Call Owner
                </Button>
              </a>
            )}
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
    </>
  )
}
