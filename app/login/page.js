'use client'
import { useState, Suspense, useEffect } from 'react'
import { createClient } from '../../lib/supabase-browser'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionVariants, buttonTap, buttonHover, premiumHoverTransition } from '../../lib/motion'

const DEBUG_AUTH = process.env.NODE_ENV !== 'production'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const supabase = createClient()
  const m = useMotionVariants()

  useEffect(() => {
    if (!DEBUG_AUTH) return
    console.log('[CleanEats login] mount', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      redirectTo,
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[CleanEats login] onAuthStateChange', event, {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
      })
    })
    return () => subscription.unsubscribe()
  }, [supabase, redirectTo])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const emailTrim = email.trim()
    if (DEBUG_AUTH) {
      console.log('[CleanEats login] submit handler fired', { emailChars: emailTrim.length, passwordChars: password.length })
    }
    let success = false
    try {
      if (DEBUG_AUTH) console.time('[CleanEats login] signInWithPassword')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrim,
        password,
      })
      if (DEBUG_AUTH) console.timeEnd('[CleanEats login] signInWithPassword')
      if (DEBUG_AUTH) {
        console.log('[CleanEats login] signIn response', {
          authError: error?.message ?? null,
          hasSession: !!data?.session,
          expiresAt: data?.session?.expires_at ?? null,
        })
      }
      if (error) {
        const hint =
          error.message?.toLowerCase().includes('email not confirmed')
            ? ' Open Supabase → Authentication → Users and confirm the user, or disable “Confirm email” for testing.'
            : ''
        setError((error.message || 'Sign in failed') + hint)
        return
      }
      if (!data.session) {
        setError('No session returned. If you just signed up, confirm your email in Supabase or your inbox.')
        return
      }
      if (DEBUG_AUTH) console.time('[CleanEats login] getSession')
      const { data: sessData, error: sessErr } = await supabase.auth.getSession()
      if (DEBUG_AUTH) {
        console.timeEnd('[CleanEats login] getSession')
        console.log('[CleanEats login] getSession result', {
          error: sessErr?.message ?? null,
          hasSession: !!sessData?.session,
        })
      }
      const target = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
      if (DEBUG_AUTH) console.log('[CleanEats login] redirect', { target })
      success = true
      window.location.assign(target)
    } catch (err) {
      if (DEBUG_AUTH) console.error('[CleanEats login] catch', err)
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      if (!success) setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` }
    })
    if (error) { setError(error.message); setLoading(false) }
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

        <div
          variants={m.authCard}
          className="w-full glass gold-edge p-8"
        >
          <h1 className="font-syne text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted text-sm mb-7">Sign in to your account</p>

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

          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            {...buttonTap}
            {...buttonHover}
            transition={premiumHoverTransition}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border2 bg-s2 text-[#F0EDE6] text-sm font-medium hover:border-green-dim transition-colors mb-5 disabled:opacity-40 disabled:pointer-events-none"
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted text-xs">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-soft text-sm mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="ce-input"
              />
            </div>
            <div>
              <label className="block text-soft text-sm mb-2">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="ce-input"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <p className="text-center text-muted text-sm mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-green hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
