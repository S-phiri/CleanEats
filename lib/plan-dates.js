import { COUNTRIES } from './utils.js'

/**
 * User's local calendar date for plan day 1 (YYYY-MM-DD).
 * @param {Date} [referenceDate]
 */
export function getLocalStartDateIso(referenceDate = new Date()) {
  const y = referenceDate.getFullYear()
  const m = String(referenceDate.getMonth() + 1).padStart(2, '0')
  const d = String(referenceDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Calendar date for plan day index (0 = today, local timezone).
 * @param {number} dayIndex
 * @param {Date} [referenceDate]
 */
export function getPlanDayDate(dayIndex, referenceDate = new Date()) {
  const d = new Date(referenceDate)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + dayIndex)
  return d
}

/**
 * "FRIDAY · 29 MAY" or "FRIDAY · 29 MAY · KENYA" when location is set.
 * @param {number} dayIndex
 * @param {string} [locationLabel]
 * @param {Date} [referenceDate]
 */
export function formatPlanDayLabel(dayIndex, locationLabel = '', referenceDate = new Date()) {
  const d = getPlanDayDate(dayIndex, referenceDate)
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()
  const dayNum = d.getDate()
  const month = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const parts = [`${weekday} · ${dayNum} ${month}`]
  const loc = String(locationLabel || '').trim()
  if (loc) parts.push(loc.toUpperCase())
  return parts.join(' · ')
}

/** Short weekday for compact chips (e.g. FRI). */
export function formatPlanDayWeekdayShort(dayIndex, referenceDate = new Date()) {
  const d = getPlanDayDate(dayIndex, referenceDate)
  return d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
}

/** Today header eyebrow — same format as plan day 1. */
export function formatTodayEyebrow(locationLabel = '', referenceDate = new Date()) {
  return formatPlanDayLabel(0, locationLabel, referenceDate)
}

/**
 * City from profile, else country name from countryCode — never hardcoded.
 * @param {Record<string, unknown> | null | undefined} profileData
 */
export function buildLocationLabel(profileData) {
  if (!profileData || typeof profileData !== 'object') return ''
  const city = profileData.city != null ? String(profileData.city).trim() : ''
  if (city) return city
  const code =
    profileData.countryCode != null ? String(profileData.countryCode).trim().toUpperCase() : ''
  if (code && COUNTRIES[code]?.name) return COUNTRIES[code].name
  return ''
}

/**
 * Assign calendar dayName labels from day index (ignores stored weekday names).
 * @param {Array<{ day?: number, dayName?: string, meals?: unknown[] }>} mealPlan
 * @param {string} [locationLabel]
 * @param {Date} [referenceDate]
 */
export function applyPlanDayLabels(mealPlan, locationLabel = '', referenceDate = new Date()) {
  if (!Array.isArray(mealPlan)) return mealPlan
  return mealPlan.map((day, i) => ({
    ...day,
    day: i + 1,
    dayName: formatPlanDayLabel(i, locationLabel, referenceDate),
  }))
}

/** Prompt block for Claude — day 1 = user's local start date. */
export function planCalendarPromptBlock(startDateIso, locationLabel = '') {
  const loc = String(locationLabel || '').trim()
  const locLine = loc ? ` User location: ${loc}.` : ''
  return `PLAN CALENDAR (required): mealPlan day 1 starts on the user's local calendar date ${startDateIso}.${locLine} Do NOT use Monday, Tuesday, or other fixed weekday names. Set each dayName to "" (empty string) — the app assigns calendar labels from the day index.`
}
