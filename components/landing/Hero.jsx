'use client'

import { Zap, CalendarDays } from 'lucide-react'
import Button from '../primitives/Button'

function DateEyebrow() {
  const line = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute px-3 py-1.5 rounded-full border border-[var(--line)] bg-green/10">
      <span className="h-2 w-2 rounded-full bg-green" />
      {line}
    </span>
  )
}

export default function Hero({ ctaHref, ctaLabel }) {
  return (
    <section className="mb-16 w-full max-w-[900px] mx-auto py-12 px-6 sm:px-10 lg:py-[72px] lg:px-16">
      <DateEyebrow />
      <h1 className="font-syne font-extrabold uppercase mt-6 leading-[0.92] tracking-[-0.02em] text-[clamp(2rem,4.2vw,4.5rem)] break-words">
        <span className="block text-[#C9A84C]">Eat well.</span>
        <span className="block text-[#F0EDE4] mt-1">Train hard.</span>
        <span className="block text-[#F0EDE4]">Feel good.</span>
      </h1>
      <p className="text-ink-mute text-base leading-relaxed mt-6 max-w-[52ch]">
        Personal meal plans with clear calories and macros — built around what you can buy locally and
        what fits your budget.
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Button href={ctaHref}>
          <Zap size={18} strokeWidth={2} />
          {ctaLabel || 'Start your plan'}
        </Button>
        <Button href={ctaHref === '/dashboard' ? '/dashboard' : '/signup'} variant="ghost">
          <CalendarDays size={18} strokeWidth={2} />
          {ctaHref === '/dashboard' ? 'Today’s meals' : 'See how it works'}
        </Button>
      </div>
    </section>
  )
}
