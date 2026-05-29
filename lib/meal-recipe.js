const MAX_INGREDIENT_LINES = 12

const MARKET_GROUPS = [
  { id: 'vegetables', label: 'Vegetables', keywords: ['leaf', 'rape', 'cabbage', 'spinach', 'kale', 'broccoli', 'carrot', 'tomato', 'onion', 'pepper', 'lettuce', 'cucumber', 'zucchini', 'squash', 'pumpkin', 'greens', 'vegetable', 'avocado', 'corn', 'bean sprout', 'muriwo', 'sukuma'] },
  { id: 'protein', label: 'Protein', keywords: ['chicken', 'beef', 'fish', 'tilapia', 'egg', 'turkey', 'pork', 'lamb', 'goat', 'kapenta', 'tuna', 'salmon', 'shrimp', 'prawn', 'tofu', 'mince', 'steak', 'breast', 'thigh', 'sausage', 'bacon', 'patty', 'burger'] },
  { id: 'grains', label: 'Grains & staples', keywords: ['rice', 'nshima', 'sadza', 'pap', 'ugali', 'pasta', 'oat', 'bread', 'tortilla', 'wrap', 'noodle', 'maize', 'mealie', 'millet', 'flour', 'quinoa', 'couscous', 'potato', 'sweet potato', 'yam', 'bean', 'lentil', 'chickpea'] },
]

function normalizeIngredientKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function classifyIngredient(name) {
  const n = normalizeIngredientKey(name)
  for (const group of MARKET_GROUPS) {
    if (group.keywords.some((kw) => n.includes(kw))) return group.id
  }
  return 'other'
}

/**
 * Dedupe portions by ingredient name; sum grams; cap list length.
 */
export function aggregateIngredients(portions = []) {
  const map = new Map()

  for (const p of portions) {
    const key = normalizeIngredientKey(p.ingredient)
    if (!key) continue
    const existing = map.get(key)
    const grams = Number(p.grams) || 0
    if (existing) {
      existing.grams += grams
      if (p.measure && !existing.measure) existing.measure = p.measure
    } else {
      map.set(key, {
        ingredient: String(p.ingredient).trim(),
        grams,
        measure: p.measure || null,
      })
    }
  }

  const list = [...map.values()].sort((a, b) => b.grams - a.grams)
  return list.slice(0, MAX_INGREDIENT_LINES)
}

/**
 * Per-meal cooking steps: use meal.cookSteps if present, else derive from description + portions.
 */
export function cookStepsForMeal(meal) {
  if (!meal) return []

  if (Array.isArray(meal.cookSteps) && meal.cookSteps.length > 0) {
    return meal.cookSteps.map((s) => String(s).trim()).filter(Boolean)
  }

  const name = meal.name || 'this meal'
  const desc = (meal.description || '').trim()
  const portions = meal.portions || []
  const steps = []

  if (desc) {
    steps.push(desc.endsWith('.') ? desc : `${desc}.`)
  }

  const proteins = portions.filter((p) => classifyIngredient(p.ingredient) === 'protein')
  const grains = portions.filter((p) => classifyIngredient(p.ingredient) === 'grains')
  const veg = portions.filter((p) => classifyIngredient(p.ingredient) === 'vegetables')

  if (proteins.length) {
    const items = proteins.map((p) => `${p.grams}g ${p.ingredient}`).join(', ')
    steps.push(`Prep protein: ${items}. Season lightly; cook through until safe internal temperature.`)
  }

  if (grains.length) {
    const items = grains.map((p) => `${p.grams}g ${p.ingredient}`).join(', ')
    steps.push(`Cook staples: ${items}. Follow package or traditional method until tender.`)
  }

  if (veg.length) {
    const items = veg.map((p) => `${p.grams}g ${p.ingredient}`).join(', ')
    steps.push(`Prepare vegetables: wash and chop ${items}; steam, sauté, or serve fresh as suited to the dish.`)
  }

  const other = portions.filter(
    (p) => !['protein', 'grains', 'vegetables'].includes(classifyIngredient(p.ingredient))
  )
  if (other.length) {
    steps.push(
      `Add remaining ingredients (${other.map((p) => p.ingredient).join(', ')}) and combine.`
    )
  }

  steps.push(`Plate ${name} and serve while hot. Adjust seasoning to taste.`)

  return steps.slice(0, 8)
}

/**
 * Consolidated buy list for all meals in a day, grouped for market shopping.
 */
export function buildDayMarketList(meals = []) {
  const aggregated = aggregateIngredients(
    meals.flatMap((m) => m?.portions || [])
  )

  const groups = {
    vegetables: [],
    protein: [],
    grains: [],
    other: [],
  }

  for (const item of aggregated) {
    const bucket = classifyIngredient(item.ingredient)
    const key = bucket === 'vegetables' || bucket === 'protein' || bucket === 'grains' ? bucket : 'other'
    groups[key].push(item)
  }

  return [
    { label: 'Vegetables', items: groups.vegetables },
    { label: 'Protein', items: groups.protein },
    { label: 'Grains & staples', items: groups.grains },
    { label: 'Other', items: groups.other },
  ].filter((g) => g.items.length > 0)
}
