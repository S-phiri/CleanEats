'use client'

import { useEffect, useState } from 'react'

export default function Ring({ value = 0, size = 72, stroke = 6, color = 'var(--green)' }) {
  const target = Math.min(100, Math.max(0, value))
  const [animated, setAnimated] = useState(target)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setAnimated(target)
      return
    }
    let frame
    const start = performance.now()
    const duration = 1200
    const from = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimated(from + (target - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    setAnimated(0)
    frame = requestAnimationFrame(tick)
    const safety = setTimeout(() => setAnimated(target), 2000)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(safety)
    }
  }, [target])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,247,219,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tabular-nums text-ink whitespace-nowrap"
      >
        {Math.round(animated)}%
      </span>
    </div>
  )
}
