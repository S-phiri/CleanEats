import Link from 'next/link'
import { Check } from 'lucide-react'
import Glass from '../primitives/Glass'
import Button from '../primitives/Button'

const CHECKS = [
  'Meal plans priced in your local currency',
  'Calorie and macro targets from your stats',
  'Ingredients you can find nearby',
  'Simple prep notes for each day',
]

export default function SignUpSection({ user }) {
  const ctaHref = user ? '/dashboard' : '/signup'
  const ctaLabel = user ? 'Go to dashboard' : 'Create free account'

  return (
    <section id="signup" className="mb-20 scroll-mt-24">
      <Glass goldEdge className="p-8 md:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold mb-3">Get started</p>
        <h2 className="font-syne font-bold text-3xl md:text-4xl text-ink leading-tight max-w-xl">
          Your plan in a few minutes.
        </h2>
        <p className="text-ink-mute mt-4 max-w-lg leading-relaxed">
          Set your profile once. We build a week of meals around your goal, budget, and what’s easy to
          buy near you.
        </p>
        <ul className="mt-8 grid sm:grid-cols-2 gap-3">
          {CHECKS.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-ink-mute">
              <Check size={18} strokeWidth={2} className="text-green shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <Button href={ctaHref} className="justify-center">
            {ctaLabel}
          </Button>
          {!user && (
            <p className="text-sm text-ink-mute">
              Already have an account?{' '}
              <Link href="/login" className="text-gold-soft underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </Glass>
    </section>
  )
}
