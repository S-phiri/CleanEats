'use client'

import {
  formatPlanDayLabel,
  formatPlanDayWeekdayShort,
  getPlanDayDate,
} from '../../lib/plan-dates'

export default function DayChips({ mealPlan, selectedIndex, onSelect, locationLabel = '' }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
      {mealPlan.map((day, i) => {
        const active = i === selectedIndex
        const date = getPlanDayDate(i)
        const calendarDay = date.getDate()
        const weekdayShort = formatPlanDayWeekdayShort(i)
        const fullLabel = formatPlanDayLabel(i, locationLabel)

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            title={fullLabel}
            className={`shrink-0 min-w-[92px] min-h-[88px] flex flex-col items-center justify-center rounded-[var(--r-md)] border px-3 py-3 transition-colors ${
              active
                ? 'bg-green/10 border-green/50'
                : 'bg-base-3/40 border-[var(--line)] hover:border-[var(--line-strong)]'
            }`}
          >
            <span className={`font-syne font-bold text-[22px] tabular-nums ${active ? 'text-green-soft' : 'text-ink'}`}>
              {calendarDay}
            </span>
            <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${active ? 'text-green-soft' : 'text-ink-mute'}`}>
              {weekdayShort}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-ink-faint mt-1 text-center line-clamp-2">
              {i === 0 && locationLabel ? String(locationLabel).toUpperCase() : `DAY ${day.day ?? i + 1}`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
