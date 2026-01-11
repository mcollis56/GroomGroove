'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, FileText, Dog, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { addGroomingNote } from '@/lib/actions/dogs'

interface DogQuickActionsProps {
  dogId: string
  dogName: string
  customerPhone: string | null
  isDemo?: boolean
}

export function DogQuickActions({ dogId, dogName, customerPhone, isDemo }: DogQuickActionsProps) {
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
            <Button variant="secondary" className="w-full justify-start">
              <Dog className="w-4 h-4 mr-2" />
              Update Preferences
            </Button>
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
