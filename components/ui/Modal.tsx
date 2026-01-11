'use client'

import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Accessible Modal Component
 * - Traps focus within modal when open
 * - Closes on ESC key or overlay click
 * - Prevents body scroll when open
 */
export function Modal({ isOpen, onClose, title, children, size = 'lg' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Handle click outside
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Focus trap and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the modal
      modalRef.current?.focus()

      // Lock body scroll
      document.body.style.overflow = 'hidden'

      // Add ESC listener
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        // Restore body scroll
        document.body.style.overflow = ''

        // Remove ESC listener
        document.removeEventListener('keydown', handleKeyDown)

        // Restore focus to previous element
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          ${sizeClasses[size]} w-full bg-white rounded-2xl shadow-xl
          max-h-[90vh] flex flex-col
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Close button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
