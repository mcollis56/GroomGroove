/**
 * Safe date utilities to prevent "Invalid time value" errors
 */

/**
 * Safely parse a date value, returning null if invalid
 */
export function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null

  try {
    const date = value instanceof Date ? value : new Date(value)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * Format a time string safely, with fallback
 */
export function formatTime(
  value: string | Date | null | undefined,
  fallback = 'Time N/A'
): string {
  const date = safeParseDate(value)
  if (!date) return fallback

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date string safely, with fallback
 */
export function formatDate(
  value: string | Date | null | undefined,
  fallback = 'Date N/A'
): string {
  const date = safeParseDate(value)
  if (!date) return fallback

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a full date with time safely
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  fallback = 'N/A'
): string {
  const date = safeParseDate(value)
  if (!date) return fallback

  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date for display (e.g., "Friday, January 17")
 */
export function formatDateForDisplay(
  value: string | Date | null | undefined,
  fallback = 'Date N/A'
): string {
  const date = safeParseDate(value)
  if (!date) return fallback

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Safely convert a date string (YYYY-MM-DD) to a Date object
 * Handles timezone issues by explicitly setting time to noon
 */
export function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null

  try {
    // Add time component to avoid timezone issues
    const date = new Date(dateStr + 'T12:00:00')
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * Check if a date value is valid
 */
export function isValidDate(value: string | Date | null | undefined): boolean {
  return safeParseDate(value) !== null
}

/**
 * Returns today's date in YYYY-MM-DD format based on LOCAL time, not UTC.
 * Fixes the "showing yesterday" bug in Australia/NZ.
 */
export function getLocalTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
