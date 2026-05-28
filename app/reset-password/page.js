'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionVariants, buttonTap, buttonHover, premiumHoverTransition } from '../../lib/motion'
import { FIELD_ERROR_CLASS, validatePasswordPair } from '../../lib/auth-password'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const m = useMotionVariants()

  useEffect(() => {
    let cancelled = false

    async function establishRecoverySession() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled && exchangeError) {
          setError(exchangeError.message)
          setCheckingSession(false)
          return
        }
        if (!cancelled && code) {
          window.history.replaceState({}, '', window.location.pathname)
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled) {
        setSessionReady(!!session)
        setCheckingSession(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(!!session)
        setCheckingSession(false)
      }
    })

    establishRecoverySession()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errors = validatePasswordPair(password, confirmPassword)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    if (!sessionReady) {
      setError('Your reset link is invalid or has expired. Request a new link from the forgot password page.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="page-layer relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute -top-28 left-1/2 h-72 w-[min(520px,100vw)] -translate-x-1/2 rounded-full bg-green/[0.08] blur-[90px]"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={m.reduce ? { duration: 0 } : { duration: 1.15, ease: m.ease }}
        />
        <div
          className="absolute bottom-0 left-[-15%] h-56 w-56 rounded-full bg-green/[0.05] blur-[70px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={m.reduce ? { duration: 0 } : { duration: 1.4, ease: m.ease, delay: 0.12 }}
        />
      </div>

      <div
        className="relative flex flex-col items-center w-full max-w-md"
        variants={m.authPageContainer}
        initial="hidden"
        animate="visible"
      >
        <div variants={m.authFadeUp} className="mb-10">
          <Link href="/" className="font-syne text-2xl font-black inline-block">
            Clean<span className="text-green">Eats</span>
          </Link>
        </div>

        <div variants={m.authCard} className="w-full glass gold-edge p-8">
          <h1 className="font-syne text-2xl font-bold mb-1">Choose a new password</h1>
          <p className="text-muted text-sm mb-7">
            {checkingSession
              ? 'Verifying your reset link…'
              : sessionReady
                ? 'Enter a new password for your account.'
                : 'Open the link from your email to set a new password.'}
          </p>

          <AnimatePresence mode="sync">
            {error && (
              <div
                key={error}
                {...m.authAlert}
                className="bg-[rgba(224,92,58,0.1)] border border-[rgba(224,92,58,0.3)] text-red rounded-xl px-4 py-3 text-sm mb-5"
              >
                {error}
              </div>
            )}
          </AnimatePresence>

          {!checkingSession && !sessionReady && !error && (
            <div className="bg-[rgba(224,92,58,0.1)] border border-[rgba(224,92,58,0.3)] text-red rounded-xl px-4 py-3 text-sm mb-5">
              This page is only available from your password reset email.{' '}
              <Link href="/forgot-password" className="text-green hover:underline">
                Request a new link
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-soft text-sm mb-2">New password</label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setFieldErrors(fe => {
                    if (!fe.password && !fe.confirmPassword) return fe
                    const next = { ...fe }
                    delete next.password
                    if (e.target.value === confirmPassword) delete next.confirmPassword
                    return next
                  })
                }}
                required
                disabled={!sessionReady || checkingSession}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="ce-input disabled:opacity-50"
              />
              {fieldErrors.password && (
                <div className={FIELD_ERROR_CLASS} role="alert">
                  {fieldErrors.password}
                </div>
              )}
            </div>
            <div>
              <label className="block text-soft text-sm mb-2">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value)
                  setFieldErrors(fe => {
                    if (!fe.confirmPassword) return fe
                    const next = { ...fe }
                    delete next.confirmPassword
                    return next
                  })
                }}
                required
                disabled={!sessionReady || checkingSession}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="ce-input disabled:opacity-50"
              />
              {fieldErrors.confirmPassword && (
                <div className={FIELD_ERROR_CLASS} role="alert">
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={loading || checkingSession || !sessionReady}
              {...buttonTap}
              {...buttonHover}
              transition={premiumHoverTransition}
              className="w-full py-3 rounded-xl bg-green text-on-accent font-semibold text-sm hover:opacity-90 transition-[opacity,box-shadow] duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_22px_rgba(168,196,86,0.18)] hover:shadow-[0_0_34px_rgba(168,196,86,0.28)]"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </motion.button>
          </form>

          <p className="text-center text-muted text-sm mt-5">
            <Link href="/login" className="text-green hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
