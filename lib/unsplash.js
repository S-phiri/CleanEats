/** @typedef {{ url: string, photographerName: string, photographerUrl: string }} MealImageResult */

const cache = new Map()

function cacheKey(mealName) {
  return String(mealName || '')
    .trim()
    .toLowerCase()
}

/**
 * Load meal photo via server proxy (avoids browser CORS and exposes no API key).
 * @param {string} mealName
 * @returns {Promise<MealImageResult | null>}
 */
export async function fetchMealImage(mealName) {
  const name = String(mealName || '').trim()
  if (!name) return null

  const key = cacheKey(name)
  if (cache.has(key)) return cache.get(key)

  try {
    const res = await fetch(`/api/unsplash/search?name=${encodeURIComponent(name)}`)

    if (!res.ok) {
      cache.set(key, null)
      return null
    }

    const data = await res.json()
    if (!data?.url) {
      cache.set(key, null)
      return null
    }

    const result = {
      url: data.url,
      photographerName: data.photographerName || 'Unknown',
      photographerUrl: data.photographerUrl || 'https://unsplash.com',
    }

    cache.set(key, result)
    return result
  } catch {
    cache.set(key, null)
    return null
  }
}

/**
 * Fetch images for multiple meal names in parallel.
 * @param {string[]} mealNames
 * @returns {Promise<Record<string, MealImageResult | null>>}
 */
export async function fetchMealImagesParallel(mealNames) {
  const unique = [...new Set(mealNames.map((n) => String(n || '').trim()).filter(Boolean))]
  const entries = await Promise.all(
    unique.map(async (name) => [name, await fetchMealImage(name)])
  )
  return Object.fromEntries(entries)
}
