'use client'

import { safeParseDate } from '@/lib/utils/date'

type Kind = 'date' | 'time' | 'dateTime'

interface LocalDateTimeProps {
  value: string | Date | null | undefined
  fallback?: string
  locale?: string
  options?: Intl.DateTimeFormatOptions
  kind?: Kind
  className?: string
}

export function LocalDateTime({
  value,
  fallback = 'N/A',
  locale = 'en-US',
  options,
  kind = 'dateTime',
  className,
}: LocalDateTimeProps) {
  const date = safeParseDate(value)
  if (!date) {
    return <span className={className}>{fallback}</span>
  }

  let formatted = ''
  if (kind === 'date') {
    formatted = date.toLocaleDateString(locale, options)
  } else if (kind === 'time') {
    formatted = date.toLocaleTimeString(locale, options)
  } else {
    formatted = date.toLocaleString(locale, options)
  }

  return <span className={className}>{formatted}</span>
}
