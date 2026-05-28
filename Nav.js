'use client'

import { createClient } from './lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Nav({ user, tier, variant = 'app' }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'CE'

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(12,12,10,0.85)] backdrop-blur-[14px]">
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 px-6 sm:px-10 py-3 min-h-[60px]">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <Link href={user ? '/dashboard' : '/'} className="font-syne font-bold text-lg tracking-[0.04em] shrink-0">
            <span className="text-ink">CLEAN</span>
            <span className="text-green">EATS</span>
          </Link>
          <span className="hidden md:inline text-ink-mute text-[13px]">·</span>
          <span className="hidden md:inline text-ink-mute text-[13px] whitespace-nowrap">
            Eat well · Train hard · Feel good
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <>
              {tier && (
                <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border border-[var(--line)] text-ink-mute">
                  {tier}
                </span>
              )}
              <Link href="/dashboard" className="hidden sm:inline text-sm text-ink-mute hover:text-ink transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="hidden sm:inline text-sm text-ink-mute hover:text-ink transition-colors">
                Profile
              </Link>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full font-syne font-bold text-sm text-[#1A1408] shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--gold) 0%, #6E551A 100%)' }}
                aria-hidden
              >
                {initials}
              </div>
              <button type="button" onClick={signOut} className="btn btn-ghost text-xs sm:text-sm !min-h-[44px] !px-4">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost text-xs sm:text-sm !min-h-[44px]">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary text-xs sm:text-sm !min-h-[44px]">
                {variant === 'landing' ? 'Sign up' : 'Get Started'}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
