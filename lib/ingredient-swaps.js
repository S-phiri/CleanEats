/**
 * Context-aware local ingredient substitutes for Zambia, Kenya, and South Africa.
 */

const swapMap = {
  breakfast: {
    avocado: ['banana', 'peanut butter', 'cottage cheese'],
    'greek yoghurt': ['plain yoghurt', 'maas', 'amasi'],
    oats: ['mealie meal porridge', 'sorghum porridge', 'cream of wheat'],
    milk: ['soya milk', 'long life milk', 'amasi'],
    eggs: ['tofu scramble', 'cottage cheese', 'beans'],
    banana: ['mango', 'pawpaw', 'apple'],
    blueberries: ['mixed berries', 'banana', 'mango'],
    'mixed berries': ['banana', 'pawpaw', 'mango'],
    almonds: ['peanuts', 'sunflower seeds', 'cashews'],
    'protein powder': ['eggs', 'greek yoghurt', 'peanut butter'],
    bread: ['sweet potato', 'nshima', 'ugali'],
    honey: ['sugar', 'syrup', 'agave'],
    'peanut butter': ['almond butter', 'groundnut paste', 'tahini'],
    'whole milk': ['soya milk', 'oat milk', 'long life milk'],
    'cream cheese': ['cottage cheese', 'plain yoghurt', 'maas'],
    butter: ['margarine', 'coconut oil', 'sunflower oil'],
  },
  lunch: {
    avocado: ['butternut', 'hummus', 'cucumber'],
    'chicken breast': ['chicken thigh', 'guinea fowl', 'tofu'],
    tuna: ['bream', 'kapenta', 'pilchards', 'sardines'],
    salmon: ['bream', 'tilapia', 'kapenta'],
    'brown rice': ['white rice', 'samp', 'couscous', 'quinoa'],
    quinoa: ['brown rice', 'samp', 'pearl barley'],
    pasta: ['rice noodles', 'samp', 'brown rice'],
    spinach: ['rape', 'chibwabwa', 'collard greens'],
    kale: ['chibwabwa', 'rape', 'spinach'],
    'olive oil': ['sunflower oil', 'cooking oil'],
    lemon: ['lime', 'vinegar', 'lemon juice'],
    onion: ['spring onion', 'leeks', 'shallots'],
    tomatoes: ['tinned tomatoes', 'tomato paste', 'cherry tomatoes'],
    'beef mince': ['chicken mince', 'soya mince', 'lentils'],
    'sweet potato': ['butternut', 'pumpkin', 'potato'],
    bread: ['rice cakes', 'sweet potato', 'nshima'],
    cheese: ['cottage cheese', 'plain yoghurt'],
    hummus: ['avocado', 'cottage cheese', 'bean dip'],
  },
  dinner: {
    avocado: ['butternut', 'hummus', 'roasted peppers'],
    'chicken breast': ['chicken thigh', 'guinea fowl', 'fish'],
    beef: ['chicken', 'fish', 'lentils', 'beans'],
    salmon: ['bream', 'tilapia', 'kapenta'],
    tuna: ['bream', 'kapenta', 'pilchards'],
    'brown rice': ['white rice', 'samp', 'nshima', 'ugali'],
    pasta: ['rice', 'samp', 'nshima'],
    'sweet potato': ['butternut', 'pumpkin', 'potato', 'nshima'],
    spinach: ['rape', 'chibwabwa', 'collard greens'],
    kale: ['chibwabwa', 'rape', 'spinach'],
    broccoli: ['green beans', 'courgette', 'mixed vegetables'],
    'olive oil': ['sunflower oil', 'cooking oil'],
    onion: ['spring onion', 'leeks'],
    tomatoes: ['tinned tomatoes', 'tomato paste'],
    'beef mince': ['chicken mince', 'soya mince', 'lentils'],
    cream: ['coconut milk', 'plain yoghurt', 'evaporated milk'],
    butter: ['margarine', 'coconut oil', 'sunflower oil'],
    cheese: ['cottage cheese', 'nutritional yeast'],
  },
  snack: {
    almonds: ['peanuts', 'cashews', 'sunflower seeds'],
    'protein powder': ['boiled eggs', 'biltong', 'kapenta'],
    'greek yoghurt': ['plain yoghurt', 'maas', 'amasi'],
    banana: ['mango', 'pawpaw', 'apple'],
    'peanut butter': ['groundnut paste', 'tahini', 'almond butter'],
    'rice cakes': ['corn thins', 'crackers', 'sweet potato'],
    'dark chocolate': ['dried mango', 'dates', 'mixed nuts'],
  },
}

const MEAL_CONTEXTS = ['breakfast', 'lunch', 'dinner', 'snack']

function normalizeKey(name) {
  return (name || '').trim().toLowerCase()
}

function resolveMealContext(mealType) {
  const t = normalizeKey(mealType)
  if (!t) return null
  if (t.includes('break')) return 'breakfast'
  if (t.includes('lunch')) return 'lunch'
  if (t.includes('dinner') || t.includes('supper')) return 'dinner'
  if (t.includes('snack')) return 'snack'
  if (MEAL_CONTEXTS.includes(t)) return t
  return null
}

function findInContext(context, ingredient) {
  const ctx = swapMap[context]
  if (!ctx) return null

  const key = normalizeKey(ingredient)
  if (!key) return null

  if (ctx[key]) return [...ctx[key]]

  for (const [mapKey, swaps] of Object.entries(ctx)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return [...swaps]
  }

  return null
}

function toSwapObjects(names) {
  return names.map((name) => ({ ingredient: name }))
}

/**
 * @param {string} ingredient
 * @param {string} [mealType]
 * @returns {{ ingredient: string }[] | null}
 */
export function getLocalSwaps(ingredient, mealType) {
  const context = resolveMealContext(mealType)

  if (context) {
    const swaps = findInContext(context, ingredient)
    return swaps ? toSwapObjects(swaps) : null
  }

  for (const ctx of MEAL_CONTEXTS) {
    const swaps = findInContext(ctx, ingredient)
    if (swaps) return toSwapObjects(swaps)
  }

  return null
}

/**
 * @param {string} ingredient
 * @param {string} [mealType]
 * @returns {boolean}
 */
export function hasLocalSwap(ingredient, mealType) {
  return getLocalSwaps(ingredient, mealType) != null
}
