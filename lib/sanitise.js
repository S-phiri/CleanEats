const FORBIDDEN_CHARS = /[<>{}\$`]/g
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MEAL_TYPES = new Set(['breakfast', 'lunch', 'dinner', 'snack'])

export function normalizeMealType(raw) {
  if (raw == null) return null
  const t = String(raw).trim().toLowerCase()
  if (MEAL_TYPES.has(t)) return t
  if (t.includes('break')) return 'breakfast'
  if (t.includes('lunch')) return 'lunch'
  if (t.includes('dinner')) return 'dinner'
  if (t.includes('snack')) return 'snack'
  return null
}

/**
 * @param {unknown} str
 * @param {number} [maxLength=500]
 * @returns {string}
 */
export function sanitiseText(str, maxLength = 500) {
  if (str == null) return ''

  let out = String(str).trim()
  out = out.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  out = out.replace(/<[^>]*>/g, '')
  out = out.replace(FORBIDDEN_CHARS, '')
  if (maxLength > 0 && out.length > maxLength) {
    out = out.slice(0, maxLength)
  }
  return out
}

/**
 * @param {unknown} val
 * @param {number} min
 * @param {number} max
 * @returns {number | null}
 */
export function sanitiseNumber(val, min, max) {
  if (val == null || val === '') return null
  const n = parseFloat(val)
  if (Number.isNaN(n)) return null
  return Math.min(max, Math.max(min, n))
}

/**
 * @param {unknown} str
 * @returns {string | null}
 */
export function sanitiseEmail(str) {
  if (str == null) return null
  const email = String(str).trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) return null
  return email
}

/**
 * @param {{
 *   meal_name?: unknown
 *   notes?: unknown
 *   calories?: unknown
 *   protein_g?: unknown
 *   carbs_g?: unknown
 *   fat_g?: unknown
 *   meal_type?: unknown
 * }} input
 */
export function sanitiseMealInput({
  meal_name,
  notes,
  calories,
  protein_g,
  carbs_g,
  fat_g,
  meal_type,
}) {
  const safeType = normalizeMealType(meal_type)

  return {
    meal_name: sanitiseText(meal_name, 100) || 'Meal',
    notes: sanitiseText(notes, 500),
    calories: sanitiseNumber(calories, 0, 9999),
    protein_g: sanitiseNumber(protein_g, 0, 999),
    carbs_g: sanitiseNumber(carbs_g, 0, 999),
    fat_g: sanitiseNumber(fat_g, 0, 999),
    meal_type: safeType,
  }
}
