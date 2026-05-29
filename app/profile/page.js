'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Nav from '../../Nav'
import PremiumSelect from '../../components/PremiumSelect'
import { useTheme } from '../../components/ThemeProvider'
import { buildPageTokens } from '../../lib/theme-tokens'
import { COUNTRIES, calcTDEE } from '../../lib/utils'
import { inferArchetype } from '../../lib/archetype'
import { buildArchetypePromptBlock, buildWellnessPromptSection } from '../../lib/wellness-prompt'
import {
  buildStyleInstruction,
  buildStaplesRetailBlock,
  buildVarietyCuisineBlock,
  buildMaizePortionHint,
  buildShoppingPromptExtra,
} from '../../lib/prompt-cuisine'
import {
  STEPS,
  GOALS,
  ACTIVITIES,
  LIFESTYLE_TYPE_OPTIONS,
  DIETS,
  FASTINGS,
  ALLERGIES,
  CUISINES,
  STYLES,
  MEALS_PER_DAY,
  COUNTRY_SELECT_OPTIONS,
  SEX_OPTIONS,
  UNITS_OPTIONS,
  JOB_OPTIONS,
  PEOPLE_OPTIONS,
  BUDGET_OPTIONS,
  COOKTIME_OPTIONS,
  MEAL_PREP_OPTIONS,
  WELLNESS_PILLARS,
  EXCLUDE_QUICK_SELECT,
  LOVED_MEALS_QUICK_SELECT,
} from '../../lib/profile-options'
import { buildMealPrepPromptBlock, buildPrepGuideInstructions } from '../../lib/meal-prep-prompt'
import { parseAssistantJson } from '../../lib/parse-assistant-json'
import { getCreditsExhaustedPayload } from '../../lib/generate-api-errors'
import CreditsExhaustedAlert from '../../components/CreditsExhaustedAlert'
import {
  buildGapFillPrompt,
  mergeGapMeals,
  mealsFromPlanJson,
} from '../../lib/meal-cache'

function parseCsv(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean)
}

function joinCsv(arr) {
  return arr.join(', ')
}

function isPresetInCsv(preset, str) {
  return parseCsv(str).some(x => x.toLowerCase() === preset.toLowerCase())
}

function getExtraFromCsv(str, presets) {
  const presetLower = presets.map(p => p.toLowerCase())
  return parseCsv(str).filter(p => !presetLower.includes(p.toLowerCase()))
}

