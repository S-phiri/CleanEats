'use client'

import Glass from '../primitives/Glass'
import CardBand from '../primitives/CardBand'
import Ring from '../primitives/Ring'

function MetricRow({ label, value, unit, sub, pct, ringColor }) {
  const barPct = Math.min(100, Math.max(0, pct || 0))
  return (
    <div className="px-5 py-4 border-b border-[var(--line)] last:border-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute mb-1">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-syne font-bold text-[28px] tabular-nums text-ink leading-none">
            {value}
            <span className="font-mono text-sm font-normal text-ink-mute ml-1">{unit}</span>
          </p>
          {sub && <p className="text-sm text-ink-mute mt-2 leading-snug">{sub}</p>}
        </div>
        {pct != null && <Ring value={pct} size={56} stroke={5} color={ringColor} />}
      </div>
      {pct != null && (
        <div className="mt-3 h-1.5 rounded-full bg-[rgba(255,247,219,0.06)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${barPct}%`,
              background: 'linear-gradient(90deg, #C9A84C 0%, var(--green) 100%)',
            }}
          />
        </div>
      )}
    </div>
  )
}

function MetricsBody({ rows, footer }) {
  return (
    <>
      {rows.map((row) => (
        <MetricRow key={row.label} {...row} />
      ))}
      {footer}
    </>
  )
}

function buildRows(planData) {
  const tdee = planData.tdee
  const targetCalories = planData.targetCalories
  const protein = planData.targetProtein
  const carbs = planData.targetCarbs
  const fat = planData.targetFat
  const proteinPct = protein ? Math.min(100, Math.round((protein / 200) * 100)) : null
  const carbsPct = carbs ? Math.min(100, Math.round((carbs / 400) * 100)) : null
  const fatPct = fat ? Math.min(100, Math.round((fat / 120) * 100)) : null
  const caloriesPct =
    targetCalories && tdee ? Math.min(100, Math.round((targetCalories / tdee) * 100)) : null

  return [
    {
      label: 'Daily burn (TDEE)',
      value: tdee ?? '—',
      unit: 'kcal',
      sub: tdee
        ? `${tdee} kcal — what you typically burn in a day before your goal adjustment.`
        : undefined,
      pct: tdee ? 95 : null,
      ringColor: 'var(--green)',
    },
    {
      label: 'Daily calories',
      value: targetCalories ?? '—',
      unit: 'kcal',
      sub: targetCalories
        ? `${targetCalories} kcal — your daily target based on your goal.`
        : undefined,
      pct: caloriesPct,
      ringColor: 'var(--green)',
    },
    {
      label: 'Protein',
      value: protein ?? '—',
      unit: 'g',
      sub: protein
        ? `${protein} g protein — daily target to support muscle and recovery.`
        : undefined,
      pct: proteinPct,
      ringColor: '#C9A84C',
    },
    {
      label: 'Carbs',
      value: carbs ?? '—',
      unit: 'g',
      sub: carbs ? `${carbs} g carbs — energy for training and everyday activity.` : undefined,
      pct: carbsPct,
      ringColor: '#C9A84C',
    },
    {
      label: 'Fat',
      value: fat ?? '—',
      unit: 'g',
      sub: fat ? `${fat} g fat — daily target for fullness and hormones.` : undefined,
      pct: fatPct,
      ringColor: '#C9A84C',
    },
  ]
}

export default function PerformanceMetrics({ planData, meta, empty, locationLabel }) {
  if (empty || !planData) {
    return (
      <Glass goldEdge className="h-full w-full">
        <CardBand title="Your numbers" meta={meta || 'No active plan'} />
        <div className="p-6 text-sm text-ink-mute leading-relaxed">
          Build a plan from your profile to see calorie and macro targets here — each with a short
          explanation of what it means for you.
        </div>
      </Glass>
    )
  }

  const footer = locationLabel ? (
    <div className="px-5 py-3 border-t border-[var(--line)]">
      <p className="text-sm text-ink-mute">Plan ingredients tailored for {locationLabel}.</p>
    </div>
  ) : null

  return (
    <Glass goldEdge className="h-full w-full">
      <CardBand title="Your numbers" meta={meta} />
      <MetricsBody rows={buildRows(planData)} footer={footer} />
    </Glass>
  )
}
