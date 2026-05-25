import { MEAL_PREP_OPTIONS } from './profile-options'

const byValue = Object.fromEntries(MEAL_PREP_OPTIONS.map(o => [o.value, o.label]))

/**
 * Instructs the model to align meals and prepGuide with advance-prep preference.
 */
export function buildMealPrepPromptBlock(form) {
  const v = form.mealPrepPreference || '3day'
  const label = byValue[v] || byValue['3day']
  return `
MEAL PREP PREFERENCE: "${label}".
- Design the 5-day meal plan so it is realistic to prep within this window: favour batch components, make-ahead breakfasts (e.g. overnight oats), and repeated proteins/grains where it fits the user's cook time and goal.
- Where you suggest make-ahead food, keep fridge storage within safe typical limits (most cooked meals 3–4 days max; label clearly). State reheating or "eat cold" where relevant.
- Do not contradict allergies or NEVER USE ingredients.
`
}

/**
 * Second-call instructions for a richer prep guide.
 */
export function buildPrepGuideInstructions(form) {
  const v = form.mealPrepPreference || '3day'
  const label = byValue[v] || byValue['3day']
  return `The user wants: ${label}. Produce prepGuide with 4–6 cards. Each card: a clear title, emoji icon, and 3–5 numbered-style steps. Cover: batch cooking order, container/storage, fridge vs freezer, max days kept, reheat safety, and one "night before" tip where useful (e.g. soak oats). Tie steps to the actual meals listed above.`
}
