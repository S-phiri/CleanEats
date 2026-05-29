'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
import IconBtn from '../primitives/IconBtn'
import {
  formatPlanDayWeekdayShort,
  getPlanDayDate,
} from '../../lib/plan-dates'

export default function WeekPlan({ mealPlan = [], empty, locationLabel = '' }) {
  const days = mealPlan.length
    ? mealPlan.map((d, i) => {
        const date = getPlanDayDate(i)
        return {
          num: date.getDate(),
          label: formatPlanDayWeekdayShort(i),
          meals: (d.meals || []).length,
          isToday: i === 0,
          active: i === 0,
        }
      })
    : [0, 1, 2, 3, 4, 5, 6].map((offset) => {
        const date = getPlanDayDate(offset)
        return {
          num: date.getDate(),
          label: formatPlanDayWeekdayShort(offset),
          meals: 0,
          isToday: offset === 0,
          active: offset === 0,
        }
      })

  const totalMeals = mealPlan.reduce((s, d) => s + (d.meals?.length || 0), 0)

  return (
    <Glass goldEdge>
      <CardBand
        title="This Week's Plan"
        meta={empty ? 'No plan' : locationLabel || 'Active cycle'}
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">Overview</p>
            <p className="font-syne font-bold text-[22px] text-ink mt-1">
              {empty ? 'No meals planned' : `${totalMeals} meals planned`}
            </p>
          </div>
          <div className="flex gap-1">
            <IconBtn label="Previous week"><ChevronLeft size={18} /></IconBtn>
            <IconBtn label="Next week"><ChevronRight size={18} /></IconBtn>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-5">
          {days.map((d, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col items-center justify-center min-h-[88px] rounded-[var(--r-md)] border px-1 py-3 ${
                d.active
                  ? 'bg-green/10 border-green/50'
                  : 'bg-base-3/50 border-[var(--line)]'
              }`}
            >
              {d.isToday && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_var(--green)]" />
              )}
              <span className={`font-syne font-bold text-[22px] tabular-nums ${d.active ? 'text-green-soft' : 'text-ink'}`}>
                {d.num}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink-mute mt-1">{d.label}</span>
              {d.meals > 0 && (
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: Math.min(4, d.meals) }).map((_, i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-gold" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {empty ? (
          <p className="text-sm text-ink-mute mb-4">
            <Link href="/profile" className="text-green-soft underline">Build a plan</Link> to see your week at a glance.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { l: 'Weekly avg kcal', v: '—', d: 'From plan' },
              { l: 'Plan cost', v: 'See shopping', d: 'tab' },
              { l: 'Adherence', v: '—', d: 'Track meals' },
            ].map((k) => (
              <div key={k.l} className="rounded-[var(--r-sm)] border border-[var(--line)] bg-base-3/40 px-3 py-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">{k.l}</p>
                <p className="font-syne font-semibold text-sm text-ink mt-1">{k.v}</p>
                <p className="font-mono text-[10px] text-ink-mute">{k.d}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Glass>
  )
}
