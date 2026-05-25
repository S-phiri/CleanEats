/**
 * Mock meal-plan + shopping fixtures for MOCK_GENERATION (dev / no API spend).
 * Shape matches app/profile + PlanViewClient expectations — not used by real Anthropic calls.
 */

function p(ingredient, grams, measure, visual) {
  return { ingredient, grams, measure, visual }
}

function meal(type, name, description, calories, protein, carbs, fat, portions) {
  return { type, name, description, calories, protein, carbs, fat, portions }
}

/** Zambia fat loss — compact but valid (5×3 meals). */
export const zm_male_fatloss = {
  plan: {
    planTitle: 'Lean & Strong — Zambian Edition',
    planSubtitle: '5-day high-protein fat loss plan built around traditional Zambian staples',
    tdee: 2700,
    targetCalories: 2150,
    targetProtein: 175,
    targetCarbs: 205,
    targetFat: 58,
    days: 5,
    mealFrequencyRecommendation: '',
    mealPlan: [
      {
        day: 1,
        dayName: 'Monday',
        totalCalories: 2148,
        meals: [
          meal('Breakfast', 'Egg & Sweet Potato Scramble', 'Protein-rich scramble with sweet potato.', 480, 34, 42, 16, [
            p('Eggs', 180, '3 large eggs', 'cupped hand'),
            p('Sweet potato', 150, '1 medium', 'fist-sized'),
            p('Sunflower oil', 10, '1 tsp', 'bottle cap'),
          ]),
          meal('Lunch', 'Grilled Tilapia with Nshima & Rape', 'Lean fish with nshima and greens.', 620, 52, 72, 10, [
            p('Tilapia fillet', 200, '1 fillet', 'palm-sized'),
            p('Nshima (cooked)', 250, '2 balls', 'two golf balls'),
            p('Rape leaves', 100, '1 cup cooked', 'cupped hand'),
          ]),
          meal('Dinner', 'Chicken Stew with Sweet Potato', 'Skinless chicken in tomato with sweet potato.', 580, 48, 52, 14, [
            p('Chicken breast', 200, '1 breast', 'palm-sized'),
            p('Sweet potato', 180, '1 large', 'fist'),
            p('Tomatoes', 100, '2 medium', 'tennis ball each'),
          ]),
        ],
      },
      {
        day: 2,
        dayName: 'Tuesday',
        totalCalories: 2152,
        meals: [
          meal('Breakfast', 'Millet Porridge & Banana', 'Slow-release carbs with groundnuts.', 460, 16, 68, 14, [
            p('Millet (cooked)', 200, '1 bowl', 'two cupped hands'),
            p('Groundnuts', 30, 'small handful', 'closed palm'),
            p('Banana', 120, '1 medium', 'hand length'),
          ]),
          meal('Lunch', 'Kapenta & Nshima', 'Small fish with nshima and pumpkin leaves.', 580, 48, 68, 10, [
            p('Kapenta (cooked)', 80, '½ cup', 'cupped palm'),
            p('Nshima', 250, '2 balls', 'two golf balls'),
            p('Pumpkin leaves', 100, '1 cup', 'cupped hand'),
          ]),
          meal('Dinner', 'Beef & Vegetable Stew', 'Lean beef with carrots and tomato.', 560, 46, 40, 18, [
            p('Lean beef', 180, '6 chunks', 'palm-sized'),
            p('Carrots', 80, '1 carrot', 'finger-length'),
            p('Sunflower oil', 10, '1 tsp', 'bottle cap'),
          ]),
        ],
      },
      {
        day: 3,
        dayName: 'Wednesday',
        totalCalories: 2140,
        meals: [
          meal('Breakfast', 'Boiled Eggs & Avocado on Bread', 'Quick high-protein breakfast.', 450, 24, 36, 22, [
            p('Eggs', 120, '2 large', 'two halves'),
            p('Whole wheat bread', 80, '2 slices', 'playing-card thick'),
            p('Avocado', 80, '½ medium', 'half fist'),
          ]),
          meal('Lunch', 'Grilled Chicken with Nshima & Cabbage', 'Lean chicken with staples.', 610, 54, 68, 10, [
            p('Chicken breast', 200, '1 breast', 'palm-sized'),
            p('Nshima', 250, '2 balls', 'two golf balls'),
            p('Cabbage', 100, '1 cup', 'cupped hand'),
          ]),
          meal('Dinner', 'Baked Tilapia & Sweet Potato', 'Fish with mash and greens.', 540, 46, 52, 12, [
            p('Tilapia fillet', 200, '1 fillet', 'palm-sized'),
            p('Sweet potato', 200, '1 cup mashed', 'two cupped hands'),
            p('Lemon juice', 15, '1 tbsp', 'splash'),
          ]),
        ],
      },
      {
        day: 4,
        dayName: 'Thursday',
        totalCalories: 2155,
        meals: [
          meal('Breakfast', 'Peanut Butter & Banana Oats', 'Filling oat bowl.', 470, 18, 62, 16, [
            p('Rolled oats', 80, '1 cup cooked', 'two cupped hands'),
            p('Groundnut butter', 30, '1 tbsp', 'thumb blob'),
            p('Banana', 120, '1 medium', 'hand length'),
          ]),
          meal('Lunch', 'Bean Stew with Nshima', 'Plant protein with nshima.', 580, 36, 80, 8, [
            p('Borlotti beans', 200, '1 cup', 'two cupped hands'),
            p('Nshima', 200, '2 small balls', 'two golf balls'),
            p('Tomatoes', 100, '2 medium', 'tennis balls'),
          ]),
          meal('Dinner', 'Grilled Beef with Pumpkin', 'Beef strips with roasted pumpkin.', 560, 46, 40, 18, [
            p('Lean beef', 180, '6 strips', 'palm-sized'),
            p('Pumpkin', 200, '4 wedges', 'finger-thick'),
            p('Sunflower oil', 8, '¾ tsp', 'bottle cap'),
          ]),
        ],
      },
      {
        day: 5,
        dayName: 'Friday',
        totalCalories: 2145,
        meals: [
          meal('Breakfast', 'Egg Omelette with Tomato', 'Three-egg omelette.', 430, 28, 14, 28, [
            p('Eggs', 180, '3 large', 'cupped hand'),
            p('Tomatoes', 80, '1 medium', 'tennis ball'),
            p('Sunflower oil', 10, '1 tsp', 'bottle cap'),
          ]),
          meal('Lunch', 'Tilapia with Rice & Relish', 'Fish with rice.', 620, 50, 70, 10, [
            p('Tilapia fillet', 200, '1 fillet', 'palm-sized'),
            p('White rice', 200, '1 cup cooked', 'two cupped hands'),
            p('Tomato relish', 80, '3 tbsp', 'dollop'),
          ]),
          meal('Dinner', 'Chicken & Groundnut Soup', 'Groundnut soup with chicken.', 580, 46, 32, 26, [
            p('Chicken thigh (skinless)', 180, '2 thighs', 'palm each'),
            p('Groundnut butter', 40, '2 tbsp', 'two blobs'),
            p('Sweet potato', 120, '1 small', 'fist'),
          ]),
        ],
      },
    ],
    planSummary: 'High-protein Zambian staples tuned for fat loss and training recovery.',
    wellnessSupport: {
      intro: 'Optional supportive ideas — meals carry your macros.',
      foodIdeas: [],
      supplements: [
        { name: 'Vitamin D3', note: 'Often discussed where sun exposure is limited.', caution: 'Ask your clinician if you have kidney issues or take medications.' },
        { name: 'Omega-3', note: 'Fish oil or algae oil are commonly discussed for general wellness.', caution: 'Blood thinners — seek advice first.' },
      ],
      hydratingDrinks: [
        { name: 'Lemon & cucumber water', note: '1 litre jug in the fridge; finish within 2 days.' },
        { name: 'Small tomato–veg juice', note: 'Low sugar; with lunch 2–3× this week.' },
      ],
    },
  },
  shopping: {
    weeklyBudgetEstimate: 'K280–K360 per week',
    shoppingList: {
      Produce: [
        { item: 'Sweet potato', qty: '1.2kg', price: 'K18' },
        { item: 'Tomatoes', qty: '1kg', price: 'K14' },
        { item: 'Rape leaves', qty: '3 bunches', price: 'K9' },
      ],
      'Protein Sources': [
        { item: 'Tilapia fillet', qty: '800g', price: 'K72' },
        { item: 'Chicken breast', qty: '600g', price: 'K68' },
        { item: 'Eggs', qty: '18', price: 'K36' },
      ],
      'Dairy & Eggs': [],
      'Grains & Legumes': [
        { item: 'Maize meal', qty: '2kg', price: 'K24' },
        { item: 'White rice', qty: '400g', price: 'K14' },
      ],
      'Pantry & Oils': [
        { item: 'Sunflower oil', qty: '500ml', price: 'K22' },
        { item: 'Groundnut butter', qty: '250g', price: 'K28' },
      ],
      Frozen: [],
      'Snacks & Extras': [{ item: 'Roasted groundnuts', qty: '200g', price: 'K14' }],
    },
    prepGuide: [
      {
        title: 'Batch cook nshima & rice',
        icon: '🫕',
        steps: [
          'Sunday: cook a large pot of nshima; cool in shallow containers within 2 hours.',
          'Fridge up to 3 days; reheat with a splash of water on the stove.',
          'Cook white rice the same day for Tue–Wed fish meals; store 3 days max.',
        ],
      },
      {
        title: 'Overnight millet / oats',
        icon: '🌙',
        steps: [
          'Tue & Thu breakfasts: mix dry grains + liquid the night before.',
          'Keep ≤3 days refrigerated in sealed jars; add fruit the morning of.',
        ],
      },
      {
        title: 'Proteins',
        icon: '🍗',
        steps: [
          'Season chicken and beef Sunday; store marinades separately if wet.',
          'Grill or pan-fry within 20 minutes; cool before fridge storage.',
        ],
      },
      {
        title: 'Vegetables',
        icon: '🥬',
        steps: [
          'Wash rape and chop once; line container with paper towel.',
          'Blanch or sauté within 4 days of purchase for best texture.',
        ],
      },
    ],
  },
}

