'use client'

import { useMemo, useState } from 'react'
import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
import AreaChart from '../primitives/AreaChart'
import Button from '../primitives/Button'

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

export default function MarketPriceIndex({ shoppingList, currency = 'ZMW', location = 'Local basket' }) {
  const [range, setRange] = useState('W')
  const prices = useMemo(() => parsePrices(shoppingList), [shoppingList])
  const daily = prices.length ? prices.reduce((a, b) => a + b, 0) / Math.max(1, prices.length) : null
  const chartData = prices.length >= 2 ? prices.slice(0, 7) : [120, 135, 128, 142, 138, 155, daily || 162]
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].slice(0, chartData.length)

  return (
    <Glass goldEdge>
      <CardBand title="Market Price Index" meta={`${currency} · ${location}`} />
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
              Localized cost · current plan
            </p>
            <p className="font-syne font-bold text-[32px] tabular-nums text-ink mt-1">
              {daily != null ? daily.toFixed(2) : '—'}
              <span className="font-mono text-sm font-normal text-ink-mute ml-2">{currency} / DAY</span>
            </p>
            {!shoppingList && (
              <p className="text-sm text-ink-mute mt-2">Generate a plan to see basket cost tracking.</p>
            )}
          </div>
          <div className="flex p-1 rounded-full border border-[var(--line)] bg-base-3">
            {['W', 'M', 'Q'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`min-h-[44px] min-w-[44px] px-4 rounded-full font-mono text-[11px] uppercase transition-colors ${
                  range === r ? 'bg-ink text-base' : 'text-ink-mute'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <AreaChart
          data={chartData}
          labels={labels}
          summary={`Daily basket cost trend in ${currency}.`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-[var(--line)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green" />
            Daily basket cost · Source: {currency} retail
          </p>
          <Button variant="ghost" className="!text-xs !min-h-[44px]">
            Export CSV
          </Button>
        </div>
      </div>
    </Glass>
  )
}
