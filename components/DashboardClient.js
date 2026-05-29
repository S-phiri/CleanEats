'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import CountUpInteger from './CountUpInteger'
import Button from './primitives/Button'
import Glass from './primitives/Glass'
import CardBand from './primitives/CardBand'
import PerformanceMetrics from './dashboard/PerformanceMetrics'
import MarketPriceIndex from './dashboard/MarketPriceIndex'
import DashboardToday from './dashboard/DashboardToday'
import PlanViewClient from './PlanViewClient'
import MobileBottomNav from './layout/MobileBottomNav'
import { createClient } from '../lib/supabase/client'
import { parseAssistantJson } from '../lib/parse-assistant-json'
import { getCreditsExhaustedPayload } from '../lib/generate-api-errors'
import CreditsExhaustedAlert from './CreditsExhaustedAlert'
import { FREE_CREDIT_CAP, creditsRemainingForProfile } from '../lib/credits'
import { sanitiseMealInput } from '../lib/sanitise'
import {
  buildLocationLabel,
  formatPlanDayLabel,
  formatTodayEyebrow,
} from '../lib/plan-dates'

const MAIN_TABS = [
  { id: 'today', label: 'Today' },
  { id: 'plan', label: 'My Plan' },
  { id: 'performance', label: 'Performance' },
]

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

const LOG_MEAL_PILLS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
]

const TRAINING_THEMES = ['BUILD - VOLUME', 'THRESHOLD', 'RECOVERY', 'DELOAD', 'PEAK', 'REST', 'ACTIVE']

const TIER_BADGE_CLASS =
  'hidden sm:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border border-[var(--line)]'

function findNavTierBadgeEl() {
  const navActions = document.querySelector('header nav > div:last-child')
  if (!navActions) return null
  return navActions.querySelector('span.hidden.sm\\:inline.font-mono')
}

function NavTierCredits({ tier, creditsRemaining }) {
  const isPro = tier === 'pro' || tier === 'coach'

  if (isPro) {
    return <span className={TIER_BADGE_CLASS}>PRO</span>
  }

  if (creditsRemaining === null) {
    return (
      <span className={TIER_BADGE_CLASS}>
        <span className="text-ink-mute">FREE</span>
      </span>
    )
  }

  const remaining = creditsRemaining

  if (remaining === 0) {
    return (
      <span className={TIER_BADGE_CLASS}>
        <span className="text-ink-mute">FREE</span>
        <Link href="/upgrade" className="normal-case tracking-normal hover:underline" style={{ color: '#7CB518' }}>
          Upgrade
        </Link>
      </span>
    )
  }

  const warn = remaining <= 2
  const creditLabel = `${remaining} ${remaining === 1 ? 'credit' : 'credits'} left`

  return (
    <span className={TIER_BADGE_CLASS}>
      <span className="text-ink-mute">FREE</span>
      <span
        className={warn ? '' : 'text-ink-mute'}
        style={warn ? { color: '#C9A84C' } : undefined}
      >
        {creditLabel}
      </span>
    </span>
  )
}

function mealSortIndex(type) {
  const t = (type || '').toLowerCase()
  const i = MEAL_ORDER.findIndex((slot) => t.includes(slot))
  return i === -1 ? 99 : i
}

function sortTodayMeals(meals) {
  return [...meals].sort((a, b) => mealSortIndex(a.type) - mealSortIndex(b.type))
}

function trainingThemeForDayIndex(dayIndex) {
  return TRAINING_THEMES[((dayIndex ?? 0) % TRAINING_THEMES.length + TRAINING_THEMES.length) % TRAINING_THEMES.length]
}

function mealSlotId(type) {
  const t = (type || '').toLowerCase()
  return MEAL_ORDER.find((slot) => t.includes(slot)) || null
}

function indexOfMealSlot(sortedMeals, slotId) {
  const idx = sortedMeals.findIndex((m) => mealSlotId(m.type) === slotId)
  if (idx !== -1) return idx
  const orderIdx = MEAL_ORDER.indexOf(slotId)
  if (orderIdx === -1) return -1
  return sortedMeals.findIndex((m) => mealSortIndex(m.type) === orderIdx)
}

function formatRemainingMeals(meals) {
  return meals
    .map((m) => `- ${m.type || 'Meal'}: ${m.name} (${m.calories ?? '—'} kcal, ${m.protein ?? '—'}g protein)`)
    .join('\n')
}

