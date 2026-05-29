import crypto from 'crypto'

export const PLAN_DAYS = 5

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SLOT_SPLITS = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
}

/** Profile "meals per day" → ordered slot types for each day. */
export const MEAL_SLOT_MAP = {
  '1 meal (OMAD)': ['dinner'],
  '2 meals': ['lunch', 'dinner'],
  '3 meals': ['breakfast', 'lunch', 'dinner'],
  '3 + 1 snack': ['breakfast', 'lunch', 'dinner', 'snack'],
  '3 + 2 snacks': ['breakfast', 'lunch', 'dinner', 'snack', 'snack'],
  '5\u20136 small meals': ['breakfast', 'snack', 'lunch', 'snack', 'dinner'],
}

const CALORIE_TOLERANCE = 0.15
const PROTEIN_TOLERANCE = 0.2
const MISS_RATIO_FULL_PLAN = 0.5

const TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export function normalizeMealType(type) {
  const t = String(type || '').trim().toLowerCase()
  if (t.startsWith('break')) return 'breakfast'
  if (t.startsWith('lunch')) return 'lunch'
  if (t.startsWith('dinner')) return 'dinner'
  if (t.includes('snack')) return 'snack'
  return t || 'lunch'
}

export function mealTypeLabel(mealType) {
  return TYPE_LABELS[mealType] || mealType.charAt(0).toUpperCase() + mealType.slice(1)
}

export function parseMealSlots(mealsPerDay) {
  return MEAL_SLOT_MAP[mealsPerDay] || MEAL_SLOT_MAP['3 meals']
}

export function computeDailyTargets(tdee, goal, weightKg = 70) {
  if (!tdee) return null
  let targetCalories = tdee
  if (goal === 'losefat') targetCalories = tdee - 400
  else if (goal === 'leanbulk') targetCalories = tdee + 250
  else if (goal === 'musclegain') targetCalories = tdee + 400

  const w = parseFloat(weightKg) || 70
  const proteinPerKg = goal === 'musclegain' ? 2.2 : goal === 'losefat' ? 2 : 1.8
  const targetProtein = Math.round(w * proteinPerKg)
  const proteinCals = targetProtein * 4
  const fatCals = Math.round(targetCalories * 0.28)
  const targetFat = Math.round(fatCals / 9)
  const carbCals = Math.max(0, targetCalories - proteinCals - fatCals)
  const targetCarbs = Math.round(carbCals / 4)

  return {
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
  }
}

function splitWeights(slots) {
  const snackCount = slots.filter((s) => s === 'snack').length
  const mainSlots = slots.filter((s) => s !== 'snack')
  const snackTotal = snackCount * SLOT_SPLITS.snack
  const mainTotal = 1 - snackTotal
  const mainWeight = mainSlots.length
    ? mainTotal / mainSlots.reduce((sum, s) => sum + (SLOT_SPLITS[s] || 0.33), 0)
    : 0

  return slots.map((slot) => {
    if (slot === 'snack') return SLOT_SPLITS.snack
    return (SLOT_SPLITS[slot] || 0.33) * mainWeight
  })
}

export function computeSlotTargets(dailyTargets, slots) {
  const weights = splitWeights(slots)
  return slots.map((mealType, index) => {
    const w = weights[index]
    return {
      mealType,
      calories: Math.round(dailyTargets.targetCalories * w),
      protein: Math.round(dailyTargets.targetProtein * w),
      carbs: Math.round(dailyTargets.targetCarbs * w),
      fat: Math.round(dailyTargets.targetFat * w),
    }
  })
}

export function buildProfileContext(profileData, tdee) {
  const goal = profileData.goal || 'maintain'
  const weightKg = profileData.weightKg || 70
  const daily = computeDailyTargets(tdee, goal, weightKg)
  const slots = parseMealSlots(profileData.meals)
  const slotTargets = daily ? computeSlotTargets(daily, slots) : []

  const diets = Array.isArray(profileData.diet) ? profileData.diet : []
  const userDiets =
    diets.length === 0 || (diets.length === 1 && diets[0] === 'No Restrictions')
      ? ['No Restrictions']
      : diets.filter((d) => d !== 'No Restrictions')

  return {
    countryCode: profileData.countryCode || 'other',
    culinaryStyle: profileData.culinaryStyle || 'mixed',
    goal,
    userDiets,
    allergies: profileData.allergies || [],
    excludeIngredients: profileData.excludeIngredients || '',
    cuisines: profileData.cuisines || [],
    budget: profileData.budget || 'mid',
    archetypeKey: profileData.archetype?.key || null,
    slots,
    slotTargets,
    daily,
    planDays: PLAN_DAYS,
  }
}

