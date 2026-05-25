'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Nav from '../Nav'
import { Share2, ShoppingCart, ClipboardList } from 'lucide-react'
import { buildPlanViewTokens } from '../lib/theme-tokens'
import Button from './primitives/Button'
import Glass from './primitives/Glass'
import DayChips from './plan/DayChips'
import SlotList from './plan/SlotList'
import RecipePanel from './plan/RecipePanel'
import { createClient } from '../lib/supabase-browser'
import { COUNTRIES, calcTDEE } from '../lib/utils'
import {
  buildStyleInstruction,
  buildStaplesRetailBlock,
  buildVarietyCuisineBlock,
  buildMaizePortionHint,
  buildShoppingPromptExtra,
} from '../lib/prompt-cuisine'
import { buildMealPrepPromptBlock, buildPrepGuideInstructions } from '../lib/meal-prep-prompt'
import { parseAssistantJson } from '../lib/parse-assistant-json'
import { getLocalSwaps } from '../lib/ingredient-swaps'

const SHOPPING_CATEGORIES = [
  'Produce',
  'Protein Sources',
  'Dairy & Eggs',
  'Grains & Legumes',
  'Pantry & Oils',
  'Frozen',
  'Snacks & Extras',
]

function itemKey(category, index) {
  return `${category}::${index}`
}

function cityForCountry(countryCode) {
  const code = (countryCode || '').toUpperCase()
  if (code === 'ZM') return 'Lusaka'
  if (code === 'KE') return 'Nairobi'
  if (code === 'ZA') return 'Johannesburg'
  return null
}


function normaliseForm(planData) {
  return planData.profile && typeof planData.profile === 'object' ? planData.profile : {}
}

function buildRegenerateMealPrompt(planData, available, unavailable) {
  const form = normaliseForm(planData)
  const cd = COUNTRIES[form.countryCode] || COUNTRIES.other
  const wkg = form.units === 'metric'
    ? form.weightKg
    : form.weightLbs ? (parseFloat(form.weightLbs) * 0.453592).toFixed(1) : ''
  const hcm = form.units === 'metric'
    ? form.heightCm
    : (form.heightFt || form.heightIn)
      ? ((parseFloat(form.heightFt || 0) * 30.48) + (parseFloat(form.heightIn || 0) * 2.54)).toFixed(0)
      : ''
  const tdeeVal = planData.tdee ?? calcTDEE({
    weightKg: wkg, heightCm: hcm, age: form.age, sex: form.sex,
    activity: form.activity, job: form.job, dailySteps: form.dailySteps,
  })

  const availBlock = available.length ? available.map(x => `- ${x}`).join('\n') : '- (none marked — assume standard shopping)'
  const unavailBlock = unavailable.length ? unavailable.map(x => `- ${x}`).join('\n') : '- (none)'
  const culinaryStyle = form.culinaryStyle || 'mixed'
  const countryCode = form.countryCode || ''
  const maizeLine = buildMaizePortionHint(culinaryStyle, countryCode)

  return `You are an expert sports nutritionist and precision meal planner.

REGENERATION — Rebuild a completely NEW 5-day meal plan. The user indicated what they already have at home vs what they still need.

ALREADY HAVE AT HOME (build meals around these first):
${availBlock}

NOT AVAILABLE / STILL NEEDED (minimise reliance; offer swaps):
${unavailBlock}

MACRO TARGETS (match closely):
- Maintenance TDEE: ${tdeeVal != null ? `${tdeeVal} kcal/day` : 'derive from profile'}
- Target calories: ${planData.targetCalories ?? '—'}, Protein: ${planData.targetProtein ?? '—'}g, Carbs: ${planData.targetCarbs ?? '—'}g, Fat: ${planData.targetFat ?? '—'}g

PROFILE (JSON): ${JSON.stringify({
    name: form.name, goal: form.goal, activity: form.activity, diet: form.diet,
    fasting: form.fasting, allergies: form.allergies, meals: form.meals,
    budget: form.budget, cooktime: form.cooktime, people: form.people,
    excludeIngredients: form.excludeIngredients, culinaryStyle: form.culinaryStyle,
    cuisines: form.cuisines, lovedMeals: form.lovedMeals, notes: form.notes,
    country: cd.name, currency: cd.currency,
  })}

CULINARY STYLE: ${buildStyleInstruction(culinaryStyle, cd)}
${buildStaplesRetailBlock(culinaryStyle, cd)}

${buildVarietyCuisineBlock(form.cuisines)}
${buildMealPrepPromptBlock(form)}

PORTIONS — each ingredient: grams + measure + visual. Max 5 portions per meal. Exactly 5 days in mealPlan.
${maizeLine ? maizeLine + '\n' : ''}

Return ONLY valid JSON, no markdown:
{
  "planTitle":"string","planSubtitle":"string",
  "tdee":${tdeeVal != null ? tdeeVal : 'null'},"targetCalories":number,"targetProtein":number,"targetCarbs":number,"targetFat":number,
  "days":5,"mealFrequencyRecommendation":"string or empty",
  "planSummary":"string",
  "wellnessSupport":{"intro":"string","foodIdeas":[],"supplements":[{"name":"string","note":"string","caution":"string"}],"hydratingDrinks":[{"name":"string","note":"string"}]},
  "mealPlan":[{"day":1,"dayName":"Monday","totalCalories":number,"meals":[{"type":"Breakfast","name":"string","description":"string","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"string","grams":150,"measure":"1 cup","visual":"fist-sized"}]}]}]
}`
}

