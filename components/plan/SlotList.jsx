'use client'

import { Sunrise, Sun, Apple, Moon, ChevronRight, Check } from 'lucide-react'
import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
function slotIcon(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('break')) return Sunrise
  if (t.includes('lunch')) return Sun
  if (t.includes('dinner')) return Moon
  return Apple
}

export default function SlotList({ meals = [], selectedIndex, onSelect, doneSet = new Set() }) {
  return (
    <Glass goldEdge>
      <CardBand title="Meal slots" meta={`${meals.length} meals`} />
      <div className="divide-y divide-[var(--line)]">
        {meals.map((meal, i) => {
          const Icon = slotIcon(meal.type)
          const active = i === selectedIndex
          const done = doneSet.has(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`w-full grid grid-cols-[48px_1fr_auto] gap-3 items-center p-4 text-left min-h-[72px] transition-colors ${
                active ? 'bg-green/10' : done ? 'bg-gold/5' : 'hover:bg-base-3/30'
              }`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--line)] bg-base-3/50 shrink-0"
                aria-hidden
              >
                <Icon size={20} strokeWidth={2} className="text-gold" />
              </div>
              <div className="min-w-0">
                <p className={`font-syne font-bold text-[13px] uppercase tracking-wide ${active ? 'text-green-soft' : 'text-gold'}`}>
                  {meal.type || 'Meal'}
                </p>
                <p className="font-syne font-bold text-[19px] text-ink truncate">{meal.name || 'Untitled'}</p>
                {meal.description && (
                  <p className="text-[13px] text-ink-mute line-clamp-1 mt-0.5">{meal.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {done && (
                  <span className="font-mono text-[9px] uppercase text-gold-soft px-2 py-0.5 rounded-full border border-gold/30">
                    Done
                  </span>
                )}
                {active && !done && (
                  <span className="font-mono text-[9px] uppercase text-green-soft px-2 py-0.5 rounded-full border border-green/40 bg-green/10">
                    NOW
                  </span>
                )}
                <ChevronRight size={18} className="text-ink-mute" />
              </div>
            </button>
          )
        })}
      </div>
    </Glass>
  )
}
