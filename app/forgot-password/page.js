'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionVariants, buttonTap, buttonHover, premiumHoverTransition } from '../../lib/motion'
import { siteUrl } from '../../lib/auth-password'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const m = useMotionVariants()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const base = siteUrl()
    if (!base) {
      setError('Site URL is not configured. Set NEXT_PUBLIC_SITE_URL in your environment.')
      setLoading(false)
      return
    }

    const redirectTo = `${base}/reset-password`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="page-layer relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/[0.1] blur-[80px]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={m.reduce ? { duration: 0 } : { duration: 0.85, ease: m.ease }}
          />
        </div>
        <div
          className="relative max-w-md"
          initial={{ opacity: 0, y: m.reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={m.reduce ? { duration: 0 } : { duration: 0.45, ease: m.ease }}
        >
          <div className="flex justify-center mb-4">
            <Mail size={40} className="text-green" strokeWidth={2} />
          </div>
          <h2 className="font-syne text-2xl font-bold mb-3">Check your email for a reset link</h2>
          <p className="text-muted max-w-sm mx-auto text-sm">
            If an account exists for <strong className="text-[#F0EDE6]">{email}</strong>, you will receive
            instructions shortly.
          </p>
          <Link href="/login" className="mt-6 inline-block text-green text-sm hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    )
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
          className="absolute bottom-0 right-[-20%] h-64 w-64 rounded-full bg-green/[0.04] blur-[72px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={m.reduce ? { duration: 0 } : { duration: 1.4, ease: m.ease, delay: 0.15 }}
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
          <h1 className="font-syne text-2xl font-bold mb-1">Reset your password</h1>
          <p className="text-muted text-sm mb-7">
            Enter your email and we&apos;ll send you a link to choose a new password.
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-soft text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="ce-input"
                autoComplete="email"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              {...buttonTap}
              {...buttonHover}
              transition={premiumHoverTransition}
              className="w-full py-3 rounded-xl bg-green text-on-accent font-semibold text-sm hover:opacity-90 transition-[opacity,box-shadow] duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_22px_rgba(168,196,86,0.18)] hover:shadow-[0_0_34px_rgba(168,196,86,0.28)]"
            >
              {loading ? 'Sending link...' : 'Send reset link'}
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