function buildShoppingPrepPrompt(mealPlan, planData) {
  const form = normaliseForm(planData)
  const cd = COUNTRIES[form.countryCode] || COUNTRIES.other
  const br = form.budget === 'budget' ? cd.budgetL : form.budget === 'mid' ? cd.budgetM : cd.budgetH
  const culinaryStyle = form.culinaryStyle || 'mixed'
  const shoppingExtra = buildShoppingPromptExtra(culinaryStyle, cd)
  const mealSummary = (mealPlan || []).map(d =>
    (d.meals || []).map(m =>
      `${m.name}: ${(m.portions || []).map(p => `${p.grams}g ${p.ingredient}`).join(', ')}`
    ).join(' | ')
  ).join('\n')

  return `Generate shopping list with local ${cd.currency} prices and batch prep guide for a 5-day meal plan in ${cd.name}.
${shoppingExtra}
People: ${form.people || '1'}, Budget: ${form.budget || 'mid'} (~${br}), Never include: ${form.excludeIngredients || 'none'}
Local stores: ${cd.modern}

Meals:
${mealSummary}

${buildPrepGuideInstructions(form)}

Return ONLY valid JSON:
{"weeklyBudgetEstimate":"string","shoppingList":{"Produce":[{"item":"name","qty":"amount","price":"${cd.sym}X"}],"Protein Sources":[],"Dairy & Eggs":[],"Grains & Legumes":[],"Pantry & Oils":[],"Frozen":[],"Snacks & Extras":[]},"prepGuide":[{"title":"title","icon":"emoji","steps":["step"]}]}`
}

