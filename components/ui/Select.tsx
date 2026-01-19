'use client'

import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Context for Select state
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select')
  }
  return context
}

// Main Select wrapper
interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

function Select({ value, defaultValue = '', onValueChange, children, disabled }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = React.useCallback((newValue: string) => {
    if (disabled) return
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }, [disabled, value, onValueChange])

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// Trigger button
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
          'transition-colors',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

// Value display
interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext()

  return (
    <span className={cn(!value && 'text-gray-400')}>
      {value || placeholder}
    </span>
  )
}

// Dropdown content
interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-lg',
        'max-h-60 overflow-auto',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      {children}
    </div>
  )
}

// Individual item
interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

function SelectItem({ value, children, className, disabled }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext()
  const isSelected = selectedValue === value

  return (
    <div
      onClick={() => !disabled && onValueChange(value)}
      className={cn(
        'flex items-center justify-between px-4 py-2 text-sm cursor-pointer',
        'hover:bg-gray-50',
        isSelected && 'bg-blue-50 text-blue-600',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span>{children}</span>
      {isSelected && <Check className="h-4 w-4" />}
    </div>
  )
}

// Group for organizing items
interface SelectGroupProps {
  children: React.ReactNode
}

function SelectGroup({ children }: SelectGroupProps) {
  return <div className="py-1">{children}</div>
}

// Label for groups
interface SelectLabelProps {
  children: React.ReactNode
  className?: string
}

function SelectLabel({ children, className }: SelectLabelProps) {
  return (
    <div className={cn('px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase', className)}>
      {children}
    </div>
  )
}

// Separator
function SelectSeparator() {
  return <div className="my-1 h-px bg-gray-200" />
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}
