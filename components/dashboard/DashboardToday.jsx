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
      <span className="font-mono text-[10px] uppercase tracking-wider text-green-soft px-3 py-1.5 rounded-full border border-green/40 bg-black/40 backdrop-blur-sm">
        Logged
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-green/90 text-[#0E1A03] shadow-md"
        aria-label="Done"
      >
        <Check size={16} strokeWidth={2} />
      </span>
    )
  }
  if (status === 'now') {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-green-soft px-3 py-1.5 rounded-full border border-green/35 bg-black/40 backdrop-blur-sm">
        NOW
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-white/85 px-3 py-1.5 rounded-full border border-white/20 bg-black/35 backdrop-blur-sm">
      Upcoming
    </span>
  )
}

export default function DashboardToday({ meals = [], loggedSlots = new Set() }) {
  const sorted = [...meals].sort((a, b) => mealSortIndex(a.type) - mealSortIndex(b.type))
  const imagesByName = useMealImages(sorted)

  return (
    <Glass goldEdge className="overflow-hidden">
      <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-3">
        {sorted.map((meal, i) => {
          const slotKey = mealSlotKey(meal.type)
          const status = mealStatus(i, sorted.length, slotKey, loggedSlots)
          const image = meal.name ? imagesByName[meal.name] : null

          return (
            <MealCardBackground
              key={`${meal.type}-${meal.name}-${i}`}
              image={image}
              overlay="today"
              showAttribution={false}
              className="w-full min-h-[180px] h-[190px] sm:h-[200px] rounded-xl"
            >
              <div className="relative flex h-full min-h-[180px] flex-col justify-between px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gold shrink-0">
                    {meal.type || 'Meal'}
                  </span>
                  <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.12em] text-white font-semibold tabular-nums text-right shrink-0">
                    {meal.calories != null ? `${meal.calories} kcal` : '— kcal'}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-4 mt-auto pt-6">
                  <h3 className="font-syne font-bold text-2xl sm:text-3xl text-white leading-[1.12] drop-shadow-md line-clamp-3 min-w-0 flex-1 pr-2">
                    {meal.name || 'Untitled'}
                  </h3>
                  <div className="flex flex-col items-end justify-end shrink-0 gap-2">
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
