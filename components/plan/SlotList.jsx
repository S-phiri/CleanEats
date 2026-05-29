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
              overlay="slot"
              showAttribution={false}
              className={`w-full text-left h-[120px] min-h-[120px] rounded-xl transition-all ${
                active
                  ? 'ring-2 ring-green/60 ring-offset-2 ring-offset-base'
                  : 'hover:ring-1 hover:ring-white/15'
              }`}
              buttonProps={{
                type: 'button',
                onClick: () => onSelect(i),
              }}
            >
              <div className="relative flex h-[120px] w-full items-center px-4 pr-3">
                <div className="flex flex-1 min-w-0 h-full flex-col py-3 pr-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold">
                    {meal.type || 'Meal'}
                  </span>
                  <p className="flex flex-1 items-center font-syne font-bold text-base text-white leading-snug line-clamp-2 drop-shadow-sm">
                    {meal.name || 'Untitled'}
                  </p>
                  {(done || (active && !done)) && (
                    <span
                      className={`self-start font-mono text-[8px] uppercase px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                        done
                          ? 'text-gold-soft border-gold/35 bg-black/40'
                          : 'text-green-soft border-green/35 bg-black/40'
                      }`}
                    >
                      {done ? 'Done' : 'Now'}
                    </span>
                  )}
                </div>
                <ChevronRight
                  size={20}
                  strokeWidth={2}
                  className={`shrink-0 drop-shadow-sm ${active ? 'text-green-soft' : 'text-white/70'}`}
                  aria-hidden
                />
              </div>
            </MealCardBackground>
          )
        })}
      </div>
    </Glass>
  )
}