function mergePresetsAndExtra(presets, extraParts) {
  return joinCsv([...presets, ...extraParts.filter(Boolean)])
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [creditsExhausted, setCreditsExhausted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generating, setGenerating] = useState(false)
  const { isDark } = useTheme()

  const [form, setForm] = useState({
    name: '', age: '', sex: '', units: 'metric',
    weightKg: '', heightCm: '', weightLbs: '', heightFt: '', heightIn: '',
    countryCode: 'ZM', job: '', commute: 'none', dailySteps: 6000, people: '1',
    goal: '', activity: '', lifestyleType: '',
    diet: [], fasting: '', allergies: [],
    culinaryStyle: 'mixed', cuisines: [],
    lovedMeals: '', excludeIngredients: '',
    meals: '', budget: 'mid', cooktime: '30', mealPrepPreference: '3day', notes: '',
    wellnessPillars: [],
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      // Load saved profile
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data?.profile_data) {
          const pd = data.profile_data
          setForm(f => ({
            ...f,
            ...pd,
            allergies: (pd.allergies || []).filter(a => a !== 'None'),
          }))
        }
      })
    })
  }, [])

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(fe => {
      if (!fe[k]) return fe
      const next = { ...fe }
      delete next[k]
      return next
    })
  }

  function toggleArr(k, v) {
    setForm(f => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
    }))
  }

  function toggleDiet(d) {
    setForm(f => {
      if (d === 'No Restrictions') {
        return { ...f, diet: f.diet.includes(d) ? [] : ['No Restrictions'] }
      }
      const withoutNone = f.diet.filter(x => x !== 'No Restrictions')
      if (withoutNone.includes(d)) {
        return { ...f, diet: withoutNone.filter(x => x !== d) }
      }
      return { ...f, diet: [...withoutNone, d] }
    })
  }

  function togglePresetInField(field, preset, presets) {
    setForm(f => {
      const parts = parseCsv(f[field])
      const idx = parts.findIndex(x => x.toLowerCase() === preset.toLowerCase())
      if (idx >= 0) {
        return { ...f, [field]: joinCsv(parts.filter((_, i) => i !== idx)) }
      }
      return { ...f, [field]: joinCsv([...parts, preset]) }
    })
  }

  function setExtraInField(field, extra, presets) {
    setForm(f => {
      const selectedPresets = presets.filter(p => isPresetInCsv(p, f[field]))
      return { ...f, [field]: mergePresetsAndExtra(selectedPresets, parseCsv(extra)) }
    })
  }

  function normalizedBody(formState = form) {
    const wkg = formState.units === 'metric'
      ? formState.weightKg
      : formState.weightLbs ? (parseFloat(formState.weightLbs) * 0.453592).toFixed(1) : ''
    const hcm = formState.units === 'metric'
      ? formState.heightCm
      : (formState.heightFt || formState.heightIn)
        ? ((parseFloat(formState.heightFt || 0) * 30.48) + (parseFloat(formState.heightIn || 0) * 2.54)).toFixed(0)
        : ''
    return { wkg, hcm }
  }

  function validateStep1(formState = form) {
    const errors = {}
    if (!formState.name?.trim()) errors.name = 'First name is required'
    if (!formState.age?.toString().trim()) errors.age = 'Age is required'
    if (!formState.sex) errors.sex = 'Please select biological sex'
    if (formState.units === 'metric') {
      if (!formState.weightKg?.toString().trim()) errors.weightKg = 'Weight is required'
      if (!formState.heightCm?.toString().trim()) errors.heightCm = 'Height is required'
    } else {
      if (!formState.weightLbs?.toString().trim()) errors.weightLbs = 'Weight is required'
      if (!formState.heightFt?.toString().trim() && !formState.heightIn?.toString().trim()) {
        errors.heightFt = 'Height is required'
      }
    }
    return errors
  }

  const saveProfileProgress = useCallback(async (formState = form) => {
    if (!user) return
    const { wkg, hcm } = normalizedBody(formState)
    const profileData = { ...formState, weightKg: wkg, heightCm: hcm }
    try {
      const { error: saveErr } = await supabase.from('profiles').upsert({
        id: user.id,
        name: formState.name,
        profile_data: profileData,
        updated_at: new Date().toISOString(),
      })
      if (saveErr) console.error('Profile save failed:', saveErr)
    } catch (e) {
      console.error('Profile save failed:', e)
    }
  }, [user, form, supabase])

  async function handleNext() {
    if (step === 1) {
      const errors = validateStep1()
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }
    }
    setFieldErrors({})
    setError('')
    await saveProfileProgress()
    setStep(s => s + 1)
  }

  const { wkg: previewWkg, hcm: previewHcm } = normalizedBody()
  const previewTdee = useMemo(() => calcTDEE({
    weightKg: previewWkg,
    heightCm: previewHcm,
    age: form.age,
    sex: form.sex,
    activity: form.activity || 'mod',
    job: form.job,
    dailySteps: form.dailySteps,
  }), [previewWkg, previewHcm, form.age, form.sex, form.activity, form.job, form.dailySteps])

  const excludeExtra = joinCsv(getExtraFromCsv(form.excludeIngredients, EXCLUDE_QUICK_SELECT))
  const lovedMealsExtra = joinCsv(getExtraFromCsv(form.lovedMeals, LOVED_MEALS_QUICK_SELECT))

  const cd = COUNTRIES[form.countryCode] || COUNTRIES.other
  const T = buildPageTokens(isDark)

  async function generate() {
    const mealErrors = {}
    if (!form.goal) mealErrors.goal = 'Please select a health goal.'
    if (!form.activity) mealErrors.activity = 'Please select your activity level.'
    if (!form.lifestyleType) mealErrors.lifestyleType = 'Please select how you usually eat.'
    if (!form.meals) mealErrors.meals = 'Please select your meals per day preference.'
    if (Object.keys(mealErrors).length > 0) {
      setFieldErrors(mealErrors)
      return
    }

    setError('')
    setCreditsExhausted(false)
    setFieldErrors({})
    setGenerating(true)

    const { wkg, hcm } = normalizedBody()

    const archetype = inferArchetype({
      age: form.age,
      sex: form.sex,
      goal: form.goal,
      activity: form.activity,
    })
    const profileData = { ...form, weightKg: wkg, heightCm: hcm, archetype }
    const tdee = calcTDEE({ weightKg: wkg, heightCm: hcm, age: form.age, sex: form.sex, activity: form.activity, job: form.job, dailySteps: form.dailySteps })
    const br = form.budget === 'budget' ? cd.budgetL : form.budget === 'mid' ? cd.budgetM : cd.budgetH
    const culinaryStyle = form.culinaryStyle || 'mixed'
    const shoppingExtra = buildShoppingPromptExtra(culinaryStyle, cd)
    const maizeLine = buildMaizePortionHint(culinaryStyle, form.countryCode)

    const archetypeBlock = buildArchetypePromptBlock(archetype)
    const wellnessBlock = buildWellnessPromptSection(form.wellnessPillars)
    const mealPrepBlock = buildMealPrepPromptBlock(form)
    const mealPrepLabel = (MEAL_PREP_OPTIONS.find(o => o.value === (form.mealPrepPreference || '3day')) || MEAL_PREP_OPTIONS[2]).label
    const lifestyleLabel =
      LIFESTYLE_TYPE_OPTIONS.find((o) => o.value === form.lifestyleType)?.label || form.lifestyleType || 'not specified'
    const wellnessJson = `,"planSummary":"string","wellnessSupport":{"intro":"string","foodIdeas":[{"focus":"string","label":"string","items":["string"]}],"supplements":[{"name":"string","note":"string","caution":"string"}],"hydratingDrinks":[{"name":"string","note":"string"}]}`

    const jsonOnlyPrefix = `CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. No code fences. No text before or after the JSON. Begin your response with { and end with }. Any text outside the JSON object will break the application.

`

    const brevityRules = `BREVITY RULES — strictly follow to keep response under token limit:
- planSummary: maximum 15 words
- Each meal description: maximum 8 words
- Each portion visual cue: maximum 3 words
- wellnessSupport.intro: maximum 10 words
- Each wellness foodIdea item: maximum 3 items per focus
- supplements array: maximum 2 items
- hydratingDrinks: maximum 2 items
- mealFrequencyRecommendation: maximum 10 words

`

    const prompt = `${jsonOnlyPrefix}${brevityRules}You are an expert sports nutritionist and precision meal planner.

PROFILE:
- Name: ${form.name||'User'}, Age: ${form.age}, Sex: ${form.sex}
- Weight: ${wkg}kg, Height: ${hcm}cm
- TDEE: ${tdee ? tdee + ' kcal/day' : 'estimate from activity'}
- Country: ${cd.name} | Currency: ${cd.currency}
- Goal: ${form.goal}, Activity: ${form.activity}
- Lifestyle: ${lifestyleLabel}
- Diet: ${form.diet.join(', ')||'None'}, Fasting: ${form.fasting||'None'}
- Allergies: ${form.allergies.join(', ')||'None'}
- Culinary style: ${culinaryStyle}
- Cuisine inspirations: ${form.cuisines.join(', ')||'none'}
- Loved meals: ${form.lovedMeals||'none'}
- NEVER USE: ${form.excludeIngredients||'none'}
- Meals/day: ${form.meals}, Budget: ${form.budget} (~${br})
- Max cook time: ${form.cooktime} min, People: ${form.people}
- Meal prep ahead: ${mealPrepLabel}
- Notes: ${form.notes||'none'}
${archetypeBlock}
CULINARY STYLE: ${buildStyleInstruction(culinaryStyle, cd)}
${buildStaplesRetailBlock(culinaryStyle, cd)}

${buildVarietyCuisineBlock(form.cuisines)}
${mealPrepBlock}
${wellnessBlock}
LIFESTYLE: Tailor every meal to "${lifestyleLabel}" — practical formats, where food is prepared or bought, and timing (e.g. packable lunch, minimal home cooking, helper-friendly recipes, evening-only eating if fasting by day).
Each meal: maximum 4 portions. Each portion: ingredient name, grams, and measure only. Remove visual cue field entirely.
NEVER say "a serving", "some", "a portion", "a lump". Always exact numbers.
${maizeLine ? maizeLine + '\n' : ''}CALORIE TARGETS: fat loss = TDEE-400, lean bulk = TDEE+250, muscle = TDEE+400, recomp = TDEE.
Generate exactly 5 days.

Return ONLY valid JSON, no markdown:
{
  "planTitle":"string","planSubtitle":"string"${wellnessJson},
  "tdee":${tdee||'null'},"targetCalories":number,"targetProtein":number,"targetCarbs":number,"targetFat":number,
  "days":5,"mealFrequencyRecommendation":"string or empty",
  "mealPlan":[{"day":1,"dayName":"Monday","totalCalories":number,"meals":[{"type":"Breakfast","name":"Full name","description":"1 sentence","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"name","grams":150,"measure":"1 cup"}]}]}]
}`

    const prompt2Base = `${jsonOnlyPrefix}Generate shopping list with local ${cd.currency} prices and batch prep guide for a 5-day meal plan in ${cd.name}.
${shoppingExtra}
People: ${form.people}, Budget: ${form.budget} (~${br}), Never include: ${form.excludeIngredients||'none'}
Local stores: ${cd.modern}

${buildPrepGuideInstructions(form)}

Return ONLY valid JSON:
{"weeklyBudgetEstimate":"string","shoppingList":{"Produce":[{"item":"name","qty":"amount","price":"${cd.sym}X"}],"Protein Sources":[],"Dairy & Eggs":[],"Grains & Legumes":[],"Pantry & Oils":[],"Frozen":[],"Snacks & Extras":[]},"prepGuide":[{"title":"title","icon":"emoji","steps":["step"]}]}`

    async function upsertMealsToLibrary(meals) {
      if (!meals?.length) return
      try {
        await fetch('/api/plan/cache-library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meals, profileData, tdee }),
        })
      } catch (e) {
        console.warn('Cache library upsert skipped:', e)
      }
    }

    try {
      // Save profile to Supabase first
      await supabase.from('profiles').upsert({
        id: user.id,
        name: form.name,
        profile_data: profileData,
        updated_at: new Date().toISOString(),
      })

      let plan = null
      let assembly = null

      try {
        const ar = await fetch('/api/plan/assemble', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileData, tdee }),
        })
        if (ar.ok) assembly = await ar.json()
      } catch (e) {
        console.warn('Cache assembly unavailable:', e)
      }

      if (assembly?.fullyCached) {
        plan = {
          ...assembly.planMeta,
          ...assembly.context.daily,
          days: 5,
          mealPlan: assembly.mealPlan,
        }
        console.log('CACHE HIT: full plan from library', assembly.stats)
      } else if (assembly && !assembly.useFullPlan && assembly.misses?.length > 0) {
        const gapPrompt = buildGapFillPrompt(assembly.misses, profileData, assembly.context, cd, {
          style: buildStyleInstruction(culinaryStyle, cd),
          staples: buildStaplesRetailBlock(culinaryStyle, cd),
          variety: buildVarietyCuisineBlock(form.cuisines),
        })
        console.log('CACHE GAP FILL:', assembly.stats)
        const rGap = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: gapPrompt }],
            max_tokens: 3000,
            promptType: 'cache_fill',
            cacheStats: assembly.stats,
          }),
        })
        const dGap = await rGap.json()
        const exhaustedGap = getCreditsExhaustedPayload(rGap, dGap)
        if (exhaustedGap) {
          setCreditsExhausted(true)
          setError(exhaustedGap.message)
          setGenerating(false)
          return
        }
        if (dGap.error) throw new Error(dGap.message || dGap.error)
        const gapPayload = parseAssistantJson(dGap)
        const gapMeals = gapPayload.meals || []
        plan = {
          ...assembly.planMeta,
          ...assembly.context.daily,
          days: 5,
          mealPlan: mergeGapMeals(assembly, gapMeals, assembly.misses),
        }
        await upsertMealsToLibrary(gapMeals)
      } else {
        console.log('PROMPT TOKENS ESTIMATE:', Math.round(prompt.length / 4))
        const r1 = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 8000,
            promptType: 'full_plan',
            cacheStats: assembly?.stats,
          }),
        })
        const d1 = await r1.json()
        const exhausted1 = getCreditsExhaustedPayload(r1, d1)
        if (exhausted1) {
          setCreditsExhausted(true)
          setError(exhausted1.message)
          setGenerating(false)
          return
        }
        if (d1.error) throw new Error(d1.message || d1.error)
        plan = parseAssistantJson(d1)
        console.log('RESPONSE TOKENS ESTIMATE:', Math.round(JSON.stringify(plan).length / 4))
        await upsertMealsToLibrary(mealsFromPlanJson(plan))
      }

      // Call 2 \u2014 shopping + prep
      const mealSummary = plan.mealPlan.map(d =>
        d.meals.map(m => m.name + ': ' + (m.portions || []).map(p => p.grams + 'g ' + p.ingredient).join(', ')).join(' | ')
      ).join('\n')
      const p2 = prompt2Base.replace(
        '5-day meal plan',
        `5-day meal plan using these meals:\n${mealSummary}`
      )

      const r2 = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: p2 }], max_tokens: 3000 }),
      })
      const d2 = await r2.json()
      const exhausted2 = getCreditsExhaustedPayload(r2, d2)
      if (exhausted2) {
        setCreditsExhausted(true)
        setError(exhausted2.message)
        setGenerating(false)
        return
      }
      if (d2.error) throw new Error(d2.message || d2.error)
      const extra = parseAssistantJson(d2)

      const fullPlan = { ...plan, ...extra, profile: profileData }

      const fin = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savePlan: {
            plan_title: plan.planTitle,
            plan_subtitle: plan.planSubtitle,
            target_calories: plan.targetCalories,
            plan_json: fullPlan,
          },
        }),
      })
      const finData = await fin.json()
      if (fin.status === 429) {
        setError('A plan generation is already in progress. Please wait and try again.')
        setGenerating(false)
        return
      }
      const exhaustedFin = getCreditsExhaustedPayload(fin, finData)
      if (exhaustedFin) {
        setCreditsExhausted(true)
        setError(exhaustedFin.message)
        setGenerating(false)
        return
      }
      if (finData.error) throw new Error(finData.message || finData.error)

      router.push(`/plan/${finData.planId}`)
    } catch (e) {
      console.error(e)
      if (e?.message?.includes('CREDITS_EXHAUSTED')) {
        setCreditsExhausted(true)
        setError(e.message)
      } else {
        setError('Something went wrong: ' + e.message)
      }
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div className={`min-h-screen ${T.bg} flex flex-col items-center justify-center text-center px-4`}>
        <div className={`w-16 h-16 border-[3px] rounded-full animate-spin mb-8 ${isDark ? 'border-[var(--line)] border-t-green' : 'border-[#D4C4A8] border-t-[#5C6B3A]'}`}></div>
        <h3 className={`font-syne text-2xl font-bold mb-3 ${T.text}`}>Building your plan...</h3>
        <p className={T.muted}>This takes about 30 seconds. Precision takes a moment.</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${T.bg} ${T.text}`}>
      <Nav user={user} />

      <div className="max-w-[740px] mx-auto px-10 py-14">
        <div className="mb-9">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < step ? 'bg-[#A8C456]' : i === step ? 'bg-[#A8C456] opacity-50' : 'bg-[#2A2E24]'}`} />
            ))}
          </div>
          <h2 className="font-syne text-3xl font-bold">{STEPS[step].t}</h2>
          <p className={`${T.muted} mt-1.5`}>{STEPS[step].d}</p>
        </div>

        {error && (
          <div className="bg-[rgba(224,92,58,0.1)] border border-[rgba(224,92,58,0.3)] text-[#E05C3A] rounded-xl px-4 py-3 text-sm mb-5">
            {creditsExhausted ? <CreditsExhaustedAlert message={error} /> : error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Section T={T} label="Basic Info">
              <div className="grid grid-cols-2 gap-3">
                <Field T={T} label="First Name" error={fieldErrors.name}>
                  <input className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Jordan" />
                </Field>
                <Field T={T} label="Age" error={fieldErrors.age}>
                  <input type="number" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.age} onChange={e=>set('age',e.target.value)} placeholder="28" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Field T={T} label="Biological Sex" error={fieldErrors.sex}>
                  <PremiumSelect T={T} options={SEX_OPTIONS} value={form.sex} onChange={(v) => set('sex', v)} />
                </Field>
                <Field T={T} label="Units">
                  <PremiumSelect T={T} options={UNITS_OPTIONS} value={form.units} onChange={(v) => set('units', v)} />
                </Field>
              </div>
              {form.units === 'metric' ? (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field T={T} label="Weight (kg)" error={fieldErrors.weightKg}>
                    <input type="number" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.weightKg} onChange={e=>set('weightKg',e.target.value)} placeholder="e.g. 78" />
                  </Field>
                  <Field T={T} label="Height (cm)" error={fieldErrors.heightCm}>
                    <input type="number" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.heightCm} onChange={e=>set('heightCm',e.target.value)} placeholder="e.g. 175" />
                  </Field>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Field T={T} label="Weight (lbs)" error={fieldErrors.weightLbs}>
                    <input type="number" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.weightLbs} onChange={e=>set('weightLbs',e.target.value)} placeholder="172" />
                  </Field>
                  <Field T={T} label="Height (ft)" error={fieldErrors.heightFt}>
                    <input type="number" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.heightFt} onChange={e=>set('heightFt',e.target.value)} placeholder="5" />
                  </Field>
                  <Field T={T} label="Height (in)">
                    <input type="number" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${T.input}`} value={form.heightIn} onChange={e=>set('heightIn',e.target.value)} placeholder="9" />
                  </Field>
                </div>
              )}
              <p className={`text-xs ${T.muted} mt-4 leading-relaxed`}>
                We need your stats to calculate your exact calorie target — estimates produce generic plans.
              </p>
            </Section>

            <Section T={T} label="Country & Currency">
              <div className="grid grid-cols-2 gap-3">
                <Field T={T} label="Your Country">
                  <PremiumSelect T={T} options={COUNTRY_SELECT_OPTIONS} value={form.countryCode} onChange={(v) => set('countryCode', v)} />
                </Field>
                <Field T={T} label="Currency">
                  <div className={`px-3 py-2.5 rounded-xl border text-sm ${T.input} opacity-70`}>{cd.label}</div>
                </Field>
              </div>
              <div className={`mt-3 rounded-xl px-4 py-3 text-xs leading-relaxed ${isDark ? 'bg-[rgba(168,196,86,0.06)] border border-[rgba(168,196,86,0.14)]' : 'bg-[rgba(92,107,58,0.06)] border border-[rgba(92,107,58,0.2)]'} ${T.soft}`}>
                Localised for <strong className={T.text}>{cd.name}</strong>. Your plan uses locally available ingredients with prices in {cd.currency}.
              </div>
            </Section>

            <Section T={T} label="Daily Life">
              <Field T={T} label="Job Type">
                <PremiumSelect T={T} options={JOB_OPTIONS} value={form.job} onChange={(v) => set('job', v)} />
              </Field>
              <div className="mt-3">
                <label className={`block text-xs font-medium ${T.soft} mb-2`}>Daily Steps: <span className="text-[#A8C456] font-bold">{parseInt(form.dailySteps).toLocaleString()}</span></label>
                <input type="range" min="0" max="25000" step="500" value={form.dailySteps} onChange={e=>set('dailySteps',e.target.value)}
                  className="w-full h-1 bg-[#2A2E24] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A8C456]" />
              </div>
              <Field T={T} label="Prepping for" cls="mt-3">
                <PremiumSelect T={T} options={PEOPLE_OPTIONS} value={form.people} onChange={(v) => set('people', v)} />
              </Field>
            </Section>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Section T={T} label="Health Goal">
              <div className="flex flex-wrap gap-2">
                {GOALS.map(g => (
                  <button key={g.id} onClick={()=>set('goal',g.id)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.goal===g.id ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    {g.label}
                  </button>
                ))}
              </div>
              <p className={`text-xs ${T.muted} mt-3 leading-relaxed`}>
                This sets your calorie target — fat loss = deficit, lean bulk = surplus, recomp = maintenance.
              </p>
              {fieldErrors.goal && <p className="text-[#E05C3A] text-xs mt-2">{fieldErrors.goal}</p>}
            </Section>
            <Section T={T} label={'Exercise activity \u2014 separate from your job'}>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map(a => (
                  <button key={a.id} onClick={()=>set('activity',a.id)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.activity===a.id ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
              {fieldErrors.activity && <p className="text-[#E05C3A] text-xs mt-2">{fieldErrors.activity}</p>}
            </Section>
            <Section T={T} label="How do you usually eat?">
              <PremiumSelect
                T={T}
                options={[{ value: '', label: 'Select\u2026' }, ...LIFESTYLE_TYPE_OPTIONS]}
                value={form.lifestyleType}
                onChange={(v) => set('lifestyleType', v)}
              />
              <p className={`text-xs ${T.muted} mt-3 leading-relaxed`}>
                Your plan will match where and how you actually get meals — home cooking, eating out, meal prep, and more.
              </p>
              {fieldErrors.lifestyleType && <p className="text-[#E05C3A] text-xs mt-2">{fieldErrors.lifestyleType}</p>}
            </Section>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Section T={T} label={'Dietary style \u2014 select all that apply'}>
              <div className="flex flex-wrap gap-2">
                {DIETS.map(d => (
                  <button key={d} onClick={()=>toggleDiet(d)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.diet.includes(d) ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </Section>
            <Section T={T} label="Fasting Protocol">
              <div className="flex flex-wrap gap-2">
                {FASTINGS.map(f => (
                  <button key={f} onClick={()=>set('fasting',f)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.fasting===f ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </Section>
            <Section T={T} label="Allergies & Intolerances">
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map(a => (
                  <button key={a} onClick={()=>toggleArr('allergies',a)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.allergies.includes(a) ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    {a}
                  </button>
                ))}
              </div>
              {form.allergies.length === 0 && (
                <p className={`text-xs ${T.muted} mt-2`}>No allergies selected — we&apos;ll assume none.</p>
              )}
            </Section>
            <Section T={T} label="Ingredients I never eat">
              <div className="grid grid-cols-4 gap-2">
                {EXCLUDE_QUICK_SELECT.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => togglePresetInField('excludeIngredients', item, EXCLUDE_QUICK_SELECT)}
                    className={`rounded-xl border p-2.5 text-center transition-all text-xs font-medium ${isPresetInCsv(item, form.excludeIngredients) ? T.chipOn : T.chip + ' hover:border-[#7A9A32]'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <Field T={T} label="Anything else not listed above" cls="mt-3">
                <textarea
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${T.input}`}
                  rows={2}
                  value={excludeExtra}
                  onChange={e => setExtraInField('excludeIngredients', e.target.value, EXCLUDE_QUICK_SELECT)}
                  placeholder="Anything else not listed above..."
                />
              </Field>
            </Section>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className={`text-xs ${T.muted} leading-relaxed`}>
              Your country sets currency and where we shop. Culinary style is the main dial for how local vs international your meals feel; cuisine tags add flavor variety on top.
            </p>
            <Section T={T} label="Culinary Experience">
              <div className="grid grid-cols-3 gap-3">
                {STYLES.map(s => (
                  <button key={s.id} onClick={()=>set('culinaryStyle',s.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${form.culinaryStyle===s.id ? (isDark?'bg-[rgba(168,196,86,0.08)] border-[#A8C456]':'bg-[rgba(92,107,58,0.08)] border-[#5C6B3A]') : (isDark?'bg-[#1E211A] border-[#363C2E] hover:border-[#7A9A32]':'bg-[#F5F0E8] border-[#D4C4A8] hover:border-[#5C6B3A]')}`}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="font-semibold text-sm mb-1">{s.name}</div>
                    <div className={`text-xs leading-relaxed ${T.muted}`}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </Section>
            <Section T={T} label={'Cuisine inspirations \u2014 optional'}>
              <p className={`text-xs ${T.muted} mb-3 leading-relaxed`}>
                We weight these toward meal ideas while keeping ingredients realistic for where you live. Traditional or Mixed leans on local staples too; Modern / International favors global supermarket-style meals. Pick several tags for more variety across the week.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {CUISINES.map(c => (
                  <button key={c.id} onClick={()=>toggleArr('cuisines',c.id)}
                    className={`rounded-xl border p-2.5 text-center transition-all text-xs font-medium ${form.cuisines.includes(c.id) ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    <span className="text-xl block mb-1">{c.icon}</span>{c.id}
                  </button>
                ))}
              </div>
            </Section>
            <Section T={T} label={'Meals you love \u2014 optional'}>
              <div className="grid grid-cols-4 gap-2">
                {LOVED_MEALS_QUICK_SELECT.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => togglePresetInField('lovedMeals', item, LOVED_MEALS_QUICK_SELECT)}
                    className={`rounded-xl border p-2.5 text-center transition-all text-xs font-medium ${isPresetInCsv(item, form.lovedMeals) ? T.chipOn : T.chip + ' hover:border-[#7A9A32]'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <Field T={T} label="Other favourites" cls="mt-3">
                <textarea
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${T.input}`}
                  rows={2}
                  value={lovedMealsExtra}
                  onChange={e => setExtraInField('lovedMeals', e.target.value, LOVED_MEALS_QUICK_SELECT)}
                  placeholder="Anything else not listed above..."
                />
              </Field>
            </Section>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="flex flex-col gap-4">
            <Section T={T} label="Meals Per Day">
              <div className="flex flex-wrap gap-2">
                {MEALS_PER_DAY.map(m => (
                  <button key={m} onClick={()=>set('meals',m)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.meals===m ? T.chipOn : T.chip+' hover:border-[#7A9A32]'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {fieldErrors.meals && <p className="text-[#E05C3A] text-xs mt-2">{fieldErrors.meals}</p>}
              <p className={`text-xs ${T.muted} mt-3`}>If a different frequency suits your goal better, we&apos;ll explain why on your plan.</p>
            </Section>
            <Section T={T} label="Budget & Cooking">
              <div className="grid grid-cols-2 gap-3">
                <Field T={T} label="Budget Level">
                  <PremiumSelect T={T} options={BUDGET_OPTIONS} value={form.budget} onChange={(v) => set('budget', v)} />
                </Field>
                <Field T={T} label="Max Cook Time">
                  <PremiumSelect T={T} options={COOKTIME_OPTIONS} value={form.cooktime} onChange={(v) => set('cooktime', v)} />
                </Field>
              </div>
              <Field T={T} label="Meal prep ahead" cls="mt-4">
                <PremiumSelect T={T} options={MEAL_PREP_OPTIONS} value={form.mealPrepPreference || '3day'} onChange={(v) => set('mealPrepPreference', v)} />
                <p className={`text-xs ${T.muted} mt-2 leading-relaxed`}>
                  We align batch cooks, overnight oats, and fridge life with how far ahead you like to prep.
                </p>
              </Field>
            </Section>
            <Section T={T} label={'Anything else? \u2014 optional'}>
              <textarea className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${T.input}`} rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Health conditions, preferences, context..." />
            </Section>
            <Section T={T} label={'Wellness focus \u2014 optional (secondary)'}>
              <p className={`text-xs ${T.muted} mb-4 leading-relaxed`}>
                We still build your plan from your stats and goal first. If you pick areas below, we add supportive food ideas and optional supplement notes &mdash; not medical advice.
              </p>
              <div className="flex flex-wrap gap-2">
                {WELLNESS_PILLARS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleArr('wellnessPillars', p.id)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${form.wellnessPillars.includes(p.id) ? T.chipOn : T.chip + ' hover:border-[#7A9A32]'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Section>

            <Section T={T} label="Plan summary">
              <p className={`text-xs ${T.muted} mb-4 leading-relaxed`}>
                Your plan will be built around these — edit above if anything looks wrong.
              </p>
              {(fieldErrors.goal || fieldErrors.activity) && (
                <div className="mb-4 space-y-1">
                  {fieldErrors.goal && <p className="text-[#E05C3A] text-xs">{fieldErrors.goal} Go back to Step 2 to fix.</p>}
                  {fieldErrors.activity && <p className="text-[#E05C3A] text-xs">{fieldErrors.activity} Go back to Step 2 to fix.</p>}
                </div>
              )}
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className={T.muted}>Name</dt>
                  <dd className={`${T.text} font-medium text-right`}>{form.name || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={T.muted}>Goal</dt>
                  <dd className={`${T.text} font-medium text-right`}>{GOALS.find(g => g.id === form.goal)?.label || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={T.muted}>TDEE estimate</dt>
                  <dd className={`${T.text} font-medium text-right`}>{previewTdee ? `${previewTdee} kcal/day` : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={T.muted}>Diet restrictions</dt>
                  <dd className={`${T.text} font-medium text-right`}>{form.diet.length ? form.diet.join(', ') : 'None'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={T.muted}>Excluded ingredients</dt>
                  <dd className={`${T.text} font-medium text-right max-w-[60%]`}>{form.excludeIngredients?.trim() || 'None'}</dd>
                </div>
              </dl>
            </Section>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={()=>setStep(s=>s-1)}
              className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-all ${T.chip} hover:border-[#7A9A32]`}>
              ← Back
            </button>
          ) : <span />}
          {step < 5 ? (
            <button onClick={handleNext}
              className="px-8 py-2.5 rounded-full bg-[#A8C456] text-[#0E0F0C] font-semibold text-sm hover:bg-[#BED465] transition-all">
              Next →
            </button>
          ) : (
            <button onClick={generate}
              className="px-8 py-2.5 rounded-full bg-[#A8C456] text-[#0E0F0C] font-semibold text-sm hover:bg-[#BED465] transition-all">
              Generate my plan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ T, label, children }) {
  return (
    <div className={`${T.surface} border ${T.border} rounded-2xl p-6 overflow-visible`}>
      <p className={`text-[0.7rem] font-semibold uppercase tracking-[2px] ${T.muted} mb-4`}>{label}</p>
      {children}
    </div>
  )
}

function Field({ T, label, children, cls = '', error }) {
  return (
    <div className={cls}>
      <label className={`block text-xs font-medium ${T.soft} mb-1.5`}>{label}</label>
      {children}
      {error && <p className="text-[#E05C3A] text-xs mt-1">{error}</p>}
    </div>
  )
}
