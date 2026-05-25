'use client'

import { Zap, CalendarDays } from 'lucide-react'
import Button from '../primitives/Button'
import PerformanceMetrics from '../dashboard/PerformanceMetrics'

function DateEyebrow() {
  const d = new Date()
  const line = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute px-3 py-1.5 rounded-full border border-[var(--line)] bg-green/10">
      <span className="h-2 w-2 rounded-full bg-green" />
      {line} · Lusaka
    </span>
  )
}

export default function Hero({ ctaHref, ctaLabel, latestPlan }) {
  const planJson = latestPlan?.plan_json || latestPlan
  const hasPlan = !!planJson

  return (
    <section className="mb-24 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-[48px] items-center py-12 px-6 sm:px-10 lg:py-[80px] lg:px-16">
      <div className="min-w-0 max-w-full overflow-hidden">
        <DateEyebrow />
        <h1 className="font-syne font-extrabold uppercase mt-6 leading-[0.92] tracking-[-0.02em] text-[clamp(2rem,4.2vw,4.5rem)] break-words">
          <span className="block text-[#C9A84C]">Fuel the grind.</span>
          <span className="block text-[#F0EDE4] mt-1">Precision nutrition</span>
          <span className="block text-[#F0EDE4]">for African athletes.</span>
        </h1>
        <p className="text-ink-mute text-base leading-relaxed mt-6 max-w-[52ch]">
          Localized meal intelligence, calibrated to your market basket and recovery window — built for
          performance in Lusaka, Nairobi, Johannesburg and beyond.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Button href={ctaHref}>
            <Zap size={18} strokeWidth={2} />
            {ctaLabel || 'Start your plan'}
          </Button>
          <Button href={ctaHref === '/dashboard' ? '/dashboard' : '/signup'} variant="ghost">
            <CalendarDays size={18} strokeWidth={2} />
            Week view
          </Button>
        </div>
        <p className="mt-8 pt-6 border-t border-[var(--line-strong)] font-mono text-[11px] uppercase tracking-[0.12em] text-gold-soft">
          2,400+ athletes · 14 federations · 3 markets
        </p>
      </div>

      <div className="w-full lg:w-[420px] lg:max-w-[420px] shrink-0 min-w-0 justify-self-stretch lg:justify-self-end">
        <PerformanceMetrics
          planData={hasPlan ? planJson : null}
          meta={hasPlan ? 'Preview' : 'Day · sample'}
          sample={!hasPlan}
        />
      </div>
    </section>
  )
}
