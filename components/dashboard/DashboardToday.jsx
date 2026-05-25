'use client'

import { Check } from 'lucide-react'
import Glass from '../primitives/Glass'

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

function mealSortIndex(type) {
  const t = (type || '').toLowerCase()
  const i = MEAL_ORDER.findIndex((slot) => t.includes(slot))
  return i === -1 ? 99 : i
}

function activeMealIndex(total) {
  const h = new Date().getHours()
  if (h < 10) return 0
  if (h < 14) return Math.min(1, total - 1)
  if (h < 17) return Math.min(2, total - 1)
  return Math.min(3, total - 1)
}

function mealStatus(index, total) {
  const active = activeMealIndex(total)
  if (index < active) return 'done'
  if (index === active) return 'now'
  return 'upcoming'
}

function StatusPill({ status }) {
  if (status === 'done') {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-[#0E1A03]" aria-label="Done">
        <Check size={16} strokeWidth={2} />
      </span>
    )
  }
  if (status === 'now') {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-green-soft px-2.5 py-1 rounded-full border border-green/40 bg-green/10">
        NOW
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint px-2.5 py-1 rounded-full border border-[var(--line)]">
      Upcoming
    </span>
  )
}

export default function DashboardToday({ meals = [] }) {
  const sorted = [...meals].sort((a, b) => mealSortIndex(a.type) - mealSortIndex(b.type))

  return (
    <Glass goldEdge className="overflow-hidden">
      <div className="divide-y divide-[var(--line)]">
        {sorted.map((meal, i) => {
          const status = mealStatus(i, sorted.length)
          return (
            <div
              key={`${meal.type}-${meal.name}-${i}`}
              className="flex items-start gap-4 px-5 py-5 min-h-[72px]"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold mb-1">
                  {meal.type || 'Meal'}
                </p>
                <p className="font-syne font-bold text-lg text-ink leading-tight">{meal.name || 'Untitled'}</p>
                {meal.description && (
                  <p className="text-sm text-ink-mute mt-1 line-clamp-1">{meal.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-syne font-bold text-lg tabular-nums text-gold-soft">
                  {meal.calories != null ? meal.calories : '—'}
                </p>
                <p className="font-mono text-[10px] uppercase text-ink-faint">kcal</p>
                <div className="mt-2 flex justify-end">
                  <StatusPill status={status} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}
