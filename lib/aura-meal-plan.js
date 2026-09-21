const TZ = 'Africa/Johannesburg'
const MEAL_SLOT_ORDER = ['breakfast', 'lunch', 'snack', 'dinner']

export function getLocalPlanContext(now = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const dayName = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long' }).format(now)
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', hour12: false }).format(now)
  )
  return { date, dayName, hour }
}

export function mealTypeForHour(hour) {
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 17) return 'snack'
  if (hour < 21) return 'dinner'
  return 'dinner'
}

function findDay(mealPlan, dayName) {
  if (!Array.isArray(mealPlan)) return null
  const target = dayName.toLowerCase()
  return mealPlan.find((d) => (d.dayName || '').toLowerCase() === target) || null
}

function findMealByType(meals, typeLower) {
  if (!Array.isArray(meals)) return null
  return meals.find((m) => (m.type || '').toLowerCase() === typeLower) || null
}

/** Current/upcoming meal slot for today in plan. */
export function resolveTodayMeal(mealPlan, now = new Date()) {
  const { date, dayName, hour } = getLocalPlanContext(now)
  const preferred = mealTypeForHour(hour)
  const day = findDay(mealPlan, dayName)
  if (!day?.meals?.length) {
    return { date, meal_type: preferred, dish: null, day: null }
  }

  const startIdx = MEAL_SLOT_ORDER.indexOf(preferred)
  for (let i = Math.max(0, startIdx); i < MEAL_SLOT_ORDER.length; i += 1) {
    const meal = findMealByType(day.meals, MEAL_SLOT_ORDER[i])
    if (meal) {
      return {
        date,
        meal_type: MEAL_SLOT_ORDER[i],
        dish: meal.name || null,
        day,
      }
    }
  }

  const fallback = day.meals[0]
  return {
    date,
    meal_type: (fallback?.type || preferred).toLowerCase(),
    dish: fallback?.name || null,
    day,
  }
}

export function isAuraFastingActive(profile, dateIso) {
  if (!profile?.aura_fasting) return false
  const until = profile.aura_fasting_until
  if (until && String(until) < dateIso) return false
  return true
}

/** Swap meal name on today's day (or first plan day if weekday not found). */
export function applyMealSwap(planJson, mealType, dish, now = new Date()) {
  const mealPlan = planJson?.mealPlan
  if (!Array.isArray(mealPlan) || !mealPlan.length) {
    throw new Error('no_meal_plan')
  }

  const { dayName } = getLocalPlanContext(now)
  let day = findDay(mealPlan, dayName)
  if (!day) day = mealPlan[0]

  const typeLower = String(mealType || '').toLowerCase()
  const meals = day.meals || []
  const idx = meals.findIndex((m) => (m.type || '').toLowerCase() === typeLower)
  if (idx < 0) throw new Error('meal_type_not_found')

  const nextMeals = [...meals]
  nextMeals[idx] = {
    ...nextMeals[idx],
    name: String(dish).trim(),
    description: nextMeals[idx].description || 'Updated via your coach.',
  }

  const nextDay = { ...day, meals: nextMeals }
  const nextPlan = mealPlan.map((d) => (d === day || (d.day === day.day && d.dayName === day.dayName) ? nextDay : d))

  return { ...planJson, mealPlan: nextPlan }
}
