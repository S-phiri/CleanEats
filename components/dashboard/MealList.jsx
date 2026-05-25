'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sunrise, Sun, Apple, Moon, ChevronRight, Check, X } from 'lucide-react'
import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
import StripePlaceholder from '../primitives/StripePlaceholder'

const SLOT_ICONS = {
  breakfast: Sunrise,
  lunch: Sun,
  snack: Apple,
  dinner: Moon,
}

function slotIcon(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('break')) return SLOT_ICONS.breakfast
  if (t.includes('lunch')) return SLOT_ICONS.lunch
  if (t.includes('dinner')) return SLOT_ICONS.dinner
  return SLOT_ICONS.snack
}

export default function MealList({ meals = [], plans = [], planId }) {
  const [drawer, setDrawer] = useState(null)

  const rows = meals.length
    ? meals.map((m, i) => ({ ...m, id: i, status: i === 1 ? 'active' : i === 0 ? 'done' : 'queued' }))
    : (plans || []).slice(0, 4).map((p, i) => ({
        id: p.id,
        type: 'Plan',
        name: p.plan_title || 'Untitled plan',
        description: p.plan_subtitle,
        href: `/plan/${p.id}`,
        status: i === 0 ? 'active' : 'queued',
      }))

  return (
    <>
      <Glass goldEdge>
        <CardBand title={meals.length ? "Today's Meals" : 'Your Library'} meta={meals.length ? 'Latest plan' : `${plans.length} plans`} />
        <div className="divide-y divide-[var(--line)]">
          {rows.length === 0 && (
            <p className="p-6 text-sm text-ink-mute">No plans yet. Build your first plan from Profile.</p>
          )}
          {rows.map((row) => {
            const Icon = slotIcon(row.type)
            const inner = (
              <button
                type="button"
                onClick={() => setDrawer(row)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-base-3/30 transition-colors min-h-[72px]"
              >
                <StripePlaceholder icon={Icon} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold mb-0.5">
                    {(row.type || 'PLAN').toUpperCase()}
                  </p>
                  <p className="font-syne font-bold text-[17px] text-ink truncate">{row.name}</p>
                  {row.description && (
                    <p className="text-[13px] text-ink-mute truncate mt-0.5">{row.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {row.status === 'done' && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-[#0E1A03]">
                      <Check size={16} strokeWidth={2} />
                    </span>
                  )}
                  {row.status === 'active' && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-green-soft px-2 py-1 rounded-full border border-green/40 bg-green/10">
                      NOW
                    </span>
                  )}
                  <ChevronRight size={18} className="text-ink-mute" />
                </div>
              </button>
            )
            return row.href ? (
              <Link key={row.id} href={row.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={row.id}>{inner}</div>
            )
          })}
        </div>
      </Glass>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close drawer"
            onClick={() => setDrawer(null)}
          />
          <div className="relative w-full max-w-[440px] h-full glass gold-edge flex flex-col animate-in">
            <div className="card-band shrink-0">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
                  {(drawer.type || 'MEAL').toUpperCase()}
                </p>
                <h3 className="!text-[22px]">{drawer.name}</h3>
              </div>
              <button type="button" onClick={() => setDrawer(null)} className="icon-btn" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <p className="text-sm text-ink-mute leading-relaxed">{drawer.description || 'Open your plan for full recipe details.'}</p>
              {drawer.href && (
                <Link href={drawer.href} className="btn btn-primary mt-6 inline-flex">
                  Open plan
                </Link>
              )}
              {planId && !drawer.href && (
                <Link href={`/plan/${planId}`} className="btn btn-primary mt-6 inline-flex">
                  View full plan
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
