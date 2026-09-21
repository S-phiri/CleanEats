/**
 * Normalize phone to E.164 digits only (no plus).
 * ZA: 0XXXXXXXXX → 27XXXXXXXXX; already 27… kept as-is.
 * ZM: 0XXXXXXXX → 260XXXXXXXX when 9 digits after leading 0.
 */
export function normalizePhoneDigits(raw) {
  let d = String(raw ?? '').replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('0')) {
    if (d.length === 10) return `27${d.slice(1)}`
    if (d.length === 9) return `260${d.slice(1)}`
  }
  return d
}
