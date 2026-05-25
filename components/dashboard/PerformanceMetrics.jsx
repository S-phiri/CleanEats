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
          {sub && <p className="font-mono text-[10px] text-ink-faint mt-1">{sub}</p>}
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

const SAMPLE_ROWS = [
  { label: 'TDEE', value: '2,850', unit: 'kcal', sub: 'Maintenance target', pct: 95, ringColor: 'var(--green)' },
  { label: 'Target calories', value: '2,400', unit: 'kcal', sub: 'Daily intake goal', pct: 84, ringColor: 'var(--green)' },
  { label: 'Protein', value: '175', unit: 'g', sub: '128 / 175g · 47g remaining', pct: 73, ringColor: '#C9A84C' },
  { label: 'Carbs', value: '348', unit: 'g', sub: 'Glycogen load', pct: 55, ringColor: '#C9A84C' },
  { label: 'Fat', value: '72', unit: 'g', sub: 'Daily target', pct: 60, ringColor: '#C9A84C' },
]

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

export default function PerformanceMetrics({ planData, meta, empty, sample }) {
  if (sample && !planData) {
    return (
      <Glass goldEdge className="h-full w-full">
        <CardBand title="Performance Metrics" meta="Sample targets" />
        <MetricsBody
          rows={SAMPLE_ROWS}
          footer={
            <div className="px-5 py-3 border-t border-[var(--line)]">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-green-soft px-3 py-1.5 rounded-full bg-green/15 border border-green/30">
                Plan synced · Lusaka basket · 412 ZMW today
              </span>
            </div>
          }
        />
      </Glass>
    )
  }

  if (empty || !planData) {
    return (
      <Glass goldEdge className="h-full w-full">
        <CardBand title="Performance Metrics" meta={meta || 'No active plan'} />
        <div className="p-6 text-sm text-ink-mute">
          Generate a plan to see TDEE, macros, and hydration targets here.
        </div>
      </Glass>
    )
  }

  const tdee = planData.tdee
  const targetCalories = planData.targetCalories
  const protein = planData.targetProtein
  const carbs = planData.targetCarbs
  const fat = planData.targetFat
  const proteinPct = protein ? Math.min(100, Math.round((protein / 200) * 100)) : null
  const carbsPct = carbs ? Math.min(100, Math.round((carbs / 400) * 100)) : null
  const fatPct = fat ? Math.min(100, Math.round((fat / 120) * 100)) : null
  const caloriesPct = targetCalories && tdee
    ? Math.min(100, Math.round((targetCalories / tdee) * 100))
    : null

  return (
    <Glass goldEdge className="h-full w-full">
      <CardBand title="Performance Metrics" meta={meta} />
      <MetricsBody
        rows={[
          {
            label: 'TDEE',
            value: tdee ?? '—',
            unit: 'kcal',
            sub: 'Maintenance target',
            pct: tdee ? 95 : null,
            ringColor: 'var(--green)',
          },
          {
            label: 'Target calories',
            value: targetCalories ?? '—',
            unit: 'kcal',
            sub: targetCalories ? 'Daily intake goal' : undefined,
            pct: caloriesPct,
            ringColor: 'var(--green)',
          },
          {
            label: 'Protein',
            value: protein ?? '—',
            unit: 'g',
            sub: protein ? `Target · ${protein}g daily` : undefined,
            pct: proteinPct,
            ringColor: '#C9A84C',
          },
          {
            label: 'Carbs',
            value: carbs ?? '—',
            unit: 'g',
            pct: carbsPct,
            ringColor: '#C9A84C',
          },
          {
            label: 'Fat',
            value: fat ?? '—',
            unit: 'g',
            pct: fatPct,
            ringColor: '#C9A84C',
          },
        ]}
        footer={
          <div className="px-5 py-3 border-t border-[var(--line)]">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-green-soft px-3 py-1.5 rounded-full bg-green/15 border border-green/30">
              Plan synced · Local basket
            </span>
          </div>
        }
      />
    </Glass>
  )
}
