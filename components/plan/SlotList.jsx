'use client'

import { ChevronRight } from 'lucide-react'
import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
import MealCardBackground from '../dashboard/MealCardBackground'
import { useMealImages } from '../../hooks/useMealImages'

export default function SlotList({ meals = [], selectedIndex, onSelect, doneSet = new Set() }) {
  const imagesByName = useMealImages(meals)

  return (
    <Glass goldEdge>
      <CardBand title="Meal slots" meta={`${meals.length} meals`} />
      <div className="flex flex-col gap-2 p-2">
        {meals.map((meal, i) => {
          const active = i === selectedIndex
          const done = doneSet.has(i)
          const image = meal.name ? imagesByName[meal.name] : null

          return (
            <MealCardBackground
              key={i}
              as="button"
              image={image}
              overlay="card"
              showAttribution={false}
              className={`w-full text-left h-[90px] min-h-[90px] rounded-xl transition-all ${
                active
                  ? 'ring-2 ring-green/70 ring-offset-2 ring-offset-base'
                  : 'hover:ring-1 hover:ring-white/20'
              }`}
              buttonProps={{
                type: 'button',
                onClick: () => onSelect(i),
              }}
            >
              <div className="relative flex h-[90px] w-full flex-col p-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold shrink-0 drop-shadow-sm">
                    {meal.type || 'Meal'}
                  </span>
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className={`shrink-0 drop-shadow-sm ${active ? 'text-green-soft' : 'text-white/50'}`}
                    aria-hidden
                  />
                </div>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <p className="font-syne font-bold text-[15px] text-white leading-tight truncate drop-shadow-md min-w-0">
                    {meal.name || 'Untitled'}
                  </p>
                  {(done || (active && !done)) && (
                    <span
                      className={`font-mono text-[8px] uppercase shrink-0 px-1.5 py-0.5 rounded-full border backdrop-blur-sm ${
                        done
                          ? 'text-gold-soft border-gold/40 bg-black/45'
                          : 'text-green-soft border-green/40 bg-black/45'
                      }`}
                    >
                      {done ? 'Done' : 'Now'}
                    </span>
                  )}
                </div>
              </div>
            </MealCardBackground>
          )
        })}
      </div>
    </Glass>
  )
}
