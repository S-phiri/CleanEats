/** @typedef {{ url: string, photographerName: string, photographerUrl: string }} MealImageResult */

const cache = new Map()

function cacheKey(mealName) {
  return String(mealName || '')
    .trim()
    .toLowerCase()
}

/**
 * Search Unsplash for a meal photo. Results are cached by meal name.
 * @param {string} mealName
 * @returns {Promise<MealImageResult | null>}
 */
export async function fetchMealImage(mealName) {
  const name = String(mealName || '').trim()
  if (!name) return null

  const key = cacheKey(name)
  if (cache.has(key)) return cache.get(key)

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    cache.set(key, null)
    return null
  }

  try {
    const query = encodeURIComponent(`${name} food dish`)
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    )

    if (!res.ok) {
      cache.set(key, null)
      return null
    }

    const data = await res.json()
    const photo = data?.results?.[0]
    const url = photo?.urls?.small
    if (!url) {
      cache.set(key, null)
      return null
    }

    const result = {
      url,
      photographerName: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
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
