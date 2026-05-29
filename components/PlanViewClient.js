'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Nav from '../Nav'
import { ClipboardList } from 'lucide-react'
import { buildPlanViewTokens } from '../lib/theme-tokens'
import DayChips from './plan/DayChips'
import SlotList from './plan/SlotList'
import RecipePanel from './plan/RecipePanel'
import { COUNTRIES } from '../lib/utils'
import { parseAssistantJson } from '../lib/parse-assistant-json'
import { getLocalSwaps } from '../lib/ingredient-swaps'
import { getCreditsExhaustedPayload } from '../lib/generate-api-errors'
import CreditsExhaustedAlert from './CreditsExhaustedAlert'
import { applyPlanDayLabels, buildLocationLabel, formatPlanDayLabel } from '../lib/plan-dates'

function normaliseForm(planData) {
  return planData.profile && typeof planData.profile === 'object' ? planData.profile : {}
}

export default function PlanViewClient({
  user,
  tier,
  planId,
  planTitle,
  planSubtitle,
  planData: initialPlanData,
  embedded = false,
  locationLabel: locationLabelProp = '',
}) {
  const [tab, setTab] = useState('meals')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [selectedMealIndex, setSelectedMealIndex] = useState(0)
  const [panelTab, setPanelTab] = useState('ingredients')
  const [openDays, setOpenDays] = useState(() => new Set([0]))
  const [regenError, setRegenError] = useState('')
  const [regenCreditsExhausted, setRegenCreditsExhausted] = useState(false)
  const [livePlanData, setLivePlanData] = useState(initialPlanData || {})
  const [swappingPortionIndex, setSwappingPortionIndex] = useState(null)
  const [swapMealLoading, setSwapMealLoading] = useState(false)
  const [swapPicker, setSwapPicker] = useState(null)
  const [customSwapInput, setCustomSwapInput] = useState('')

  useEffect(() => {
    setLivePlanData(initialPlanData || {})
  }, [initialPlanData])

  const planData = livePlanData

  const locationLabel = useMemo(() => {
    if (locationLabelProp) return locationLabelProp
    return buildLocationLabel(normaliseForm(planData))
  }, [locationLabelProp, planData])

  const mealPlanRaw = Array.isArray(planData.mealPlan) ? planData.mealPlan : []
  const mealPlan = useMemo(
    () => applyPlanDayLabels(mealPlanRaw, locationLabel),
    [mealPlanRaw, locationLabel]
  )

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
    if (tab === 'wellness' && !hasWellness) setTab('meals')
    if (tab === 'shop') setTab('meals')
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

    const substituteBlock = userSubstitute
      ? `User substitute to confirm: ${userSubstitute}
Validate it works as a macro-equivalent replacement for ${portion.ingredient} (${portion.grams != null ? portion.grams + 'g' : '—'}).`
      : `Ingredient to replace: ${portion.ingredient} (${portion.grams != null ? portion.grams + 'g' : '—'})
Suggest ONE replacement available in local supermarkets.`

    const form = normaliseForm(planData)
    const cd = COUNTRIES[form.countryCode] || COUNTRIES.other
    const locationForPrompt = buildLocationLabel(form)

    const prompt = `INGREDIENT SWAP

Parent meal: ${meal.name}
${substituteBlock}
Meal macros: ${meal.calories ?? '—'} kcal, protein ${meal.protein ?? '—'}g, carbs ${meal.carbs ?? '—'}g, fat ${meal.fat ?? '—'}g
${locationForPrompt ? `Location: ${locationForPrompt}.` : ''} Country: ${cd.name}. Local stores: ${cd.modern}
Diet: ${(form.diet || []).join(', ') || 'None'}
Allergies: ${(form.allergies || []).join(', ') || 'None'}
Never use: ${form.excludeIngredients || 'none'}

CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. Begin with { and end with }.
{"ingredient":"string","grams":number,"measure":"string"}`

    setSwappingPortionIndex(portionIndex)
    setRegenError('')
    setRegenCreditsExhausted(false)
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 500 }),
      })
      const d = await r.json()
      if (applyCreditsExhausted(r, d)) return
      if (d.error) throw new Error(d.message || d.error)
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
    const locationForPrompt = buildLocationLabel(form)
    const dayNum = day?.day ?? selectedDayIndex + 1
    const dayLabel = formatPlanDayLabel(selectedDayIndex, locationForPrompt)
    const prompt = `MEAL SWAP

Current meal to replace: ${meal.name}
Day: ${dayNum} (${dayLabel})
Meal type: ${meal.type || 'Meal'}
Current calories: ${meal.calories ?? '—'} kcal (keep similar within ~15%)
User goal: ${form.goal || 'maintain'}
${locationForPrompt ? `Location: ${locationForPrompt}.` : ''} Country: ${cd.name}. Local stores: ${cd.modern}
Diet: ${(form.diet || []).join(', ') || 'None'}
Allergies: ${(form.allergies || []).join(', ') || 'None'}
Never use: ${form.excludeIngredients || 'none'}

Return ONE alternative meal with the same meal type, similar calories, using local ingredients${locationForPrompt ? ` available in ${locationForPrompt}` : ` for ${cd.name}`}.

CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. Begin with { and end with }.
{"type":"string","name":"string","description":"string","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"string","grams":number,"measure":"string"}]}`

    setSwapMealLoading(true)
    setRegenError('')
    setRegenCreditsExhausted(false)
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 2000 }),
      })
      const d = await r.json()
      if (applyCreditsExhausted(r, d)) return
      if (d.error) throw new Error(d.message || d.error)
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

  function applyCreditsExhausted(response, data) {
    const payload = getCreditsExhaustedPayload(response, data)
    if (!payload) return false
    setRegenCreditsExhausted(true)
    setRegenError(payload.message)
    return true
  }

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
    { id: 'prep', label: 'Prep Guide' },
    ...(hasWellness ? [{ id: 'wellness', label: 'Wellness' }] : []),
  ]

  const selectedDay = mealPlan[selectedDayIndex]
  const selectedMeals = selectedDay?.meals || []
  const selectedMeal = selectedMeals[selectedMealIndex]

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

        {regenError && (
          <div className="bg-[rgba(224,92,58,0.1)] border border-[rgba(224,92,58,0.3)] text-red rounded-xl px-4 py-3 text-sm mb-4">
            {regenCreditsExhausted ? <CreditsExhaustedAlert message={regenError} /> : regenError}
          </div>
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
                  locationLabel={locationLabel}
                  onSelect={(i) => {
                    setSelectedDayIndex(i)
                    setSelectedMealIndex(0)
                  }}
                />
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,38%)_minmax(0,1fr)] gap-5 lg:gap-6 mt-6">
                  <div className="min-w-0 lg:max-w-[420px]">
                    <SlotList
                      meals={selectedMeals}
                      selectedIndex={selectedMealIndex}
                      onSelect={setSelectedMealIndex}
                    />
                  </div>
                  <div className="min-w-0">
                    <RecipePanel
                      meal={selectedMeal}
                      dayMeals={selectedMeals}
                      panelTab={panelTab}
                      onPanelTab={setPanelTab}
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
