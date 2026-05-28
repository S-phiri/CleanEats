/**
 * Profile wizard copy & option lists. Uses \u escapes where needed so encoding stays reliable.
 */
export const STEPS = {
  1: { t: 'Step 1 \u2014 Your Body', d: 'We calculate your TDEE from your stats and daily life.' },
  2: { t: 'Step 2 \u2014 Goal & Activity', d: "Choose your goal. We'll calibrate your calorie target precisely." },
  3: { t: 'Step 3 \u2014 Diet & Restrictions', d: 'Dietary preferences and ingredients to avoid.' },
  4: { t: 'Step 4 \u2014 Culinary Style', d: 'How you like to eat and which cuisines inspire you.' },
  5: { t: 'Step 5 \u2014 Preferences', d: 'Meal timing, budget, and final details.' },
}

export const GOALS = [
  { id: 'losefat', label: 'Lose Fat' },
  { id: 'recomp', label: 'Body Recomp' },
  { id: 'leanbulk', label: 'Lean Bulk' },
  { id: 'musclegain', label: 'Muscle Gain' },
  { id: 'maintain', label: 'Maintain & Perform' },
  { id: 'athletic', label: 'Athletic Performance' },
  { id: 'gut', label: 'Gut Health & Longevity' },
]

export const ACTIVITIES = [
  { id: 'none', label: 'None / Rarely' },
  { id: 'low', label: '1\u20132x / week' },
  { id: 'mod', label: '3\u20134x / week' },
  { id: 'high', label: '5\u20136x / week' },
  { id: 'vhigh', label: 'Daily / 2x day' },
]

export const LIFESTYLE_TYPE_OPTIONS = [
  { value: 'home_cook', label: 'I cook most meals at home' },
  { value: 'lunch_out', label: 'I eat out for lunch daily' },
  { value: 'takeout', label: 'I rarely cook, mostly takeout' },
  { value: 'weekly_prep', label: 'I meal prep once a week' },
  { value: 'house_helper', label: 'I have a house helper who cooks' },
  { value: 'fast_day', label: 'I fast during the day, eat at night' },
]

export const DIETS = [
  'No Restrictions',
  'Keto / Low Carb',
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Paleo',
  'Gluten-Free',
  'Dairy-Free',
  'High Protein',
  'Mediterranean',
  'Whole Foods',
]

export const FASTINGS = ['None', '16:8 IF', '18:6', 'OMAD', '5:2']

export const ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Fish',
  'Shellfish',
  'Dairy',
  'Gluten',
  'Eggs',
  'Soy',
]

export const CUISINES = [
  { id: 'Mexican', icon: '\u{1F32E}' },
  { id: 'Indian', icon: '\u{1F35B}' },
  { id: 'Asian stir-fry', icon: '\u{1F35C}' },
  { id: 'Mediterranean', icon: '\u{1FAD3}' },
  { id: 'American BBQ', icon: '\u{1F354}' },
  { id: 'Middle Eastern', icon: '\u{1F9C2}' },
  { id: 'Japanese', icon: '\u{1F371}' },
  { id: 'Italian', icon: '\u{1F35D}' },
  { id: 'West African', icon: '\u{1F372}' },
  { id: 'East African', icon: '\u{1F33F}' },
  { id: 'Southern African', icon: '\u{1F525}' },
  { id: 'British', icon: '\u{1F9C0}' },
]

export const STYLES = [
  {
    id: 'traditional',
    icon: '\u{1F372}',
    name: 'Traditional',
    desc: 'Local staples and traditional dishes. Nshima, sadza, pap \u2014 meals that feel like home.',
  },
  {
    id: 'mixed',
    icon: '\u{1F30D}',
    name: 'Mixed',
    desc: 'Balance of local and international. Rice or nshima, local cuts or chicken breast.',
  },
  {
    id: 'modern',
    icon: '\u{1F957}',
    name: 'Modern / International',
    desc: 'Global ingredients from major supermarkets. No regional restriction.',
  },
]

export const MEALS_PER_DAY = [
  '1 meal (OMAD)',
  '2 meals',
  '3 meals',
  '3 + 1 snack',
  '3 + 2 snacks',
  '5\u20136 small meals',
]

export const COUNTRY_SELECT_OPTIONS = [
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'ZW', label: 'Zimbabwe' },
  { value: 'KE', label: 'Kenya' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'other', label: 'Other / International' },
]

export const SEX_OPTIONS = [
  { value: '', label: 'Select\u2026' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

export const UNITS_OPTIONS = [
  { value: 'metric', label: 'Metric (kg / cm)' },
  { value: 'imperial', label: 'Imperial (lbs / ft)' },
]

export const JOB_OPTIONS = [
  { value: '', label: 'Select\u2026' },
  { value: 'desk', label: 'Desk / Remote' },
  { value: 'light', label: 'Light on-feet' },
  { value: 'active', label: 'Active job' },
  { value: 'heavy', label: 'Heavy labour' },
]

export const PEOPLE_OPTIONS = [
  { value: '1', label: 'Just me (1)' },
  { value: '2', label: '2 people' },
  { value: '3', label: '3 people' },
  { value: '4', label: '4 people' },
  { value: '5+', label: '5+ people' },
]

export const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-friendly' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'premium', label: 'Premium' },
]

export const COOKTIME_OPTIONS = [
  { value: '15', label: 'Under 15 min' },
  { value: '30', label: 'Under 30 min' },
  { value: '60', label: 'Up to 1 hour' },
  { value: 'any', label: 'Any' },
]

/** How far ahead the user is willing to meal-prep (fridge life, batch cooks). */
export const MEAL_PREP_OPTIONS = [
  { value: 'fresh', label: 'Mostly fresh each day' },
  { value: '1-2day', label: '1–2 days ahead' },
  { value: '3day', label: 'Up to 3 days (batch, overnight oats, etc.)' },
  { value: '4day', label: 'Up to 4 days where food-safe' },
]

/** Quick-select ingredients for excludeIngredients (Step 3). */
export const EXCLUDE_QUICK_SELECT = [
  'Kapenta',
  'Offal/Organs',
  'Pork',
  'Beef',
  'Chicken',
  'Fish',
  'Eggs',
  'Dairy',
  'Mushrooms',
  'Shellfish',
  'Liver',
  'Tripe',
]

/** Quick-select meals for lovedMeals (Step 4). */
export const LOVED_MEALS_QUICK_SELECT = [
  'Nshima & Relish',
  'Grilled Tilapia',
  'Chicken Stew',
  'Groundnut Soup',
  'Sadza',
  'Jollof Rice',
  'Ugali',
  'Pap & Wors',
  'Injera',
  'Suya',
  'Chapati',
  'Pilau',
]

/** Optional wellness focuses — secondary to macros; drives supportive food/supplement ideas. */
export const WELLNESS_PILLARS = [
  { id: 'sleep', label: 'Sleep & recovery' },
  { id: 'focus', label: 'Focus & energy' },
  { id: 'muscle', label: 'Muscle & strength' },
  { id: 'memory', label: 'Memory & clarity' },
  { id: 'mood', label: 'Mood & stress' },
]
