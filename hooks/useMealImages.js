'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchMealImagesParallel } from '../lib/unsplash'

/**
 * Loads Unsplash images for a list of meals in parallel (non-blocking).
 * @param {Array<{ name?: string }>} meals
 * @returns {Record<string, { url: string, photographerName: string, photographerUrl: string } | undefined>}
 */
export function useMealImages(meals) {
  const [imagesByName, setImagesByName] = useState({})

  const namesKey = useMemo(() => {
    const names = [...new Set((meals || []).map((m) => m?.name).filter(Boolean))]
    return names.sort().join('\0')
  }, [meals])

  useEffect(() => {
    const names = namesKey ? namesKey.split('\0') : []
    if (!names.length) {
      setImagesByName({})
      return
    }

    let cancelled = false

    fetchMealImagesParallel(names).then((map) => {
      if (cancelled) return
      const next = {}
      for (const [name, data] of Object.entries(map)) {
        if (data) next[name] = data
      }
      setImagesByName(next)
    })

    return () => {
      cancelled = true
    }
  }, [namesKey])

  return imagesByName
}
