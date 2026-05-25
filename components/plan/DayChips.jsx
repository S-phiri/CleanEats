'use client'

const BLOCK_TAGS = ['Build · Volume', 'Threshold', 'Recovery', 'Deload', 'Peak', 'Rest', 'Active']

export default function DayChips({ mealPlan, selectedIndex, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
      {mealPlan.map((day, i) => {
        const active = i === selectedIndex
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`shrink-0 min-w-[92px] min-h-[88px] flex flex-col items-center justify-center rounded-[var(--r-md)] border px-3 py-3 transition-colors ${
              active
                ? 'bg-green/10 border-green/50'
                : 'bg-base-3/40 border-[var(--line)] hover:border-[var(--line-strong)]'
            }`}
          >
            <span className={`font-syne font-bold text-[22px] tabular-nums ${active ? 'text-green-soft' : 'text-ink'}`}>
              {day.day ?? i + 1}
            </span>
            <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${active ? 'text-green-soft' : 'text-ink-mute'}`}>
              {(day.dayName || `Day ${i + 1}`).slice(0, 3)}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-ink-faint mt-1 text-center">
              {BLOCK_TAGS[i % BLOCK_TAGS.length]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
