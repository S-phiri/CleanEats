'use client'

import { useMemo, useState } from 'react'

function smoothPath(points, width, height, padY = 12) {
  if (!points.length) return { d: '', coords: [] }
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min || 1
  const step = width / (points.length - 1 || 1)
  const coords = points.map((v, i) => {
    const x = i * step
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return [x, y]
  })
  let d = `M ${coords[0][0]} ${coords[0][1]}`
  for (let i = 1; i < coords.length; i++) {
    const [x0, y0] = coords[i - 1]
    const [x1, y1] = coords[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
  }
  return { d, coords }
}

export default function AreaChart({
  data = [],
  labels = [],
  width = 620,
  height = 210,
  summary = 'Cost trend over selected period.',
}) {
  const [hover, setHover] = useState(null)
  const { d, coords } = useMemo(() => smoothPath(data, width, height), [data, width, height])
  const fillD = d ? `${d} L ${width} ${height} L 0 ${height} Z` : ''

  return (
    <div className="relative w-full overflow-hidden">
      <p className="sr-only">{summary}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={summary}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={0}
            x2={width}
            y1={height * t}
            y2={height * t}
            stroke="rgba(201,168,76,0.10)"
            strokeDasharray="4 3"
          />
        ))}
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124,181,24,0.35)" />
            <stop offset="100%" stopColor="rgba(124,181,24,0)" />
          </linearGradient>
        </defs>
        {fillD && <path d={fillD} fill="url(#areaFill)" />}
        {d && <path d={d} fill="none" stroke="var(--green-soft)" strokeWidth={2} />}
        {coords?.map(([x, y], i) => (
          <rect
            key={i}
            x={x - (width / data.length) / 2}
            y={0}
            width={width / data.length}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover({ i, x, y, v: data[i] })}
          />
        ))}
        {hover != null && (
          <>
            <line x1={hover.x} x2={hover.x} y1={0} y2={height} stroke="var(--gold-soft)" strokeWidth={1} />
            <circle cx={hover.x} cy={hover.y} r={4} fill="var(--green-soft)" />
          </>
        )}
      </svg>
      <div className="flex justify-between mt-2 font-mono text-[10px] uppercase text-ink-faint tracking-wider">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      {hover != null && (
        <div
          className="absolute glass gold-edge px-3 py-2 text-xs font-mono tabular-nums pointer-events-none"
          style={{ left: Math.min(hover.x, width - 80), top: 8 }}
        >
          {hover.v?.toFixed?.(2) ?? hover.v}
        </div>
      )}
    </div>
  )
}
