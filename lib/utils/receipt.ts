// Receipt number generator
// Format: GG-YYYYMMDD-XXX (e.g., GG-20250107-042)

export function generateReceiptNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  return `GG-${year}${month}${day}-${random}`
}
