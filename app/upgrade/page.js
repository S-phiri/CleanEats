import Link from 'next/link'
import Nav from '../../Nav'
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Glass from '../../components/primitives/Glass'
import CardBand from '../../components/primitives/CardBand'
import Button from '../../components/primitives/Button'
import { Check } from 'lucide-react'
import { creditsRemainingForProfile, creditsUsedForProfile, FREE_CREDIT_CAP } from '../../lib/credits'

export default async function UpgradePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, credits_used, last_reset_date')
    .eq('id', user.id)
    .single()

  const tier = profile?.tier || 'free'
  const creditsUsed = creditsUsedForProfile(profile)
  const creditsRemaining = creditsRemainingForProfile(profile)

  const perks = [
    'Unlimited AI credits per month',
    'Full 5-day plans with local shopping prices',
    'Prep guide + saved plans',
  ]

  return (
    <div className="page-layer min-h-screen">
      <Nav user={user} tier={tier} />
      <main className="max-w-[720px] mx-auto px-6 sm:px-10 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute mb-3">Billing</p>
        <h1 className="font-syne text-3xl font-bold mb-2 text-ink">Upgrade to Pro</h1>
        <p className="text-ink-mute text-sm mb-10 leading-relaxed">
          You&apos;re on the <span className="text-gold-soft font-semibold">{tier}</span> tier
          {tier === 'free' && (
            <>
              {' '}
              — {creditsUsed} of {FREE_CREDIT_CAP} credits used
              {creditsRemaining !== null ? ` (${creditsRemaining} remaining)` : ''}.
            </>
          )}
          . Stripe checkout is
          not wired yet; this page is a placeholder so dashboard links don&apos;t 404.
        </p>

        <Glass goldEdge className="mb-8">
          <CardBand title="What Pro will include" meta="Coming soon" />
          <ul className="p-6 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-ink-mute">
                <Check size={18} strokeWidth={2} className="text-green shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </Glass>

        <div className="flex flex-wrap gap-3">
          <Button href="/dashboard" variant="ghost">
            Back to dashboard
          </Button>
          <Button href="/profile">Build a plan</Button>
        </div>
      </main>
    </div>
  )
}