function mergeReplacementMeal(existing, alt) {
  return {
    ...existing,
    type: alt.type || existing.type,
    name: alt.name,
    description: alt.description ?? existing.description,
    calories: alt.calories ?? existing.calories,
    protein: alt.protein ?? existing.protein,
    carbs: alt.carbs ?? existing.carbs,
    fat: alt.fat ?? existing.fat,
    portions: alt.portions ?? existing.portions,
  }
}

function BuildPlanCTA() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-ink-mute text-sm mb-6 max-w-sm">
        Set up your profile and we&apos;ll build a week of meals around your goal and budget.
      </p>
      <Button href="/profile">Build your first plan</Button>
    </div>
  )
}

export default function DashboardClient({
  user,
  displayName,
  plans,
  tier,
  hasProfile,
  initialCreditsRemaining = null,
  latestPlan,
  location: locationProp = '',
  profileData,
}) {
  const [mainTab, setMainTab] = useState('today')
  const [liveTodayMeals, setLiveTodayMeals] = useState([])
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [logModalStep, setLogModalStep] = useState(1)
  const [logSelectedMeal, setLogSelectedMeal] = useState(null)
  const [logDescription, setLogDescription] = useState('')
  const [logLoading, setLogLoading] = useState(false)
  const [logError, setLogError] = useState(null)
  const [logCreditsExhausted, setLogCreditsExhausted] = useState(false)
  const [toast, setToast] = useState(null)
  const [coachNote, setCoachNote] = useState(null)
  const [loggedMealSlots, setLoggedMealSlots] = useState(() => new Set())
  const [navTierHost, setNavTierHost] = useState(null)
  const [creditsRemaining, setCreditsRemaining] = useState(initialCreditsRemaining)

  const refreshCredits = useCallback(async () => {
    try {
      const creditsRes = await fetch('/api/credits', { cache: 'no-store' })
      if (creditsRes.ok) {
        const data = await creditsRes.json()
        if (data.tier === 'pro' || data.tier === 'coach') {
          setCreditsRemaining(null)
          return
        }
        if (typeof data.credits_remaining === 'number') {
          setCreditsRemaining(data.credits_remaining)
          return
        }
      }
    } catch {
      /* use Supabase below */
    }

    if (!user?.id) return
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier, credits_used, last_reset_date')
      .eq('id', user.id)
      .single()

    setCreditsRemaining(creditsRemainingForProfile(profile))
  }, [user?.id])

  const planJson = useMemo(() => {
    const raw = latestPlan?.plan_json
    if (!raw) return null
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }
    return raw
  }, [latestPlan])

  const planMetrics = useMemo(() => {
    if (!planJson) return null
    return {
      ...planJson,
      targetCalories: planJson.targetCalories ?? latestPlan?.target_calories ?? null,
    }
  }, [planJson, latestPlan])

  const mealPlan = planJson?.mealPlan || []
  const todayMeals = mealPlan[0]?.meals || []
  const hasPlan = !!planJson && mealPlan.length > 0
  const currency = profileData?.countryCode === 'ke' ? 'KES' : profileData?.countryCode === 'za' ? 'ZAR' : 'ZMW'
  const location = buildLocationLabel(profileData) || locationProp || ''
  const dateMeta = formatTodayEyebrow(location)
  const firstName = (displayName || 'Athlete').split(' ')[0]
  const creditsUsed =
    tier === 'free' && creditsRemaining !== null
      ? FREE_CREDIT_CAP - creditsRemaining
      : 0
  const creditsUsagePct =
    tier === 'free' ? Math.min((creditsUsed / FREE_CREDIT_CAP) * 100, 100) : 100
  const creditsExhausted = tier === 'free' && creditsRemaining === 0
  const planMeta = latestPlan ? formatPlanDayLabel(0, location) : 'No plan'

  useEffect(() => {
    setLiveTodayMeals(sortTodayMeals(todayMeals))
  }, [latestPlan?.id, planJson])

  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  useEffect(() => {
    const tierSpan = findNavTierBadgeEl()
    if (!tierSpan || tierSpan.dataset.creditsMounted === '1') return
    const slot = document.createElement('span')
    slot.dataset.creditsMounted = '1'
    tierSpan.replaceWith(slot)
    setNavTierHost(slot)
  }, [])

  const showToast = useCallback((message) => {
    setToast(message)
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [])

  function closeLogModal() {
    setLogModalOpen(false)
    setLogModalStep(1)
    setLogSelectedMeal(null)
    setLogDescription('')
    setLogError(null)
    setLogCreditsExhausted(false)
  }

  function openLogModal() {
    setLogModalStep(1)
    setLogSelectedMeal(null)
    setLogDescription('')
    setLogError(null)
    setLogCreditsExhausted(false)
    setLogModalOpen(true)
  }

  async function submitLogWhatIAte() {
    const description = logDescription.trim()
    if (!description || !user?.id || !logSelectedMeal) return

    const sorted = sortTodayMeals(liveTodayMeals)
    if (sorted.length === 0) {
      setLogError('No meals on today’s plan to adjust.')
      return
    }

    const selectedIndex = indexOfMealSlot(sorted, logSelectedMeal)
    if (selectedIndex === -1) {
      setLogError(`No ${logSelectedMeal} meal found on today’s plan.`)
      return
    }

    const loggedSlotMeal = sorted[selectedIndex]
    const remainingMeals = sorted.slice(selectedIndex + 1)
    const dailyCalorieTarget = planMetrics?.targetCalories ?? latestPlan?.target_calories ?? null
    const dailyProteinTarget = planMetrics?.targetProtein ?? null
    const userGoal = profileData?.goal || 'maintain'
    const todayTrainingTheme = trainingThemeForDayIndex(0)
    const tomorrowTrainingTheme = mealPlan[1] ? trainingThemeForDayIndex(1) : null
    const selectedMealLabel = LOG_MEAL_PILLS.find((p) => p.id === logSelectedMeal)?.label || logSelectedMeal

    const prompt = `LOG DEVIATION

User name: ${firstName}
selectedMeal: ${logSelectedMeal}
description: ${description}

Planned meal for this slot (compare deviation against this):
- ${loggedSlotMeal.type || selectedMealLabel}: ${loggedSlotMeal.name} (${loggedSlotMeal.calories ?? '—'} kcal, ${loggedSlotMeal.protein ?? '—'}g protein)

remainingMeals (adjust all of these for the rest of today):
${remainingMeals.length ? formatRemainingMeals(remainingMeals) : '(none — only re-balance if needed)'}

dailyCalorieTarget: ${dailyCalorieTarget ?? '—'} kcal
dailyProteinTarget: ${dailyProteinTarget ?? '—'} g
todayTrainingTheme: ${todayTrainingTheme}
tomorrowTrainingTheme: ${tomorrowTrainingTheme ?? 'not available'}
userGoal: ${userGoal}
city: ${location}

Instructions:
1. Estimate macros of what the user described in description.
2. Compare to the target for the selected meal slot above.
3. Consider training context — if tomorrow is heavy training (${tomorrowTrainingTheme || 'unknown'}), be more lenient on the deviation.
4. Return adjusted versions of every meal in remainingMeals (same meal types, local ingredients for ${location}).
5. Return coachNote: 1-2 sentences explaining the adjustment, addressing the user by name (${firstName}).

CRITICAL INSTRUCTION: Return ONLY raw valid JSON. No markdown. Begin with { and end with }.
{"adjustedMeals":[{"type":"string","name":"string","description":"string","calories":number,"protein":number,"carbs":number,"fat":number,"portions":[{"ingredient":"string","grams":number,"measure":"string"}]}],"coachNote":"string"}`

    setLogLoading(true)
    setLogError(null)

    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedMeal: logSelectedMeal,
          description,
          remainingMeals,
          dailyCalorieTarget,
          dailyProteinTarget,
          todayTrainingTheme,
          tomorrowTrainingTheme,
          userGoal,
          city: location,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
        }),
      })
      const d = await r.json()

      const exhausted = getCreditsExhaustedPayload(r, d)
      if (exhausted) {
        setLogCreditsExhausted(true)
        setLogError(exhausted.message)
        return
      }
      if (r.status === 429 && d.error === 'GENERATION_IN_PROGRESS') {
        setLogError('A full plan is still generating. Wait a moment and try again.')
        return
      }
      if (d.error) throw new Error(d.message || d.error)

      if (typeof d.credits_remaining === 'number') {
        setCreditsRemaining(d.credits_remaining)
      } else {
        refreshCredits()
      }

      const result = parseAssistantJson(d)
      const adjustedMeals = result?.adjustedMeals
      const note = result?.coachNote?.trim()

      if (!note) throw new Error('No coach note returned')

      if (remainingMeals.length > 0) {
        if (!Array.isArray(adjustedMeals) || adjustedMeals.length === 0) {
          throw new Error('No adjusted meals returned')
        }
        const updatedSorted = [...sorted.slice(0, selectedIndex + 1)]
        remainingMeals.forEach((existing, i) => {
          const alt = adjustedMeals[i]
          if (alt) {
            updatedSorted.push(mergeReplacementMeal(existing, alt))
          } else {
            updatedSorted.push(existing)
          }
        })
        setLiveTodayMeals(updatedSorted)
      }

      const supabase = createClient()
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr || !sessionData?.session?.user?.id) {
        console.error('meal_logs insert: no auth session', sessionErr)
        setLogError('Your session expired. Sign in again and retry logging.')
        return
      }

      const mealTypeForLog = mealSlotId(loggedSlotMeal.type) || logSelectedMeal
      const logRow = {
        user_id: sessionData.session.user.id,
        ...sanitiseMealInput({
          meal_type: mealTypeForLog,
          meal_name: loggedSlotMeal.name || selectedMealLabel,
          calories: loggedSlotMeal.calories ?? null,
          protein_g: loggedSlotMeal.protein ?? null,
          carbs_g: loggedSlotMeal.carbs ?? null,
          fat_g: loggedSlotMeal.fat ?? null,
          notes: note,
        }),
        created_at: new Date().toISOString(),
      }

      const { error: logErr } = await supabase.from('meal_logs').insert(logRow)

      if (logErr) {
        console.error('meal_logs insert failed:', {
          code: logErr.code,
          message: logErr.message,
          details: logErr.details,
          hint: logErr.hint,
          row: logRow,
        })
        setLogError('Plan updated, but saving your log failed. Try again later.')
        return
      }

      setLoggedMealSlots((prev) => new Set([...prev, mealTypeForLog]))

      closeLogModal()
      setCoachNote(note)
      showToast(note)
    } catch (e) {
      console.error(e)
      setLogError(e.message || 'Could not adjust your plan')
    } finally {
      setLogLoading(false)
    }
  }

  return (
    <>
    <main className="page-layer max-w-[1280px] mx-auto px-6 sm:px-10 pb-24 md:pb-16 pt-8">
      {navTierHost &&
        createPortal(
          <NavTierCredits tier={tier} creditsRemaining={creditsRemaining} />,
          navTierHost
        )}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 max-w-md px-5 py-3 rounded-xl border border-[#C9A84C]/40 bg-base-2 text-sm shadow-lg"
          style={{ color: '#C9A84C' }}
        >
          {toast}
        </div>
      )}

      {logModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-ate-title"
        >
          <Glass goldEdge className="w-full max-w-lg p-6">
            <h2 id="log-ate-title" className="font-syne font-bold text-xl text-ink mb-4">
              Log What I Ate
            </h2>

            {logModalStep === 1 ? (
              <>
                <p className="text-sm text-ink-mute mb-4">Which meal are you logging?</p>
                <div className="flex flex-wrap gap-2">
                  {LOG_MEAL_PILLS.map((pill) => {
                    const selected = logSelectedMeal === pill.id
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        disabled={logLoading}
                        onClick={() => setLogSelectedMeal(pill.id)}
                        className={`font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-full border transition-colors ${
                          selected
                            ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10'
                            : 'border-[var(--line)] text-ink-mute hover:text-ink hover:border-[var(--line-strong)]'
                        }`}
                      >
                        {pill.label}
                      </button>
                    )
                  })}
                </div>
                {logError && (
                  <p className="text-sm text-amber mt-3">
                    {logCreditsExhausted ? <CreditsExhaustedAlert message={logError} /> : logError}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-6 justify-end">
                  <Button type="button" variant="ghost" disabled={logLoading} onClick={closeLogModal}>
                    Cancel
                  </Button>
                  <button
                    type="button"
                    disabled={logLoading || !logSelectedMeal}
                    onClick={() => {
                      setLogError(null)
                      setLogCreditsExhausted(false)
                      setLogModalStep(2)
                    }}
                    className="btn btn-primary !min-h-[44px] disabled:opacity-50"
                    style={{ backgroundColor: '#7CB518', borderColor: '#7CB518' }}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.14em] mb-3"
                  style={{ color: '#C9A84C' }}
                >
                  {LOG_MEAL_PILLS.find((p) => p.id === logSelectedMeal)?.label}
                </p>
                <label htmlFor="log-ate-input" className="block text-sm text-ink-mute mb-3">
                  What did you eat?
                </label>
                <textarea
                  id="log-ate-input"
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-[var(--line)] bg-base-3 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold/50 resize-y min-h-[100px]"
                  placeholder="e.g. chicken burrito and pancakes at Wise Apple"
                  disabled={logLoading}
                />
                {logError && (
                  <p className="text-sm text-amber mt-3">
                    {logCreditsExhausted ? <CreditsExhaustedAlert message={logError} /> : logError}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={logLoading}
                    onClick={() => {
                      setLogModalStep(1)
                      setLogError(null)
                      setLogCreditsExhausted(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={logLoading || !logDescription.trim()}
                    onClick={submitLogWhatIAte}
                  >
                    {logLoading ? 'Adjusting…' : 'Submit'}
                  </Button>
                </div>
              </>
            )}
          </Glass>
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl border border-[var(--line)] bg-base-3 mb-8 w-full sm:w-fit">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMainTab(t.id)}
            className={`flex-1 sm:flex-none min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
              mainTab === t.id ? 'bg-ink text-base border-ink' : 'border-transparent text-ink-mute hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === 'today' && (
        <>
          <header className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute mb-2">{dateMeta}</p>
            <h1 className="font-syne font-bold text-[clamp(36px,5vw,56px)] leading-[0.95] text-ink">
              Today, {firstName}.
            </h1>
          </header>
          {hasPlan ? (
            <div className="space-y-5">
              {liveTodayMeals.length > 0 ? (
                <>
                  <DashboardToday meals={liveTodayMeals} loggedSlots={loggedMealSlots} />
                  {coachNote && (
                    <p className="text-sm leading-relaxed" style={{ color: '#C9A84C' }}>
                      {coachNote}
                    </p>
                  )}
                  <Button type="button" className="w-full sm:w-auto" onClick={openLogModal}>
                    Log what I ate
                  </Button>
                </>
              ) : (
                <p className="text-ink-mute text-sm">No meals scheduled for today in this plan.</p>
              )}
              <PerformanceMetrics
                planData={planMetrics}
                meta={planMeta}
                empty={!planMetrics}
                locationLabel={location || undefined}
              />
            </div>
          ) : (
            <BuildPlanCTA />
          )}
        </>
      )}

      {mainTab === 'plan' && (
        <>
          {!hasPlan ? (
            <BuildPlanCTA />
          ) : (
            <PlanViewClient
              embedded
              user={user}
              tier={tier}
              planId={latestPlan.id}
              planTitle={latestPlan.plan_title}
              planSubtitle={latestPlan.plan_subtitle}
              planData={planMetrics}
              locationLabel={location}
            />
          )}
        </>
      )}

      {mainTab === 'performance' && (
        <div className="space-y-5">
          <header className="mb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute mb-2">Overview</p>
            <h1 className="font-syne font-bold text-2xl text-ink">Your plan at a glance</h1>
          </header>

          <MarketPriceIndex
            shoppingList={planJson?.shoppingList}
            currency={currency}
            location={location || undefined}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Glass goldEdge>
              <CardBand title="Credits" meta={tier === 'free' ? 'this month' : 'unlimited'} />
              <div className="px-5 py-6 text-center">
                {tier === 'free' ? (
                  <>
                    <p className="font-syne font-bold text-4xl tabular-nums text-gold-soft">
                      <CountUpInteger value={creditsRemaining ?? 0} duration={0.9} />
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute mt-2">
                      credits remaining
                    </p>
                  </>
                ) : (
                  <p className="font-syne font-bold text-3xl tabular-nums text-ink">Unlimited</p>
                )}
              </div>
            </Glass>
            <Glass goldEdge>
              <CardBand title="Credit usage" meta={tier} />
              <div className="px-5 py-4">
                {tier === 'free' ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[rgba(255,247,219,0.06)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${creditsUsagePct}%`,
                            background: 'linear-gradient(90deg, #C9A84C 0%, var(--green) 100%)',
                          }}
                        />
                      </div>
                      <span className="font-mono text-sm tabular-nums text-ink-mute whitespace-nowrap">
                        {creditsUsed} / {FREE_CREDIT_CAP}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute mt-3">
                      {creditsUsed} of {FREE_CREDIT_CAP} credits used
                    </p>
                    {creditsExhausted && (
                      <p className="text-xs text-amber mt-4">
                        You&apos;ve used all your free credits this month.{' '}
                        <Link href="/upgrade" className="underline text-gold-soft">
                          Upgrade to Pro
                        </Link>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-ink-mute">Pro includes unlimited AI actions.</p>
                )}
              </div>
            </Glass>
          </div>

          <PerformanceMetrics
            planData={planMetrics}
            meta={planMeta}
            empty={!planMetrics}
            locationLabel={location || undefined}
          />
        </div>
      )}
    </main>
    <MobileBottomNav
      activeTab={mainTab === 'performance' ? 'today' : mainTab}
      onTabChange={(id) => setMainTab(id)}
    />
    </>
  )
}
