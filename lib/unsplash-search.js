/** @typedef {{ url: string, photographerName: string, photographerUrl: string }} MealImageResult */

export function getUnsplashAccessKey() {
  return (
    process.env.UNSPLASH_ACCESS_KEY?.trim() ||
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY?.trim() ||
    ''
  )
}

/**
 * Server-side Unsplash search (used by API route — key never sent to browser).
 * @param {string} mealName
 * @returns {Promise<MealImageResult | null>}
 */
export async function searchUnsplashMealPhoto(mealName) {
  const name = String(mealName || '').trim()
  if (!name) return null

  const accessKey = getUnsplashAccessKey()
  if (!accessKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[unsplash] Missing UNSPLASH_ACCESS_KEY (or NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)')
    }
    return null
  }

  try {
    const query = encodeURIComponent(`${name} food dish`)
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        next: { revalidate: 86400 },
      }
    )

    if (!res.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[unsplash] search failed ${res.status} for "${name}"`)
      }
      return null
    }

    const data = await res.json()
    const photo = data?.results?.[0]
    const url = photo?.urls?.small
    if (!url) return null

    return {
      url,
      photographerName: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[unsplash] search error:', err?.message || err)
    }
    return null
  }
}
