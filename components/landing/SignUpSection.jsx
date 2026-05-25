import Link from 'next/link'
import { Check } from 'lucide-react'
import Glass from '../primitives/Glass'
import Button from '../primitives/Button'

const CHECKS = [
  'Localized basket pricing in your currency',
  'TDEE-first macro targets',
  'Culturally grounded meal staples',
  'Coach-voice prep and recovery notes',
]

export default function SignUpSection() {
  return (
    <section id="signup" className="mb-24 scroll-mt-24">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold mb-3">Get started</p>
          <h2 className="font-syne font-bold text-3xl md:text-4xl text-ink leading-tight">
            Train in your city.
            <br />
            Fuel from your market.
          </h2>
          <p className="text-ink-mute mt-4 max-w-md leading-relaxed">
            Create your account, set your profile, and generate a precision plan built around local
            ingredients and your performance goals.
          </p>
          <ul className="mt-8 space-y-3">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-3 text-sm text-ink-mute">
                <Check size={18} strokeWidth={2} className="text-green shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <Glass goldEdge className="p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute mb-6">
            Account setup
          </p>
          <div className="space-y-4 opacity-90 pointer-events-none" aria-hidden>
            {['Full name', 'Email', 'City', 'Sport'].map((label) => (
              <label key={label} className="block">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">{label}</span>
                <div className="ce-input mt-1.5 bg-base-3/80" />
              </label>
            ))}
          </div>
          <Button href="/signup" className="w-full mt-8 justify-center">
            Continue to sign up
          </Button>
          <p className="text-center text-xs text-ink-faint mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-soft underline">
              Log in
            </Link>
          </p>
        </Glass>
      </div>
    </section>
  )
}
