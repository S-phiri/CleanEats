/**
 * Shared prompt fragments for meal-plan generation — culinary style, staples, variety.
 * Used by app/profile and components/PlanViewClient (regenerate).
 */

/** Country codes where maize-porridge portion hint is relevant */
const AFRICAN_STAPLE_CODES = new Set(['ZM', 'ZW', 'ZA', 'KE', 'NG'])

export function buildStyleInstruction(culinaryStyle, cd) {
  const styleMap = {
    traditional: `Use traditional local dishes from ${cd.name}. Reference local meal names.`,
    mixed: `Balance traditional local meals from ${cd.name} with international dishes. Mix local staples with modern supermarket ingredients.`,
    modern: `Use modern international ingredients available at major supermarkets: ${cd.modern}`,
  }
  return styleMap[culinaryStyle] || styleMap.mixed
}

/**
 * Replaces unconditional "Local staples" — strength depends on culinary style.
 */
export function buildStaplesRetailBlock(culinaryStyle, cd) {
  if (culinaryStyle === 'traditional') {
    return `Local staples (prioritise these): ${cd.staples}\nTypical retail: ${cd.modern}`
  }
  if (culinaryStyle === 'mixed') {
    return `Typical ingredients in ${cd.name} (blend with international meals; not every dish must be traditional): ${cd.staples}\nRetail: ${cd.modern}`
  }
  return `Ingredient sourcing: prefer what is typically available at major supermarkets in ${cd.name}: ${cd.modern}. Use local seasonal produce where practical; do not default every meal to traditional national dishes unless the user asked for that in notes or cuisine tags.`
}

/**
 * Explicit variety + cuisine-inspiration weighting.
 */
export function buildVarietyCuisineBlock(cuisines) {
  const list = Array.isArray(cuisines) && cuisines.length ? cuisines.join(', ') : null
  if (list) {
    return `VARIETY: Weight meal ideas toward these cuisine inspirations when compatible with diet and allergies: ${list}. Across the 5 Claude-generated days, reflect at least two different inspirations where possible; avoid three consecutive dinners in the same narrow national style unless notes say otherwise.`
  }
  return `VARIETY: Across the 5 Claude-generated days, vary proteins, cuisines, and cooking methods; avoid repeating the same regional style for more than two dinners in a row unless notes say otherwise.`
}

/**
 * Maize porridge line only for traditional/mixed + African staple countries (not modern / non-African).
 */
export function buildMaizePortionHint(culinaryStyle, countryCode) {
  if (culinaryStyle === 'modern' || !AFRICAN_STAPLE_CODES.has(countryCode || '')) return ''
  return 'For maize porridge sides (nshima, sadza, pap, ugali): state dry mealie meal weight (e.g. 80g dry ≈ 1 cup cooked).'
}

/** Second API call (shopping): soften locality emphasis for modern/mixed. */
export function buildShoppingPromptExtra(culinaryStyle, cd) {
  if (culinaryStyle === 'modern') {
    return `Focus on items found at typical supermarkets (${cd.modern}); include international ingredients where the meals use them.`
  }
  if (culinaryStyle === 'mixed') {
    return `Mix local market staples and supermarket items; prices should reflect shopping in ${cd.name}.`
  }
  return `Prioritise ingredients commonly used in ${cd.name}; use realistic ${cd.currency} prices.`
}
