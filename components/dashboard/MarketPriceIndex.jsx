'use client'

import { useMemo } from 'react'
import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
import AreaChart from '../primitives/AreaChart'

function parsePrices(shoppingList) {
  if (!shoppingList || typeof shoppingList !== 'object') return []
  const prices = []
  Object.values(shoppingList).forEach((rows) => {
    if (!Array.isArray(rows)) return
    rows.forEach((row) => {
      const p = String(row.price || '')
      const m = p.match(/[\d.]+/)
      if (m) prices.push(parseFloat(m[0]))
    })
  })
  return prices
}

export default function MarketPriceIndex({ shoppingList, currency = 'ZMW', location = '' }) {
  const prices = useMemo(() => parsePrices(shoppingList), [shoppingList])
  const total =
    prices.length > 0 ? prices.reduce((a, b) => a + b, 0) : null
  const chartData = prices.length >= 2 ? prices.slice(0, 7) : null
  const labels = chartData
    ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].slice(0, chartData.length)
    : []
  const locationLine = location ? ` · ${location}` : ''

  return (
    <Glass goldEdge>
      <CardBand title="Shopping estimate" meta={`${currency}${locationLine}`} />
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Estimated list total · current plan
            </p>
            <p className="font-syne font-bold text-[32px] tabular-nums text-ink mt-1">
              {total != null ? total.toFixed(2) : '—'}
              <span className="font-mono text-sm font-normal text-ink-mute ml-2">{currency}</span>
            </p>
            <p className="text-sm text-ink-mute mt-2 leading-relaxed">
              {shoppingList
                ? 'Sum of priced items on your shopping list — a rough guide for nearby shops, not a live quote.'
                : 'Generate a plan to see estimated shopping costs from your list.'}
            </p>
          </div>
        </div>

        {chartData ? (
          <AreaChart
            data={chartData}
            labels={labels}
            summary={`Item prices from your plan (${currency}).`}
          />
        ) : (
          <p className="text-sm text-ink-faint py-6 border-t border-[var(--line)]">
            Add more priced items to your shopping list to see a simple breakdown here.
          </p>
        )}
      </div>
    </Glass>
  )
}