export default function PlanViewClient({
  user,
  tier,
  planId,
  planTitle,
  planSubtitle,
  planData: initialPlanData,
  embedded = false,
}) {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState('meals')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedMealIndex, setSelectedMealIndex] = useState(0)
  const [panelTab, setPanelTab] = useState('ingredients')
  const [openDays, setOpenDays] = useState(() => new Set([0]))
  const [checked, setChecked] = useState({})
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError] = useState('')
  const [livePlanData, setLivePlanData] = useState(initialPlanData || {})
  const [swappingPortionIndex, setSwappingPortionIndex] = useState(null)
  const [swapMealLoading, setSwapMealLoading] = useState(false)
  const [swapPicker, setSwapPicker] = useState(null)
  const [customSwapInput, setCustomSwapInput] = useState('')

  useEffect(() => {
    setLivePlanData(initialPlanData || {})
  }, [initialPlanData])

  const planData = livePlanData

  const hasWellness = useMemo(() => {
    const ws = planData.wellnessSupport
    if (ws == null || typeof ws !== 'object') return false
    return (
      (Array.isArray(ws.foodIdeas) && ws.foodIdeas.length > 0) ||
      (Array.isArray(ws.supplements) && ws.supplements.length > 0) ||
      (Array.isArray(ws.hydratingDrinks) && ws.hydratingDrinks.length > 0) ||
      !!(ws.intro && String(ws.intro).trim())
    )
  }, [planData.wellnessSupport])

  useEffect(() => {
    const next = {}
    SHOPPING_CATEGORIES.forEach(cat => {
      const rows = planData.shoppingList?.[cat]
      if (!Array.isArray(rows)) return
      rows.forEach((_, idx) => {
        next[itemKey(cat, idx)] = false
      })
    })
    setChecked(next)
  }, [initialPlanData])

  useEffect(() => {
    if (tab === 'wellness' && !hasWellness) setTab('meals')
  }, [tab, hasWellness])

  const T = useMemo(() => buildPlanViewTokens(true), [])

  function toggleDay(i) {
    setOpenDays(prev => {
      const n = new Set(prev)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  }

  function toggleCheck(cat, idx) {
    const k = itemKey(cat, idx)
    setChecked(c => ({ ...c, [k]: !c[k] }))
  }

  function applyPortionSwap(portionIndex, alt) {
    setLivePlanData(prev => {
      const mealPlanCopy = [...(prev.mealPlan || [])]
      const day = { ...mealPlanCopy[selectedDayIndex] }
      const meals = [...(day.meals || [])]
      const m = { ...meals[selectedMealIndex] }
      const portions = [...(m.portions || [])]
      portions[portionIndex] = {
        ...portions[portionIndex],
        ingredient: alt.ingredient,
        grams: alt.grams != null ? alt.grams : portions[portionIndex].grams,
        measure: alt.measure || portions[portionIndex].measure,
      }
      m.portions = portions
      meals[selectedMealIndex] = m
      day.meals = meals
      mealPlanCopy[selectedDayIndex] = day
      return { ...prev, mealPlan: mealPlanCopy }
    })
  }

  function closeSwapPicker() {
    setSwapPicker(null)
    setCustomSwapInput('')
  }

  function openIngredientSwap(portionIndex) {
    const meal = mealPlan[selectedDayIndex]?.meals?.[selectedMealIndex]
    const portion = meal?.portions?.[portionIndex]
    if (!portion?.ingredient || swappingPortionIndex !== null) return

    const ingredientName = portion.ingredient
    const localSwaps = getLocalSwaps(ingredientName, meal.type) ?? []
    if (localSwaps.length > 0) {
      setSwapPicker({ portionIndex, swaps: localSwaps, showCustom: false })
      setCustomSwapInput('')
      return
    }

    fetchSwapFromApi(portionIndex)
  }

  function selectLocalSwap(swap) {
    if (!swapPicker) return
    applyPortionSwap(swapPicker.portionIndex, swap)
    closeSwapPicker()
  }

  async function fetchSwapFromApi(portionIndex, userSubstitute = null) {
    const meal = mealPlan[selectedDayIndex]?.meals?.[selectedMealIndex]
    const portion = meal?.portions?.[portionIndex]
    if (!portion?.ingredient || swappingPortionIndex !== null) return

    const form = normaliseForm(planData)
    const cd = COUNTRIES[form.countryCode] || COUNTRIES.other
    const substituteBlock = userSubstitute
      ? `User substitute to confirm: ${userSubstitute}
Validate it works as a macro-equivalent replacement for ${portion.ingredient} (${portion.grams != null ? portion.grams + 'g' : '—'}).`
      : `Ingredient to replace: ${portion.ingredient} (${portion.grams != null ? portion.grams + 'g' : '—'})
Suggest ONE replacement available in local Zambian supermarkets.`

    const prompt = `INGREDIENT SWAP

Parent meal: ${meal.name}
${substituteBlock}
Meal macros: ${meal.calories ?? '—'} kcal, protein ${meal.protein ?? '—'}g, carbs ${meal.carbs ?? '—'}g, fat ${meal.fat ?? '—'}g
Country: ${cd.name}. Local Zambian supermarkets: ${cd.modern}
Diet: ${(form.diet || []).join(', ') || 'None'}
Allergies: ${(form.allergies || []).join(', ') || 'None'}
Never use: ${form.excludeIngredients || 'none'}

CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. Begin with { and end with }.
{"ingredient":"string","grams":number,"measure":"string"}`

    setSwappingPortionIndex(portionIndex)
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 500 }),
      })
      const d = await r.json()
      if (d.error === 'LIMIT_REACHED') {
        setRegenError('Free tier limit reached. Upgrade to Pro for unlimited plans.')
        return
      }
      if (d.error) throw new Error(d.error)
      const alt = parseAssistantJson(d)
      if (!alt?.ingredient) throw new Error('No alternative ingredient returned')

      applyPortionSwap(portionIndex, alt)
      closeSwapPicker()
    } catch (e) {
      console.error(e)
      setRegenError(e.message || 'Ingredient swap failed')
    } finally {
      setSwappingPortionIndex(null)
    }
  }

  function confirmCustomSwap() {
    const text = customSwapInput.trim()
    if (!swapPicker || !text) return
    fetchSwapFromApi(swapPicker.portionIndex, text)
  }

  async function swapMeal() {
    const day = mealPlan[selectedDayIndex]
    const meal = day?.meals?.[selectedMealIndex]
    if (!meal) return

    const form = normaliseForm(planData)
    const cd = COUNTRIES[form.countryCode] || COUNTRIES.other
    const city = cityForCountry(form.countryCode) || cd.name
    const dayNum = day?.day ?? selectedDayIndex + 1
    const prompt = `MEAL SWAP

Current meal to replace: ${meal.name}
Day: ${dayNum}${day?.dayName ? ` (${day.dayName})` : ''}
Meal type: ${meal.type || 'Meal'}
Current calories: ${meal.calories ?? '—'} kcal (keep similar within ~15%)
User goal: ${form.goal || 'maintain'}
City: ${city}. Country: ${cd.name}. Local stores: ${cd.modern}
Diet: ${(form.diet || []).join(', ') || 'None'}
Allergies: ${(form.allergies || []).join(', ') || 'None'}
Never use: ${form.excludeIngredients || 'none'}

Return ONE alternative meal with the same meal type, similar calories, using local ingredients available in ${city} (Zambian/local staples where appropriate).

CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. Begin with { and end with }.
{"type":"string","name":"string","description":"string","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"string","grams":number,"measure":"string"}]}`

    setSwapMealLoading(true)
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }),
      })
      const d = await r.json()
      if (d.error === 'LIMIT_REACHED') {
        setRegenError('Free tier limit reached. Upgrade to Pro for unlimited plans.')
        return
      }
      if (d.error) throw new Error(d.error)
      const alt = parseAssistantJson(d)
      if (!alt?.name) throw new Error('No alternative meal returned')

      setLivePlanData(prev => {
        const mealPlanCopy = [...(prev.mealPlan || [])]
        const dayCopy = { ...mealPlanCopy[selectedDayIndex] }
        const meals = [...(dayCopy.meals || [])]
        meals[selectedMealIndex] = {
          ...meals[selectedMealIndex],
          type: alt.type || meal.type,
          name: alt.name,
          description: alt.description ?? meals[selectedMealIndex].description,
          calories: alt.calories ?? meals[selectedMealIndex].calories,
          protein: alt.protein ?? meals[selectedMealIndex].protein,
          carbs: alt.carbs ?? meals[selectedMealIndex].carbs,
          fat: alt.fat ?? meals[selectedMealIndex].fat,
          portions: Array.isArray(alt.portions) ? alt.portions : meals[selectedMealIndex].portions,
        }
        dayCopy.meals = meals
        mealPlanCopy[selectedDayIndex] = dayCopy
        return { ...prev, mealPlan: mealPlanCopy }
      })
    } catch (e) {
      console.error(e)
      setRegenError(e.message || 'Meal swap failed')
    } finally {
      setSwapMealLoading(false)
    }
  }

  async function regenerateWithPantry() {
    setRegenError('')
    const available = []
    const unavailable = []
    SHOPPING_CATEGORIES.forEach(cat => {
      const rows = planData.shoppingList?.[cat]
      if (!Array.isArray(rows)) return
      rows.forEach((row, idx) => {
        const label = row.item || row.name || 'Item'
        const qty = row.qty || ''
        const price = row.price || ''
        const line = [label, qty, price].filter(Boolean).join(' · ')
        if (checked[itemKey(cat, idx)]) available.push(line)
        else unavailable.push(line)
      })
    })

    setRegenLoading(true)
    try {
      const prompt1 = buildRegenerateMealPrompt(planData, available, unavailable)
      const r1 = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt1 }], max_tokens: 7000 }),
      })
      const d1 = await r1.json()
      if (d1.error === 'LIMIT_REACHED') {
        setRegenError('Free tier limit reached. Upgrade to Pro for unlimited plans.')
        setRegenLoading(false)
        return
      }
      if (d1.error) throw new Error(d1.error)
      const plan = parseAssistantJson(d1)
      if (!Array.isArray(plan.mealPlan) || plan.mealPlan.length === 0) {
        throw new Error('Model did not return a valid meal plan. Try again.')
      }

      const mealSummaryPrompt = buildShoppingPrepPrompt(plan.mealPlan, planData)
      const r2 = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: mealSummaryPrompt }], max_tokens: 4000 }),
      })
      const d2 = await r2.json()
      if (d2.error) throw new Error(d2.error)
      const extra = parseAssistantJson(d2)

      const profile = normaliseForm(planData)
      const fullPlan = {
        ...plan,
        ...extra,
        profile,
        planSummary: plan.planSummary ?? planData.planSummary,
        wellnessSupport: plan.wellnessSupport ?? planData.wellnessSupport,
      }

      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) throw new Error('Not signed in')

      const { data: savedPlan, error: insErr } = await supabase.from('plans').insert({
        user_id: u.id,
        plan_title: plan.planTitle,
        plan_subtitle: plan.planSubtitle,
        target_calories: plan.targetCalories,
        plan_json: fullPlan,
      }).select('id').single()

      if (insErr) throw new Error(insErr.message)
      router.push(`/plan/${savedPlan.id}`)
    } catch (e) {
      console.error(e)
      setRegenError(e.message || 'Regeneration failed')
    } finally {
      setRegenLoading(false)
    }
  }

  const mealPlan = Array.isArray(planData.mealPlan) ? planData.mealPlan : []
  const prepGuide = Array.isArray(planData.prepGuide) ? planData.prepGuide : []
  const freq = (planData.mealFrequencyRecommendation || '').trim()
  const planSummary = (planData.planSummary || '').trim()
  const wellnessSupport = planData.wellnessSupport

  const macroCols = [
    { label: 'Maintenance TDEE', value: planData.tdee != null ? `${planData.tdee} kcal` : '—' },
    { label: 'Target calories', value: planData.targetCalories != null ? `${planData.targetCalories} kcal` : '—' },
    { label: 'Protein', value: planData.targetProtein != null ? `${planData.targetProtein} g` : '—' },
    { label: 'Carbs', value: planData.targetCarbs != null ? `${planData.targetCarbs} g` : '—' },
    { label: 'Fat', value: planData.targetFat != null ? `${planData.targetFat} g` : '—' },
  ]

  const tabs = [
    { id: 'meals', label: 'Meal Plan' },
    { id: 'shop', label: 'Shopping List' },
    { id: 'prep', label: 'Prep Guide' },
    ...(hasWellness ? [{ id: 'wellness', label: 'Wellness' }] : []),
  ]

  const selectedDay = mealPlan[selectedDayIndex]
  const selectedMeals = selectedDay?.meals || []
  const selectedMeal = selectedMeals[selectedMealIndex]
  const shoppingCount = SHOPPING_CATEGORIES.reduce((n, cat) => {
    const rows = planData.shoppingList?.[cat]
    return n + (Array.isArray(rows) ? rows.length : 0)
  }, 0)

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) await navigator.share({ title: planTitle || 'CleanEats Plan', url })
      else if (navigator.clipboard) await navigator.clipboard.writeText(url)
    } catch (_) {}
  }

  const shellClass = embedded ? T.text : `min-h-screen page-layer ${T.bg} ${T.text}`
  const innerClass = embedded ? '' : 'max-w-5xl mx-auto px-6 sm:px-10 py-10 sm:py-14'

  return (
    <div className={shellClass}>
      {!embedded && <Nav user={user} tier={tier} />}

      <div className={innerClass}>
        {!embedded && (
        <>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="font-syne text-2xl sm:text-3xl font-bold leading-tight">
              {planTitle || planData.planTitle || 'Your plan'}
            </h1>
            {(planSubtitle || planData.planSubtitle) && (
              <p className={`${T.muted} mt-1.5 text-sm sm:text-base`}>{planSubtitle || planData.planSubtitle}</p>
            )}
            {planSummary && (
              <p className={`${T.soft} mt-3 text-sm leading-relaxed border-l-2 border-green pl-3`}>{planSummary}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-5">
              <Link
                href="/profile"
                className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${T.border2} ${T.chip} hover:border-green`}
              >
                Edit Profile
              </Link>
              <Link
                href="/profile"
                className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium transition-all ${T.accentBtn}`}
              >
                New Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Macro banner */}
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-px rounded-2xl overflow-hidden border ${T.border} mb-4`}>
          {macroCols.map(col => (
            <div key={col.label} className={`${T.surface} px-3 py-4 text-center`}>
              <p className={`text-[0.65rem] font-semibold uppercase tracking-widest ${T.muted} mb-1`}>{col.label}</p>
              <p className="font-syne text-lg font-bold text-green">{col.value}</p>
            </div>
          ))}
        </div>

        {freq && (
          <div className={`rounded-xl border px-4 py-3 text-sm mb-8 ${T.greenBanner}`}>
            <span className="font-semibold">Meal frequency: </span>
            {freq}
          </div>
        )}
        </>
        )}

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl border ${T.border} ${T.s2} mb-6 w-fit flex-wrap`}>
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                tab === t.id
                  ? 'bg-ink text-base border-ink'
                  : `border-transparent ${T.tabInactive}`
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'meals' && (
          <div>
            {mealPlan.length === 0 ? (
              <p className={T.muted}>No meals in this plan.</p>
            ) : (
              <>
                <DayChips
                  mealPlan={mealPlan}
                  selectedIndex={selectedDayIndex}
                  onSelect={(i) => {
                    setSelectedDayIndex(i)
                    setSelectedMealIndex(0)
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-5 mt-6 overflow-hidden">
                  <div className="min-w-0 overflow-hidden">
                    <SlotList
                      meals={selectedMeals}
                      selectedIndex={selectedMealIndex}
                      onSelect={setSelectedMealIndex}
                    />
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <RecipePanel
                      meal={selectedMeal}
                      panelTab={panelTab}
                      onPanelTab={setPanelTab}
                      shoppingCount={shoppingCount}
                      swapPicker={swapPicker}
                      onIngredientRowTap={openIngredientSwap}
                      onSelectLocalSwap={selectLocalSwap}
                      onShowCustomSwap={() => setSwapPicker(p => (p ? { ...p, showCustom: true } : p))}
                      onHideCustomSwap={() => setSwapPicker(p => (p ? { ...p, showCustom: false } : p))}
                      customSwapInput={customSwapInput}
                      onCustomSwapInputChange={setCustomSwapInput}
                      onConfirmCustomSwap={confirmCustomSwap}
                      onCloseSwapPicker={closeSwapPicker}
                      swappingPortionIndex={swappingPortionIndex}
                      onSwapMeal={swapMeal}
                      swapMealLoading={swapMealLoading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'shop' && (
          <div>
            {planData.weeklyBudgetEstimate && (
              <p className={`${T.soft} text-sm font-medium mb-4`}>Est. weekly budget: {planData.weeklyBudgetEstimate}</p>
            )}
            <p className={`${T.muted} text-sm mb-4 max-w-2xl leading-relaxed`}>
              <strong className={T.text}>Pantry mode:</strong> tick what you already have at home. Unticked items are treated as still to buy.{' '}
              <strong className={T.text}>Regenerate with what I have</strong> builds a new plan that leans on checked ingredients and updates the shopping list and prep guide.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {SHOPPING_CATEGORIES.map(cat => {
                const rows = planData.shoppingList?.[cat]
                const list = Array.isArray(rows) ? rows : []
                return (
                  <div key={cat} className={`rounded-2xl border ${T.border} ${T.surface} p-5`}>
                    <p className={`text-[0.7rem] font-semibold uppercase tracking-[2px] ${T.muted} mb-4`}>{cat}</p>
                    {list.length === 0 ? (
                      <p className={`text-sm ${T.muted}`}>—</p>
                    ) : (
                      <ul className="space-y-3">
                        {list.map((row, idx) => (
                          <li key={idx} className="flex gap-3 items-start">
                            <input
                              type="checkbox"
                              checked={!!checked[itemKey(cat, idx)]}
                              onChange={() => toggleCheck(cat, idx)}
                              className="mt-1 rounded border-border2 text-green focus:ring-green"
                            />
                            <div className="flex-1 min-w-0 text-sm">
                              <span className="font-medium">{row.item || row.name}</span>
                              {row.qty && <span className={`${T.muted} block text-xs mt-0.5`}>{row.qty}</span>}
                              {row.price && (
                                <span className={`${T.soft} block text-xs mt-0.5`}>{row.price}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>

            {regenError && (
              <div className="bg-[rgba(224,92,58,0.1)] border border-[rgba(224,92,58,0.3)] text-red rounded-xl px-4 py-3 text-sm mb-4">
                {regenError}
              </div>
            )}

            <button
              type="button"
              disabled={regenLoading}
              onClick={regenerateWithPantry}
              className={`w-full sm:w-auto px-8 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${T.accentBtn}`}
            >
              {regenLoading ? 'Regenerating…' : 'Regenerate with what I have'}
            </button>
            <p className={`${T.muted} text-xs mt-3 max-w-xl`}>
              Counts as one plan generation (meal + shopping are bundled). On Free, you get two new plans per month. Ticked lines are
              ingredients you already have — the new plan favours them; the shopping list is rebuilt from the new meals (not just
              hiding ticks).
            </p>
          </div>
        )}

        {tab === 'prep' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {prepGuide.length === 0 && <p className={T.muted}>No prep guide for this plan.</p>}
            {prepGuide.map((card, i) => (
              <div key={i} className={`rounded-2xl border ${T.border} ${T.surface} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <ClipboardList size={24} strokeWidth={2} className="text-gold shrink-0" aria-hidden />
                  <h3 className="font-syne font-bold text-lg">{card.title || 'Prep'}</h3>
                </div>
                <ol className="space-y-2 text-sm">
                  {(card.steps || []).map((step, si) => (
                    <li key={si} className="flex gap-2">
                      <span className="font-semibold text-green shrink-0 w-5">{si + 1}.</span>
                      <span className={T.text}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {tab === 'wellness' && hasWellness && (
          <div className="space-y-6">
            <p className={`text-xs ${T.muted} max-w-2xl`}>
              Supportive ideas only. Food comes first; supplements are optional. This is not medical advice &mdash; speak to a qualified professional for your situation.
            </p>
            {wellnessSupport.intro && (
              <p className={`text-sm ${T.text} leading-relaxed`}>{wellnessSupport.intro}</p>
            )}
            {Array.isArray(wellnessSupport.foodIdeas) && wellnessSupport.foodIdeas.length > 0 && (
              <div className={`rounded-2xl border ${T.border} ${T.surface} p-6`}>
                <p className={`text-[0.7rem] font-semibold uppercase tracking-[2px] ${T.muted} mb-4`}>Food ideas</p>
                <ul className="space-y-5">
                  {wellnessSupport.foodIdeas.map((block, i) => (
                    <li key={i}>
                      <p className={`font-semibold text-sm mb-2 ${T.soft}`}>
                        {block.label || block.focus || 'Focus'}
                      </p>
                      <ul className={`list-disc pl-5 space-y-1 text-sm ${T.text}`}>
                        {(block.items || []).map((line, j) => (
                          <li key={j}>{line}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(wellnessSupport.supplements) && wellnessSupport.supplements.length > 0 && (
              <div className={`rounded-2xl border ${T.border} ${T.s2} p-6`}>
                <p className={`text-[0.7rem] font-semibold uppercase tracking-[2px] ${T.muted} mb-2`}>Supplements (optional)</p>
                <p className={`text-xs ${T.muted} mb-4`}>Secondary to meals; check interactions and your own health status before starting anything new.</p>
                <ul className="space-y-4">
                  {wellnessSupport.supplements.map((s, i) => (
                    <li key={i} className={`text-sm border-l-2 border-green pl-3 ${T.text}`}>
                      <span className="font-semibold">{s.name}</span>
                      {s.note && <span className={`block mt-1 ${T.muted}`}>{s.note}</span>}
                      {s.caution && <span className={`block text-xs mt-2 ${T.soft}`}>{s.caution}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(wellnessSupport.hydratingDrinks) && wellnessSupport.hydratingDrinks.length > 0 && (
              <div className={`rounded-2xl border ${T.border} ${T.surface} p-6`}>
                <p className={`text-[0.7rem] font-semibold uppercase tracking-[2px] ${T.muted} mb-2`}>Drinks &amp; shots</p>
                <p className={`text-xs ${T.muted} mb-4`}>Low-sugar hydration ideas — extras, not meal replacements.</p>
                <ul className="space-y-3">
                  {wellnessSupport.hydratingDrinks.map((d, i) => (
                    <li key={i} className={`text-sm border-l-2 border-green pl-3 ${T.text}`}>
                      <span className="font-semibold">{d.name}</span>
                      {d.note && <span className={`block mt-1 text-sm ${T.muted}`}>{d.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
