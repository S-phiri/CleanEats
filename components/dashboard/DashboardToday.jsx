'use client'

import { Check } from 'lucide-react'
import Glass from '../primitives/Glass'
import MealCardBackground from './MealCardBackground'
import { useMealImages } from '../../hooks/useMealImages'

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

function mealSortIndex(type) {
  const t = (type || '').toLowerCase()
  const i = MEAL_ORDER.findIndex((slot) => t.includes(slot))
  return i === -1 ? 99 : i
}

function mealSlotKey(type) {
  const t = (type || '').toLowerCase()
  return MEAL_ORDER.find((slot) => t.includes(slot)) || null
}

function activeMealIndex(total) {
  const h = new Date().getHours()
  if (h < 10) return 0
  if (h < 14) return Math.min(1, total - 1)
  if (h < 17) return Math.min(2, total - 1)
  return Math.min(3, total - 1)
}

function mealStatus(index, total, slotKey, loggedSlots) {
  if (slotKey && loggedSlots?.has(slotKey)) return 'logged'
  const active = activeMealIndex(total)
  if (index < active) return 'done'
  if (index === active) return 'now'
  return 'upcoming'
}

function StatusPill({ status }) {
  if (status === 'logged') {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-green-soft px-2.5 py-1 rounded-full border border-green/50 bg-black/50 backdrop-blur-sm">
        Logged
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-[#0E1A03] shadow-md"
        aria-label="Done"
      >
        <Check size={16} strokeWidth={2} />
      </span>
    )
  }
  if (status === 'now') {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-green-soft px-2.5 py-1 rounded-full border border-green/50 bg-black/50 backdrop-blur-sm">
        NOW
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-white/80 px-2.5 py-1 rounded-full border border-white/25 bg-black/45 backdrop-blur-sm">
      Upcoming
    </span>
  )
}

export default function DashboardToday({ meals = [], loggedSlots = new Set() }) {
  const sorted = [...meals].sort((a, b) => mealSortIndex(a.type) - mealSortIndex(b.type))
  const imagesByName = useMealImages(sorted)

  return (
    <Glass goldEdge className="overflow-hidden">
      <div className="flex flex-col gap-2 p-2">
        {sorted.map((meal, i) => {
          const slotKey = mealSlotKey(meal.type)
          const status = mealStatus(i, sorted.length, slotKey, loggedSlots)
          const image = meal.name ? imagesByName[meal.name] : null

          return (
            <MealCardBackground
              key={`${meal.type}-${meal.name}-${i}`}
              image={image}
              overlay="card"
              showAttribution={false}
              className="w-full h-[170px] min-h-[160px] max-h-[180px] rounded-xl"
            >
              <div className="relative flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold shrink-0 drop-shadow-sm">
                    {meal.type || 'Meal'}
                  </span>
                  <div className="text-right shrink-0">
                    <p className="font-syne font-bold text-2xl tabular-nums text-white leading-none drop-shadow-md">
                      {meal.calories != null ? meal.calories : '—'}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-white/80 mt-0.5">
                      kcal
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <p className="font-syne font-bold text-2xl sm:text-[1.65rem] text-white leading-[1.1] drop-shadow-lg line-clamp-2 min-w-0 flex-1">
                    {meal.name || 'Untitled'}
                  </p>
                  <div className="shrink-0 pb-0.5">
                    <StatusPill status={status} />
                  </div>
                </div>
              </div>
            </MealCardBackground>
          )
        })}
      </div>
    </Glass>
  )
}