/** US muscle gain — completed (was truncated in chat). */
export const us_male_muscle = {
  plan: {
    planTitle: 'Mass & Power — US Edition',
    planSubtitle: '5-day high-protein American muscle-building plan for serious lifters',
    tdee: 3000,
    targetCalories: 3400,
    targetProtein: 200,
    targetCarbs: 380,
    targetFat: 85,
    days: 5,
    mealFrequencyRecommendation:
      'Consider a post-workout shake with a banana if training is very high intensity.',
    mealPlan: [
      {
        day: 1,
        dayName: 'Monday',
        totalCalories: 3398,
        meals: [
          meal('Breakfast', 'Steak & Eggs with Hash Browns', 'Classic power breakfast.', 880, 62, 60, 38, [
            p('Sirloin steak', 200, '1 steak', 'palm and a half'),
            p('Eggs', 180, '3 large', 'cupped hand'),
            p('Hash browns', 150, '2 patties', 'two discs'),
            p('Butter', 10, '1 tsp', 'bottle cap'),
          ]),
          meal('Lunch', 'Double Chicken Rice Bowl', 'High-volume chicken and rice.', 980, 80, 110, 22, [
            p('Chicken breast', 300, '2 breasts', 'two palms'),
            p('White rice', 300, '1.5 cups', 'three cupped hands'),
            p('Broccoli', 200, '2 cups', 'two cupped hands'),
            p('Olive oil', 12, '1 tbsp', 'thumb'),
          ]),
          meal('Dinner', 'Lean Beef Burgers & Sweet Potato Fries', 'Double patties with oven fries.', 980, 64, 100, 32, [
            p('Lean beef patties', 250, '2 patties', 'two palms'),
            p('Whole wheat buns', 120, '2 buns', 'fist-sized'),
            p('Sweet potato fries', 250, '1 large potato', 'fist+'),
            p('Cheddar', 40, '2 slices', 'thin slices'),
          ]),
        ],
      },
      {
        day: 2,
        dayName: 'Tuesday',
        totalCalories: 3405,
        meals: [
          meal('Breakfast', 'Protein Pancakes with Berries', 'Macro-friendly pancakes.', 780, 52, 90, 20, [
            p('Protein pancake mix (prepared)', 150, '3 pancakes', 'three discs'),
            p('Eggs', 120, '2 large', 'halves'),
            p('Mixed berries', 120, '1 cup', 'cupped hand'),
            p('Maple syrup', 30, '2 tbsp', 'drizzle'),
          ]),
          meal('Lunch', 'Tuna & White Bean Wrap', 'High-protein wrap.', 720, 60, 68, 22, [
            p('Canned tuna', 200, '1.5 cans', 'palm and half'),
            p('White beans', 120, '½ cup', 'cupped hand'),
            p('Flour tortilla', 80, '1 large', 'plate-sized'),
            p('Avocado', 80, '½ medium', 'half fist'),
          ]),
          meal(
            'Dinner',
            'BBQ Chicken with Mac & Cheese & Corn',
            'Comfort plate: saucy chicken, baked mac, and corn.',
            980,
            58,
            112,
            28,
            [
              p('Chicken thigh (boneless)', 220, '2 thighs', 'palm each'),
              p('Macaroni & cheese (baked)', 280, '1.5 cups', 'two cupped hands'),
              p('Corn on the cob', 150, '1 ear', 'hand length'),
              p('BBQ sauce', 40, '2 tbsp', 'two thumbs'),
            ]
          ),
        ],
      },
      {
        day: 3,
        dayName: 'Wednesday',
        totalCalories: 3390,
        meals: [
          meal('Breakfast', 'Egg Bagel Sandwich', 'Egg, cheese, and ham on a bagel.', 820, 48, 72, 32, [
            p('Everything bagel', 100, '1 bagel', 'fist'),
            p('Eggs', 180, '3 scrambled', 'cupped hand'),
            p('Cheddar', 40, '2 slices', 'thin'),
            p('Ham', 60, '2 slices', 'palm'),
          ]),
          meal('Lunch', 'Burrito Bowl (Steak)', 'Rice, beans, steak, guac.', 1120, 72, 120, 36, [
            p('Sirloin strips', 200, 'grilled', 'palm'),
            p('White rice', 250, '1.25 cups', 'cupped hands'),
            p('Black beans', 150, '¾ cup', 'cupped hand'),
            p('Guacamole', 80, '⅓ cup', 'half fist'),
          ]),
          meal('Dinner', 'Salmon, Baked Potato, Asparagus', 'Omega-3 and carbs for recovery.', 820, 52, 72, 28, [
            p('Salmon fillet', 220, '1 large fillet', 'palm+'),
            p('Baked potato', 300, '1 large', 'two fists'),
            p('Asparagus', 120, '1 bunch', 'handful'),
            p('Butter', 12, '1 tbsp', 'thumb'),
          ]),
        ],
      },
      {
        day: 4,
        dayName: 'Thursday',
        totalCalories: 3410,
        meals: [
          meal('Breakfast', 'Overnight Oats & Whey', 'Oats with protein powder and peanut butter.', 760, 48, 88, 22, [
            p('Rolled oats (dry)', 100, '1 cup dry', 'cupped hand'),
            p('Whey protein', 40, '1 scoop', 'scoop'),
            p('Peanut butter', 32, '2 tbsp', 'two blobs'),
            p('Banana', 120, '1 medium', 'hand'),
          ]),
          meal('Lunch', 'Turkey Meatball Sub', 'Lean meatballs on hoagie.', 980, 64, 102, 28, [
            p('Turkey meatballs', 250, '6 balls', 'golf balls'),
            p('Hoagie roll', 120, '1 roll', 'forearm'),
            p('Marinara', 120, '½ cup', 'cupped hand'),
            p('Mozzarella', 40, '2 oz', 'thin layer'),
          ]),
          meal('Dinner', 'Pork Tenderloin & Roasted Veg', 'Lean pork with potatoes and peppers.', 1020, 58, 96, 32, [
            p('Pork tenderloin', 240, '8 oz', 'palm+'),
            p('Baby potatoes', 250, '1 cup roasted', 'cupped hands'),
            p('Bell peppers', 100, '1 large', 'half fist slices'),
            p('Olive oil', 14, '1 tbsp', 'thumb'),
          ]),
        ],
      },
      {
        day: 5,
        dayName: 'Friday',
        totalCalories: 3395,
        meals: [
          meal('Breakfast', 'French Toast & Bacon', 'Carb + protein start.', 900, 42, 96, 36, [
            p('Whole wheat bread', 120, '4 slices', 'deck thick'),
            p('Eggs', 180, '3 in batter', 'cupped hand'),
            p('Bacon', 60, '3 strips', 'palm length'),
            p('Maple syrup', 30, '2 tbsp', 'drizzle'),
          ]),
          meal('Lunch', 'Chipotle-Style Chicken Bowl', 'Rice, beans, chicken, cheese.', 1100, 70, 118, 30, [
            p('Chicken breast', 220, 'diced', 'palm+'),
            p('Brown rice', 220, '1 cup', 'two cupped hands'),
            p('Pinto beans', 150, '¾ cup', 'cupped hand'),
            p('Cheese', 50, '2 oz', 'shredded mound'),
          ]),
          meal('Dinner', 'Pizza Night (Chicken & Veg)', 'Thin crust, extra protein.', 980, 56, 110, 28, [
            p('Chicken breast', 180, 'grilled strips', 'palm'),
            p('Pizza crust', 200, '2 slices', 'plate'),
            p('Mozzarella', 80, '3 oz', 'layer'),
            p('Veg toppings', 100, 'peppers/onion', 'cup'),
          ]),
        ],
      },
    ],
    planSummary: 'High-calorie American staples with repeatable batch prep for lifters.',
    wellnessSupport: {
      intro: 'Optional add-ons — your meals already target protein and calories.',
      foodIdeas: [],
      supplements: [
        { name: 'Creatine monohydrate', note: 'Widely used for strength training; hydrate well.', caution: 'Kidney disease — discuss with your clinician.' },
        { name: 'Vitamin D3', note: 'Often discussed in northern latitudes or limited sun.', caution: 'Medication interactions — ask your doctor.' },
      ],
      hydratingDrinks: [
        { name: 'Electrolyte water (low sugar)', note: 'Sip around heavy training days.' },
        { name: 'Ginger–lemon shot (small)', note: 'Occasional; not a meal replacement.' },
      ],
    },
  },
  shopping: {
    weeklyBudgetEstimate: '$95–$130 per week',
    shoppingList: {
      Produce: [
        { item: 'Sweet potato', qty: '3 lb', price: '$4' },
        { item: 'Russet potatoes', qty: '5 lb', price: '$5' },
        { item: 'Broccoli', qty: '2 heads', price: '$4' },
        { item: 'Asparagus', qty: '1 lb', price: '$5' },
        { item: 'Mixed bell peppers', qty: '3', price: '$4' },
        { item: 'Bananas', qty: '1 bunch', price: '$2' },
        { item: 'Berries (frozen)', qty: '12 oz', price: '$4' },
        { item: 'Corn on the cob', qty: '4 ears', price: '$3' },
      ],
      'Protein Sources': [
        { item: 'Chicken breast', qty: '4 lb', price: '$18' },
        { item: 'Sirloin steak', qty: '1.5 lb', price: '$16' },
        { item: 'Salmon fillet', qty: '1.25 lb', price: '$14' },
        { item: 'Pork tenderloin', qty: '1.5 lb', price: '$10' },
        { item: 'Lean ground beef', qty: '2 lb', price: '$12' },
        { item: 'Turkey meatballs / ground turkey', qty: '2 lb', price: '$12' },
        { item: 'Canned tuna', qty: '4 cans', price: '$8' },
        { item: 'Eggs', qty: '2 dozen', price: '$7' },
        { item: 'Bacon', qty: '12 oz', price: '$6' },
      ],
      'Dairy & Eggs': [
        { item: 'Cheddar cheese', qty: '16 oz', price: '$6' },
        { item: 'Mozzarella', qty: '16 oz', price: '$6' },
        { item: 'Greek yogurt', qty: '32 oz', price: '$5' },
      ],
      'Grains & Legumes': [
        { item: 'White rice', qty: '5 lb', price: '$8' },
        { item: 'Brown rice', qty: '2 lb', price: '$4' },
        { item: 'Rolled oats', qty: '42 oz', price: '$5' },
        { item: 'Protein pancake mix', qty: '1 box', price: '$6' },
        { item: 'Whole wheat bread & bagels', qty: '1 each', price: '$6' },
        { item: 'Flour tortillas', qty: '10-pack', price: '$4' },
        { item: 'Black & pinto beans (canned)', qty: '4 cans', price: '$5' },
        { item: 'Macaroni', qty: '16 oz', price: '$2' },
      ],
      'Pantry & Oils': [
        { item: 'Olive oil', qty: '500 ml', price: '$8' },
        { item: 'BBQ sauce', qty: '18 oz', price: '$4' },
        { item: 'Marinara', qty: '24 oz', price: '$3' },
        { item: 'Peanut butter', qty: '16 oz', price: '$4' },
        { item: 'Maple syrup', qty: '12 oz', price: '$6' },
        { item: 'Whey protein', qty: '2 lb tub', price: '$35' },
      ],
      Frozen: [
        { item: 'Mixed vegetables', qty: '32 oz', price: '$4' },
        { item: 'Hash brown patties', qty: '10 ct', price: '$5' },
      ],
      'Snacks & Extras': [
        { item: 'Pizza dough or thin crust', qty: '2', price: '$8' },
        { item: 'Hot sauce / seasonings', qty: 'pantry', price: '$5' },
      ],
    },
    prepGuide: [
      {
        title: 'Sunday protein prep',
        icon: '🍗',
        steps: [
          'Grill or bake chicken in batches; cool within 2 hours.',
          'Slice or shred; fridge 3–4 days in sealed containers.',
          'Reheat in a pan or air fryer to 165°F; avoid leaving cooked meat at room temp.',
        ],
      },
      {
        title: 'Rice & potatoes',
        icon: '🍚',
        steps: [
          'Batch white and brown rice Sunday; portion after cooling.',
          'Rice: eat within 3–4 days; reheat until steaming hot.',
          'Bake russets and sweet potatoes together; reheat or mash through the week.',
        ],
      },
      {
        title: 'Overnight oats (Thu + backups)',
        icon: '🌙',
        steps: [
          'Wed night: mix dry oats, whey, milk or yogurt in jars.',
          'Fridge up to 3 days; add banana and PB the morning of.',
          'If doubling batches, label dates to avoid pushing past safe window.',
        ],
      },
      {
        title: 'Shake station',
        icon: '🥤',
        steps: [
          'Keep whey, oats, banana, peanut butter in one shelf zone.',
          'Post-workout: shaker bottle + water; wash same day.',
        ],
      },
    ],
  },
}

/** Same meals/shopping as male bundles; distinct titles for mock ID testing. */
function withPlanMeta(bundle, planTitle, planSubtitle) {
  return {
    plan: { ...bundle.plan, planTitle, planSubtitle },
    shopping: bundle.shopping,
  }
}

export const zm_female_fatloss = withPlanMeta(
  zm_male_fatloss,
  'Lean & Strong — Zambian Edition for Her',
  '5-day high-protein fat loss around Zambian staples — women’s targets & recovery'
)

export const us_female_muscle = withPlanMeta(
  us_male_muscle,
  'Muscle & Shape — US Edition for Her',
  '5-day high-protein muscle plan for women who lift — fuel and recovery'
)

export const MOCK_PROFILE_IDS = [
  'zm_male_fatloss',
  'zm_female_fatloss',
  'us_male_muscle',
  'us_female_muscle',
]

export const mockProfilesById = {
  zm_male_fatloss,
  zm_female_fatloss,
  us_male_muscle,
  us_female_muscle,
}

export const defaultMockProfileId = 'zm_male_fatloss'
