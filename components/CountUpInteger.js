'use client'

import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { easeOut } from '../lib/motion'

/**
 * Counts from 0 to `value` on mount. Subtle, no bouncing.
 */
export default function CountUpInteger({ value, duration = 0.85 }) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setN(value)
      return
    }
    setN(0)
    const ctrl = animate(0, value, {
      duration,
      ease: easeOut,
      onUpdate: (latest) => setN(Math.round(latest)),
    })
    return () => ctrl.stop()
  }, [value, duration, reduce])

  return <span className="tabular-nums">{n}</span>
}
