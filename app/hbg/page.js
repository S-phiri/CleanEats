'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import { calcTDEE, COUNTRIES } from '../../lib/utils'
import { parseAssistantJson } from '../../lib/parse-assistant-json'
import { getCreditsExhaustedPayload } from '../../lib/generate-api-errors'
import CreditsExhaustedAlert from '../../components/CreditsExhaustedAlert'
import Glass from '../../components/primitives/Glass'
import Button from '../../components/primitives/Button'
import { authCallbackUrl } from '../../lib/auth-password'

const GOALS = [
  { id: 'losefat', label: 'Lose Fat' },
  { id: 'musclegain', label: 'Build Muscle' },
  { id: 'maintain', label: 'Maintain' },
]

const ACTIVITIES = [
  { id: 'low', label: 'Light' },
  { id: 'mod', label: 'Moderate' },
  { id: 'high', label: 'Active' },
]

function goalCalories(tdee, goal) {
  if (!tdee) return null
  if (goal === 'losefat') return tdee - 400
  if (goal === 'musclegain') return tdee + 400
  if (goal === 'maintain') return tdee
  return tdee - 200
}

function Pill({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[44px] px-4 py-2 rounded-full border text-sm font-medium transition-all ${
        active
          ? 'border-[var(--gold)] text-[var(--gold-soft)] bg-[rgba(201,168,76,0.12)]'
          : 'border-[var(--line)] text-[var(--ink-mute)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
      }`}
      style={{ fontFamily: '"Space Mono", var(--f-mono)' }}
    >
      {children}
    </button>
  )
}

function buildHbgPrompt({ name, sex, weightKg, heightCm, age, activity, goal, tdee, targetCalories }) {
  const cd = COUNTRIES.ZM
  const jsonOnlyPrefix = `CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. No code fences. No text before or after the JSON. Begin your response with { and end with }.

`

  return `${jsonOnlyPrefix}You are an expert sports nutritionist for Her Body Goals Zambia — a fitness competition in Lusaka.

ATHLETE:
- Name: ${name}
- Sex: ${sex}, Age: ${age}, Weight: ${weightKg}kg, Height: ${heightCm}cm
- TDEE: ${tdee} kcal/day
- Goal: ${goal}
- Activity: ${activity}
- Target calories: ${targetCalories} kcal/day

LOCATION: ${cd.name}. Currency: ${cd.currency} (${cd.sym}).
Use Zambian staples: nshima/mealie meal, tilapia, kapenta, chicken, eggs, sweet potato, rape, beans, groundnuts.
Local stores: ${cd.modern}
Include realistic ZMW pricing context in meal descriptions where helpful (e.g. market basket ~${cd.budgetM}).

Generate exactly 3 days. Maximum 4 portions per meal; exact grams and measures only.
Each day: breakfast, lunch, dinner (and snack only if needed for protein/calories).

Return ONLY valid JSON:
{
  "planTitle":"string",
  "planSubtitle":"string",
  "tdee":${tdee},
  "targetCalories":${targetCalories},
  "targetProtein":number,
  "targetCarbs":number,
  "targetFat":number,
  "days":3,
  "mealPlan":[{"day":1,"dayName":"Day 1","totalCalories":number,"meals":[{"type":"Breakfast","name":"string","description":"string","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"string","grams":number,"measure":"string"}]}]}]
}`
}

export default function HbgEventPage() {
  const supabase = createClient()
  const [phase, setPhase] = useState('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creditsExhausted, setCreditsExhausted] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [goal, setGoal] = useState('')
  const [sex, setSex] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [activity, setActivity] = useState('')

  const [planId, setPlanId] = useState(null)
  const [dayOne, setDayOne] = useState(null)
  const [planMeta, setPlanMeta] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.hbgPage = 'true'
    return () => {
      delete document.documentElement.dataset.hbgPage
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCreditsExhausted(false)

    if (!name.trim() || !email.trim() || !password || !goal || !sex || !weightKg || !activity) {
      setError('Please complete all fields.')
      return
    }

    const w = parseFloat(weightKg)
    if (!w || w < 35 || w > 200) {
      setError('Enter a valid weight in kg.')
      return
    }

    setLoading(true)
    setPhase('loading')

    const age = 25
    const heightCm = sex === 'Female' ? 163 : 175
    const tdee = calcTDEE({
      weightKg: w,
      heightCm,
      age,
      sex,
      activity,
      job: 'light',
      dailySteps: 8000,
    })
    const targetCalories = goalCalories(tdee, goal)

    const profileData = {
      name: name.trim(),
      goal,
      sex,
      weightKg: String(w),
      heightCm: String(heightCm),
      age: String(age),
      activity,
      countryCode: 'ZM',
      units: 'metric',
      hbg_event: true,
    }

    try {
      const { data: authData, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: authCallbackUrl('?next=/hbg') || `${window.location.origin}/auth/callback?next=/hbg`,
          data: { full_name: name.trim() },
        },
      })

      if (signErr) throw new Error(signErr.message)

      const userId = authData.user?.id
      if (!userId) throw new Error('Could not create account.')

      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        name: name.trim(),
        tier: 'pro',
        profile_data: profileData,
        updated_at: new Date().toISOString(),
      })

      if (profileErr) throw new Error(profileErr.message)

      if (!authData.session) {
        setPhase('email_confirm')
        setLoading(false)
        return
      }

      const prompt = buildHbgPrompt({
        name: name.trim(),
        sex,
        weightKg: w,
        heightCm,
        age,
        activity,
        goal,
        tdee,
        targetCalories,
      })

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 8000,
        }),
      })
      const genData = await genRes.json()

      const exhausted = getCreditsExhaustedPayload(genRes, genData)
      if (exhausted) {
        setCreditsExhausted(true)
        throw new Error(exhausted.message)
      }
      if (genData.error) throw new Error(genData.message || genData.error)

      const plan = parseAssistantJson(genData)
      if (!plan?.mealPlan?.length) throw new Error('No meal plan returned.')

      const fullPlan = {
        ...plan,
        profile: profileData,
        hbg_event: true,
      }

      const saveRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savePlan: {
            plan_title: plan.planTitle || 'Her Body Goals · 3-Day Plan',
            plan_subtitle: plan.planSubtitle || 'Zambian competition fuel · Lusaka',
            target_calories: plan.targetCalories ?? targetCalories,
            plan_json: fullPlan,
          },
        }),
      })
      const saveData = await saveRes.json()

      if (saveRes.status === 429) {
        throw new Error('Plan generation is still in progress. Wait and refresh.')
      }
      if (saveData.error) throw new Error(saveData.message || saveData.error)

      setPlanId(saveData.planId)
      setDayOne(plan.mealPlan[0])
      setPlanMeta({
        title: plan.planTitle,
        subtitle: plan.planSubtitle,
        targetCalories: plan.targetCalories ?? targetCalories,
        tdee,
      })
      setPhase('success')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong. Try again.')
      setPhase('form')
    } finally {
      setLoading(false)
    }
  }

  const displayFont = { fontFamily: '"Anybody", var(--f-display)' }
  const labelFont = {
    fontFamily: '"Space Mono", var(--f-mono)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  }

  if (phase === 'loading') {
    return (
      <main className="page-layer min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-14 h-14 border-2 rounded-full animate-spin mb-6"
          style={{ borderColor: 'var(--line)', borderTopColor: 'var(--green)' }}
        />
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2" style={displayFont}>
          Building your 3-day plan
        </h1>
        <p className="text-sm text-[var(--ink-mute)]" style={labelFont}>
          Her Body Goals · Lusaka · ZMW basket
        </p>
      </main>
    )
  }

  if (phase === 'email_confirm') {
    return (
      <main className="page-layer min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        <Glass goldEdge className="p-8 w-full">
          <p className="text-[10px] text-[var(--gold-soft)] mb-3" style={labelFont}>
            Confirm email
          </p>
          <h1 className="text-2xl font-bold text-[var(--ink)] mb-3" style={displayFont}>
            Check your inbox
          </h1>
          <p className="text-sm text-[var(--ink-mute)] leading-relaxed">
            We sent a link to <strong className="text-[var(--ink)]">{email}</strong>. After confirming, sign in and return to this page to get your plan.
          </p>
          <Link href="/login" className="btn btn-primary mt-6 inline-flex">
            Sign in
          </Link>
        </Glass>
      </main>
    )
  }

  if (phase === 'success' && dayOne) {
    return (
      <main className="page-layer min-h-screen px-4 sm:px-8 py-8 max-w-2xl mx-auto">
        <header className="mb-6">
          <p className="text-[10px] text-[var(--gold-soft)] mb-2" style={labelFont}>
            Her Body Goals Zambia · CleanEats
          </p>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-[var(--ink)]" style={displayFont}>
            Day 1 fuel plan
          </h1>
          {planMeta?.subtitle && (
            <p className="text-sm text-[var(--ink-mute)] mt-2">{planMeta.subtitle}</p>
          )}
          <p className="text-xs text-[var(--ink-faint)] mt-2 tabular-nums" style={labelFont}>
            {planMeta?.targetCalories ?? '—'} kcal target · TDEE {planMeta?.tdee ?? '—'}
          </p>
        </header>

        <Glass goldEdge className="overflow-hidden mb-6">
          <div className="card-band">
            <h3>{dayOne.dayName || `Day ${dayOne.day}`}</h3>
            <span className="band-meta tabular-nums">{dayOne.totalCalories ?? '—'} kcal</span>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {(dayOne.meals || []).map((meal, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-[10px] text-[var(--gold-soft)] mb-1" style={labelFont}>
                  {meal.type || 'Meal'}
                </p>
                <p className="font-bold text-lg text-[var(--ink)]" style={displayFont}>
                  {meal.name}
                </p>
                {meal.description && (
                  <p className="text-sm text-[var(--ink-mute)] mt-1 leading-snug">{meal.description}</p>
                )}
                <p className="text-xs text-[var(--ink-faint)] mt-2 tabular-nums" style={labelFont}>
                  {meal.calories ?? '—'} kcal · P {meal.protein ?? '—'}g · C {meal.carbs ?? '—'}g · F {meal.fat ?? '—'}g
                </p>
              </div>
            ))}
          </div>
        </Glass>

        <div className="flex flex-col sm:flex-row gap-3">
          {planId && (
            <Button href={`/plan/${planId}`} className="flex-1 justify-center">
              View full plan
            </Button>
          )}
          <Button href="/profile" variant="ghost" className="flex-1 justify-center">
            Build precision plan
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-layer min-h-screen px-4 sm:px-8 py-8 max-w-lg mx-auto">
      <header className="mb-8">
        <p className="text-[10px] text-[var(--gold-soft)] mb-2" style={labelFont}>
          GRIND Ecosystem · Eats
        </p>
        <h1
          className="text-[clamp(2rem,6vw,3rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-[var(--ink)]"
          style={displayFont}
        >
          <span className="text-[var(--gold-soft)]">Her Body</span>
          <br />
          Goals Zambia
        </h1>
        <p className="text-sm text-[var(--ink-mute)] mt-3 leading-relaxed">
          3-day Zambian meal plan — nshima, tilapia, local market pricing. Skip the long wizard; fuel up in under a minute.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Glass className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] text-[var(--ink-mute)] mb-1.5" style={labelFont}>
              Name
            </label>
            <input
              className="ce-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--ink-mute)] mb-1.5" style={labelFont}>
              Email
            </label>
            <input
              type="email"
              className="ce-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--ink-mute)] mb-1.5" style={labelFont}>
              Password
            </label>
            <input
              type="password"
              className="ce-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              required
              disabled={loading}
            />
          </div>
        </Glass>

        <Glass className="p-5 space-y-3">
          <p className="text-[10px] text-[var(--ink-mute)]" style={labelFont}>
            Goal
          </p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <Pill key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)} disabled={loading}>
                {g.label}
              </Pill>
            ))}
          </div>
        </Glass>

        <Glass className="p-5 space-y-3">
          <p className="text-[10px] text-[var(--ink-mute)]" style={labelFont}>
            Sex
          </p>
          <div className="flex flex-wrap gap-2">
            {['Female', 'Male'].map((s) => (
              <Pill key={s} active={sex === s} onClick={() => setSex(s)} disabled={loading}>
                {s}
              </Pill>
            ))}
          </div>
        </Glass>

        <Glass className="p-5">
          <label className="block text-[10px] text-[var(--ink-mute)] mb-1.5" style={labelFont}>
            Weight (kg)
          </label>
          <input
            type="number"
            className="ce-input tabular-nums"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="e.g. 68"
            min={35}
            max={200}
            required
            disabled={loading}
          />
        </Glass>

        <Glass className="p-5 space-y-3">
          <p className="text-[10px] text-[var(--ink-mute)]" style={labelFont}>
            Activity level
          </p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <Pill key={a.id} active={activity === a.id} onClick={() => setActivity(a.id)} disabled={loading}>
                {a.label}
              </Pill>
            ))}
          </div>
        </Glass>

        {error && (
          <p className="text-sm text-[var(--error)] px-1">
            {creditsExhausted ? <CreditsExhaustedAlert message={error} /> : error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          Get my 3-day plan
        </button>

        <p className="text-center text-[10px] text-[var(--ink-faint)]" style={labelFont}>
          Pro access for event · Lusaka · ZMW
        </p>
      </form>
    </main>
  )
}
