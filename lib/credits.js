/** Free-tier monthly credit allowance (enforced in /api/generate). */

export const FREE_CREDIT_CAP = 10

export function startOfCurrentMonthUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export function parseResetDate(value) {
  if (!value) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** credits_used after applying monthly reset rules (matches /api/credits). */
export function creditsUsedForProfile(profile) {
  const monthStart = startOfCurrentMonthUtc()
  const lastReset = parseResetDate(profile?.last_reset_date)
  if (!lastReset || lastReset < monthStart) return 0
  return profile?.credits_used ?? 0
}

export function creditsRemainingForProfile(profile) {
  const tier = profile?.tier || 'free'
  if (tier === 'pro' || tier === 'coach') return null
  return Math.max(0, FREE_CREDIT_CAP - creditsUsedForProfile(profile))
}

export function creditsExhaustedForProfile(profile) {
  const tier = profile?.tier || 'free'
  if (tier === 'pro' || tier === 'coach') return false
  return creditsUsedForProfile(profile) >= FREE_CREDIT_CAP
}
