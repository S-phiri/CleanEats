export const COUNTRIES = {
  ZM: { name:'Zambia', currency:'ZMW', sym:'K', label:'ZMW — Zambian Kwacha', budgetL:'K50–80/day', budgetM:'K120–200/day', budgetH:'K300+/day',
    staples:'mealie meal, dried kapenta, beans, groundnuts, sweet potato, rape leaves, tomatoes, onions, chicken, eggs, rice, pasta, cabbages',
    modern:'Shoprite, Spar, Choppies in cities stock rice, pasta, chicken breast, oats, Greek yoghurt, protein products, eggs, most sauces and international ingredients',
    note:'Major supermarkets in Lusaka have excellent variety. Local markets offer cheap fresh produce.' },
  ZA: { name:'South Africa', currency:'ZAR', sym:'R', label:'ZAR — South African Rand', budgetL:'R80–150/day', budgetM:'R200–350/day', budgetH:'R500+/day',
    staples:'maize meal (pap), boerewors, braai cuts, chicken, eggs, chakalaka, butternut, spinach, potatoes, tinned fish, lentils, rice',
    modern:'Pick n Pay, Checkers, Woolworths Food, Spar have excellent variety including protein products and all international ingredients',
    note:'SA has excellent variety. Shoprite/Checkers offer great value.' },
  ZW: { name:'Zimbabwe', currency:'USD', sym:'$', label:'USD (Zimbabwe uses USD)', budgetL:'$4–7/day', budgetM:'$10–18/day', budgetH:'$25+/day',
    staples:'sadza (mealie meal), beef, goat, muriwo (leafy greens), beans, groundnuts, sweet potato, eggs',
    modern:'OK Zimbabwe, Pick n Pay, Bon Marché stock rice, pasta, chicken, imported sauces',
    note:'Focus on local fresh produce and proteins from local butchers for best value.' },
  KE: { name:'Kenya', currency:'KES', sym:'Ksh', label:'KES — Kenyan Shilling', budgetL:'Ksh300–500/day', budgetM:'Ksh800–1500/day', budgetH:'Ksh2500+/day',
    staples:'ugali, sukuma wiki (kale), nyama choma, githeri, chapati, tilapia, eggs, avocado, beans',
    modern:'Naivas, Carrefour, Chandarana stock all international ingredients and health foods',
    note:'Kenyan fresh produce is excellent. Avocado and eggs are very affordable.' },
  NG: { name:'Nigeria', currency:'NGN', sym:'₦', label:'NGN — Nigerian Naira', budgetL:'₦3,000–5,000/day', budgetM:'₦8,000–15,000/day', budgetH:'₦25,000+/day',
    staples:'eba (garri), jollof rice, egusi, efo riro, suya, plantain, yam, palm oil, beans, chicken, eggs',
    modern:'Shoprite, Spar, Ebeano stock modern ingredients and health foods in major cities',
    note:'Local open markets offer far better value than supermarkets.' },
  GB: { name:'United Kingdom', currency:'GBP', sym:'£', label:'GBP — British Pound', budgetL:'£5–8/day', budgetM:'£10–18/day', budgetH:'£25+/day',
    staples:'chicken, oats, eggs, tinned fish, potatoes, broccoli, spinach, Greek yoghurt, lentils, rice',
    modern:'Tesco, Sainsbury\'s, Asda, Morrisons, Aldi, Lidl have everything',
    note:'Aldi/Lidl offer excellent quality at low prices. Frozen veg is nutritionally equivalent to fresh.' },
  US: { name:'United States', currency:'USD', sym:'$', label:'USD — US Dollar', budgetL:'$6–10/day', budgetM:'$12–20/day', budgetH:'$30+/day',
    staples:'chicken breast, ground turkey, eggs, oats, brown rice, sweet potato, broccoli, spinach, Greek yoghurt, canned beans',
    modern:'Trader Joe\'s, Aldi, Walmart, Kroger, Costco have everything',
    note:'Costco excellent for bulk protein. Frozen veg and canned beans are budget staples.' },
  other: { name:'International', currency:'USD', sym:'$', label:'USD (approximate)', budgetL:'$5–8/day', budgetM:'$12–20/day', budgetH:'$30+/day',
    staples:'chicken, eggs, rice, oats, legumes, seasonal vegetables',
    modern:'Local supermarkets stock most international ingredients',
    note:'Focus on locally available whole foods and seasonal produce.' }
}

// Mifflin-St Jeor TDEE calculation
export function calcTDEE({ weightKg, heightCm, age, sex, activity, job, dailySteps }) {
  const w = parseFloat(weightKg)
  const h = parseFloat(heightCm)
  const a = parseFloat(age)
  if (!w || !h || !a) return null

  let bmr = sex === 'Female'
    ? (10 * w + 6.25 * h - 5 * a - 161)
    : (10 * w + 6.25 * h - 5 * a + 5)

  const actMap = { none: 1.2, low: 1.375, mod: 1.55, high: 1.725, vhigh: 1.9 }
  let mult = actMap[activity] ?? 1.55

  const jobBonus = { desk: 0, light: 0.05, active: 0.1, heavy: 0.175 }
  mult += jobBonus[job] || 0

  const steps = parseInt(dailySteps) || 6000
  if (steps < 3000) mult -= 0.05
  else if (steps > 18000) mult += 0.1
  else if (steps > 12000) mult += 0.05

  return Math.round(bmr * mult)
}

export const TIERS = {
  free: { label: 'Free', generationsPerMonth: 2, planDays: 3 },
  pro:  { label: 'Pro',  generationsPerMonth: Infinity, planDays: 5 },
  coach:{ label: 'Coach',generationsPerMonth: Infinity, planDays: 7 },
}