export function normalizeMealForCache(meal) {
  const portions = (meal.portions || []).map((p) => ({
    ingredient: p.ingredient,
    grams: p.grams,
    measure: p.measure,
  }))
  return {
    type: mealTypeLabel(normalizeMealType(meal.type)),
    name: meal.name,
    description: meal.description || '',
    calories: Math.round(Number(meal.calories) || 0),
    protein: Math.round(Number(meal.protein) || 0),
    carbs: Math.round(Number(meal.carbs) || 0),
    fat: Math.round(Number(meal.fat) || 0),
    portions,
  }
}

export function extractIngredientNames(meal) {
  const names = new Set()
  for (const p of meal.portions || []) {
    const ing = String(p.ingredient || '').toLowerCase().trim()
    if (ing) names.add(ing)
    ing.split(/[\s,/]+/).forEach((part) => {
      if (part.length > 2) names.add(part)
    })
  }
  const title = String(meal.name || '').toLowerCase()
  if (title) names.add(title)
  return [...names]
}

export function computeContentHash(meal, context) {
  const normalized = normalizeMealForCache(meal)
  const payload = {
    type: normalizeMealType(normalized.type),
    name: normalized.name,
    portions: normalized.portions,
    country: context.countryCode,
    goal: context.goal,
    style: context.culinaryStyle,
  }
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function macroInRange(value, target, tolerancePct) {
  if (!target || target <= 0) return true
  const lo = target * (1 - tolerancePct)
  const hi = target * (1 + tolerancePct)
  return value >= lo && value <= hi
}

export function mealMatchesDiet(dietTags, userDiets) {
  const tags = dietTags || []
  const required = (userDiets || []).filter((d) => d !== 'No Restrictions')
  if (required.length === 0) {
    return tags.includes('No Restrictions') || tags.length === 0
  }
  return required.every((d) => tags.includes(d))
}

function parseDenyTerms(allergies, excludeCsv) {
  const terms = new Set()
  for (const a of allergies || []) {
    const t = String(a).toLowerCase().trim()
    if (t && t !== 'none') terms.add(t)
  }
  for (const part of String(excludeCsv || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)) {
    terms.add(part)
  }
  return [...terms]
}

export function mealPassesExclusions(ingredientNames, allergies, excludeIngredients) {
  const terms = parseDenyTerms(allergies, excludeIngredients)
  if (!terms.length) return true
  const haystack = (ingredientNames || []).join(' ')
  return !terms.some((term) => haystack.includes(term))
}

function rowToMeal(row) {
  const meal = normalizeMealForCache(row.meal_json)
  return { ...meal, _libraryId: row.id }
}

function scoreRow(row, context) {
  let score = row.use_count || 0
  const tags = row.cuisine_tags || []
  const userCuisines = context.cuisines || []
  if (userCuisines.length && tags.some((t) => userCuisines.includes(t))) {
    score += 5
  }
  if (context.budget && row.budget_tier === context.budget) score += 2
  return score
}

export async function findMealForSlot(supabase, { context, slotTarget, excludeIds = [] }) {
  const calTarget = slotTarget.calories
  const protTarget = slotTarget.protein
  const calMin = Math.floor(calTarget * (1 - CALORIE_TOLERANCE))
  const calMax = Math.ceil(calTarget * (1 + CALORIE_TOLERANCE))
  const protMin = Math.floor(protTarget * (1 - PROTEIN_TOLERANCE))
  const protMax = Math.ceil(protTarget * (1 + PROTEIN_TOLERANCE))

  const { data: rows, error } = await supabase
    .from('meals_library')
    .select('*')
    .eq('country_code', context.countryCode)
    .eq('culinary_style', context.culinaryStyle)
    .eq('goal', context.goal)
    .eq('meal_type', slotTarget.mealType)
    .gte('calories', calMin)
    .lte('calories', calMax)
    .gte('protein_g', protMin)
    .lte('protein_g', protMax)
    .order('use_count', { ascending: false })
    .limit(40)

  if (error) {
    console.error('meals_library query error:', error)
    return null
  }

  const candidates = (rows || []).filter((row) => {
    if (excludeIds.includes(row.id)) return false
    if (!mealMatchesDiet(row.diet_tags, context.userDiets)) return false
    if (!mealPassesExclusions(row.ingredient_names, context.allergies, context.excludeIngredients)) {
      return false
    }
    if (
      !macroInRange(row.carbs_g, slotTarget.carbs, CALORIE_TOLERANCE) &&
      slotTarget.carbs > 0
    ) {
      // soft — only reject if wildly off
    }
    return true
  })

  if (!candidates.length) return null

  candidates.sort((a, b) => scoreRow(b, context) - scoreRow(a, context))
  const topN = candidates.slice(0, 5)
  const pick = topN[Math.floor(Math.random() * topN.length)]
  return rowToMeal(pick)
}

export async function recordMealUse(supabase, libraryId) {
  if (!libraryId) return
  await supabase.rpc('increment_meal_library_use', { p_meal_id: libraryId })
}

export async function assembleMealPlan(supabase, profileData, tdee) {
  const context = buildProfileContext(profileData, tdee)
  const misses = []
  const usedIds = []
  let hits = 0

  const mealPlan = []

  for (let dayIndex = 0; dayIndex < PLAN_DAYS; dayIndex++) {
    const dayMeals = []
    let dayCalories = 0

    for (let slotIndex = 0; slotIndex < context.slots.length; slotIndex++) {
      const slotTarget = { ...context.slotTargets[slotIndex] }
      const found = await findMealForSlot(supabase, {
        context,
        slotTarget,
        excludeIds: usedIds,
      })

      if (found) {
        const { _libraryId, ...meal } = found
        dayMeals.push(meal)
        dayCalories += meal.calories
        hits += 1
        if (_libraryId) {
          usedIds.push(_libraryId)
          await recordMealUse(supabase, _libraryId)
        }
      } else {
        misses.push({
          dayIndex,
          dayName: DAY_NAMES[dayIndex],
          slotIndex,
          mealType: slotTarget.mealType,
          slotTarget,
        })
        dayMeals.push(null)
      }
    }

    mealPlan.push({
      day: dayIndex + 1,
      dayName: DAY_NAMES[dayIndex],
      totalCalories: dayCalories,
      meals: dayMeals,
    })
  }

  const totalSlots = PLAN_DAYS * context.slots.length
  const missCount = misses.length

  return {
    context,
    mealPlan,
    misses,
    stats: {
      totalSlots,
      hits,
      misses: missCount,
      hitRate: totalSlots ? hits / totalSlots : 0,
    },
    fullyCached: missCount === 0,
    useFullPlan: missCount / totalSlots > MISS_RATIO_FULL_PLAN,
  }
}

export function mergeGapMeals(assembled, gapMeals, misses) {
  const mealPlan = assembled.mealPlan.map((day) => ({
    ...day,
    meals: [...day.meals],
  }))

  gapMeals.forEach((meal, i) => {
    const miss = misses[i]
    if (!miss) return
    const normalized = normalizeMealForCache(meal)
    const day = mealPlan[miss.dayIndex]
    day.meals[miss.slotIndex] = normalized
    day.totalCalories = day.meals.reduce((sum, m) => sum + (m?.calories || 0), 0)
  })

  return mealPlan.map((day) => ({
    ...day,
    meals: day.meals.filter(Boolean),
  }))
}

export function buildCacheOnlyPlanMeta(profileData, context, cd) {
  const daily = context.daily
  const countryName = cd?.name || profileData.countryCode || 'your region'
  const goalLabel = profileData.goal || 'your goal'
  return {
    planTitle: `Your ${countryName} Plan`,
    planSubtitle: `5-day plan matched to ${goalLabel} — assembled from our meal library`,
    tdee: daily?.tdee,
    targetCalories: daily?.targetCalories,
    targetProtein: daily?.targetProtein,
    targetCarbs: daily?.targetCarbs,
    targetFat: daily?.targetFat,
    days: PLAN_DAYS,
    mealFrequencyRecommendation: '',
    planSummary: 'Personalised week from verified meals matching your macros and diet.',
    wellnessSupport: {
      intro: 'Stay consistent with your plan this week.',
      foodIdeas: [],
      supplements: [],
      hydratingDrinks: [],
    },
  }
}

export function buildGapFillPrompt(misses, profileData, context, cd, promptBlocks = {}) {
  const slots = misses
    .map(
      (m, i) =>
        `${i + 1}. ${m.dayName} ${mealTypeLabel(m.mealType)}: ~${m.slotTarget.calories} kcal, ` +
        `~${m.slotTarget.protein}g protein, ~${m.slotTarget.carbs}g carbs, ~${m.slotTarget.fat}g fat`
    )
    .join('\n')

  return `CACHE GAP FILL — Return ONLY raw valid JSON. No markdown.

Generate exactly ${misses.length} meals for these slots:
${slots}

PROFILE:
- Country: ${cd.name} | Goal: ${profileData.goal}
- Diet: ${(profileData.diet || []).join(', ') || 'None'}
- Allergies: ${(profileData.allergies || []).join(', ') || 'None'}
- NEVER USE: ${profileData.excludeIngredients || 'none'}
- Culinary style: ${context.culinaryStyle}
${promptBlocks.style || ''}
${promptBlocks.staples || ''}
${promptBlocks.variety || ''}

Each meal: maximum 4 portions. Each portion: ingredient, grams, measure only. No visual field.
NEVER say "a serving" or vague amounts.

Return ONLY valid JSON:
{"meals":[{"type":"Breakfast","name":"string","description":"max 8 words","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"name","grams":150,"measure":"1 cup"}]}]}`
}

export function mealsFromPlanJson(plan) {
  const out = []
  for (const day of plan.mealPlan || []) {
    for (const meal of day.meals || []) {
      if (meal?.name) out.push(meal)
    }
  }
  return out
}

export async function upsertMealsFromPlan(adminSupabase, meals, context, source = 'claude') {
  const results = { inserted: 0, updated: 0, errors: [] }

  for (const raw of meals) {
    const meal = normalizeMealForCache(raw)
    const mealType = normalizeMealType(meal.type)
    const contentHash = computeContentHash(meal, context)
    const ingredientNames = extractIngredientNames(meal)
    const dietTags =
      context.userDiets?.length && !context.userDiets.includes('No Restrictions')
        ? [...context.userDiets]
        : ['No Restrictions']

    const row = {
      meal_json: meal,
      meal_type: mealType,
      country_code: context.countryCode,
      culinary_style: context.culinaryStyle,
      goal: context.goal,
      diet_tags: dietTags,
      budget_tier: context.budget || null,
      calories: meal.calories,
      protein_g: meal.protein,
      carbs_g: meal.carbs,
      fat_g: meal.fat,
      cuisine_tags: context.cuisines || [],
      archetype_key: context.archetypeKey,
      ingredient_names: ingredientNames,
      content_hash: contentHash,
      source,
    }

    const { data: existing } = await adminSupabase
      .from('meals_library')
      .select('id, use_count')
      .eq('content_hash', contentHash)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await adminSupabase
        .from('meals_library')
        .update({ use_count: (existing.use_count || 0) + 1, last_used_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) results.errors.push(error.message)
      else results.updated += 1
    } else {
      const { error } = await adminSupabase.from('meals_library').insert(row)
      if (error) results.errors.push(error.message)
      else results.inserted += 1
    }
  }

  return results
}

export function libraryRowFromMeal(meal, meta) {
  const normalized = normalizeMealForCache(meal)
  const context = {
    countryCode: meta.countryCode,
    culinaryStyle: meta.culinaryStyle,
    goal: meta.goal,
    userDiets: meta.dietTags || ['No Restrictions'],
    cuisines: meta.cuisineTags || [],
    budget: meta.budgetTier,
    archetypeKey: meta.archetypeKey,
  }
  return {
    meal_json: normalized,
    meal_type: normalizeMealType(normalized.type),
    country_code: meta.countryCode,
    culinary_style: meta.culinaryStyle,
    goal: meta.goal,
    diet_tags: meta.dietTags || ['No Restrictions'],
    budget_tier: meta.budgetTier || null,
    calories: normalized.calories,
    protein_g: normalized.protein,
    carbs_g: normalized.carbs,
    fat_g: normalized.fat,
    cuisine_tags: meta.cuisineTags || [],
    archetype_key: meta.archetypeKey || null,
    ingredient_names: extractIngredientNames(normalized),
    content_hash: computeContentHash(normalized, context),
    source: meta.source || 'import',
  }
}
