/** Shared password rules for signup and reset-password flows. */

export const FIELD_ERROR_CLASS =
  'bg-[rgba(224,92,58,0.1)] border border-[rgba(224,92,58,0.3)] text-red rounded-xl px-3 py-2 text-sm mt-2'

export function validatePasswordPair(password, confirmPassword) {
  const errors = {}
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/\d/.test(password)) {
    errors.password = 'Password must contain at least one number'
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  return errors
}

export function siteUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (base) return base
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** Auth email / OAuth return URL (must match Supabase redirect allow list). */
export function authCallbackUrl(suffix = '') {
  const base = siteUrl()
  if (!base) return ''
  return `${base}/auth/callback${suffix}`
}
