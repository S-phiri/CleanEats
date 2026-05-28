export const maxDuration = 60

import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  mockProfilesById,
  defaultMockProfileId,
} from '../../../lib/mock-plan-fixtures'
import { FREE_CREDIT_CAP } from '../../../lib/credits'
const STUCK_GENERATION_LOCK_MS = 3 * 60 * 1000

function isMockGeneration() {
  return process.env.MOCK_GENERATION === '1' || process.env.MOCK_GENERATION === 'true'
}

/** Second client call asks for shopping + prep; first call is the full nutrition prompt. */
function isShoppingPrepPrompt(userContent) {
  return typeof userContent === 'string' && userContent.includes('Generate shopping list')
}

function isIngredientSwapPrompt(userContent) {
  return typeof userContent === 'string' && userContent.includes('INGREDIENT SWAP')
}

function isMealSwapPrompt(userContent) {
  return typeof userContent === 'string' && userContent.includes('MEAL SWAP')
}

function isLogDeviationPrompt(userContent) {
  return typeof userContent === 'string' && userContent.includes('LOG DEVIATION')
}

const LOG_DEVIATION_MEAL_ADJUSTMENT = `When adjusting remaining meals, only modify portion sizes or swap to ingredients already listed in the user's existing meal plan for today. Do not introduce new ingredients the user would need to purchase. Work within what is already planned.`

function messagesForAnthropic(messages, userContent) {
  if (!isLogDeviationPrompt(userContent) || !Array.isArray(messages)) return messages
  return messages.map((m, i) => {
    if (i !== 0 || m.role !== 'user' || typeof m.content !== 'string') return m
    return { ...m, content: `${m.content}\n\n${LOG_DEVIATION_MEAL_ADJUSTMENT}` }
  })
}

/** Server-side prompt type: explicit body field or inferred from message content. */
function resolvePromptType(userContent, body) {
  const explicit = body?.promptType ?? body?.type
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim().toLowerCase()
  }
  if (isShoppingPrepPrompt(userContent)) return 'shopping_prep'
  if (isLogDeviationPrompt(userContent)) return 'log_deviation'
  if (isMealSwapPrompt(userContent)) return 'swap_meal'
  if (isIngredientSwapPrompt(userContent)) return 'swap_ingredient'
  return 'full_plan'
}

/** Credit cost from prompt type only — never from the client body. */
function resolveCreditCost(promptType) {
  switch (promptType) {
    case 'full_plan':
    case 'generate_plan':
      return 3
    case 'swap_meal':
    case 'swap_ingredient':
    case 'log_deviation':
      return 1
    case 'shopping_prep':
      return 0
    default:
      return 1
  }
}

function creditsRemaining(tier, creditsUsed) {
  if (tier === 'pro' || tier === 'coach') return null
  return Math.max(0, FREE_CREDIT_CAP - creditsUsed)
}

function jsonWithCredits(payload, tier, creditsUsed, status) {
  const body = { ...payload, credits_remaining: creditsRemaining(tier, creditsUsed) }
  return status ? NextResponse.json(body, { status }) : NextResponse.json(body)
}

function startOfCurrentMonthUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

function parseResetDate(value) {
  if (!value) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

async function ensureMonthlyCreditReset(supabase, userId, profile) {
  const monthStart = startOfCurrentMonthUtc()
  const lastReset = parseResetDate(profile?.last_reset_date)
  const today = new Date().toISOString().slice(0, 10)

  if (!lastReset || lastReset < monthStart) {
    const { error } = await supabase
      .from('profiles')
      .update({ credits_used: 0, last_reset_date: today })
      .eq('id', userId)

    if (error) {
      console.error('Credit reset error:', error)
      return profile?.credits_used ?? 0
    }
    return 0
  }

  return profile?.credits_used ?? 0
}

/** Atomically increment credits for free tier; returns false if over cap or RPC error. */
async function chargeCreditsAtomically(supabase, userId, creditCost) {
  const { data: allowed, error } = await supabase.rpc('increment_credits_if_under_cap', {
    p_user_id: userId,
    p_amount: creditCost,
    p_cap: FREE_CREDIT_CAP,
  })

  if (error) {
    console.error('increment_credits_if_under_cap error:', error)
    return { ok: false, rpcError: true }
  }

  return { ok: !!allowed }
}

function mockAnthropicPayload(planPart, shoppingPart, isSecondCall) {
  const obj = isSecondCall ? shoppingPart : planPart
  return {
    id: 'mock-msg',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: JSON.stringify(obj) }],
    model: 'mock',
    stop_reason: 'end_turn',
    usage: { input_tokens: 0, output_tokens: 0 },
  }
}

async function releaseGenerationLock(supabase, userId) {
  await supabase.from('profiles').update({ is_generating: false }).eq('id', userId)
}

async function clearStuckGenerationLock(supabase, userId, profile) {
  if (!profile?.is_generating) return profile

  const updatedAt = profile.updated_at ? new Date(profile.updated_at).getTime() : NaN
  if (Number.isNaN(updatedAt) || Date.now() - updatedAt <= STUCK_GENERATION_LOCK_MS) {
    return profile
  }

  await releaseGenerationLock(supabase, userId)
  return { ...profile, is_generating: false }
}

export async function POST(request) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised', credits_remaining: null }, { status: 401 })
  }

  const body = await request.json()
  const { messages, max_tokens, model, savePlan } = body

  let { data: profile } = await supabase
    .from('profiles')
    .select('tier, generations_this_month, is_generating, credits_used, last_reset_date, updated_at')
    .eq('id', user.id)
    .single()

  const tier = profile?.tier || 'free'
  const usedThisMonth = profile?.generations_this_month || 0
  let creditsUsed = await ensureMonthlyCreditReset(supabase, user.id, profile)

  /** Finalize after client merges meal + shopping JSON — insert plan, increment quota, release lock. */
  if (savePlan && typeof savePlan === 'object') {
    let generationLockCleared = false
    try {
      const { data: savedPlan, error: insErr } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          plan_title: savePlan.plan_title,
          plan_subtitle: savePlan.plan_subtitle,
          target_calories: savePlan.target_calories,
          plan_json: savePlan.plan_json,
        })
        .select('id')
        .single()

      if (insErr) {
        await releaseGenerationLock(supabase, user.id)
        generationLockCleared = true
        return jsonWithCredits({ error: insErr.message }, tier, creditsUsed, 500)
      }

      // generations_this_month: analytics only — quota is enforced via credits_used (FREE_CREDIT_CAP).
      await supabase
        .from('profiles')
        .update({
          generations_this_month: usedThisMonth + 1,
          is_generating: false,
        })
        .eq('id', user.id)

      generationLockCleared = true
      return jsonWithCredits({ planId: savedPlan.id }, tier, creditsUsed)
    } catch (err) {
      console.error('Save plan error:', err)
      await releaseGenerationLock(supabase, user.id)
      generationLockCleared = true
      return jsonWithCredits({ error: 'Failed to save plan' }, tier, creditsUsed, 500)
    } finally {
      if (!generationLockCleared) {
        await releaseGenerationLock(supabase, user.id)
      }
    }
  }

  if (!messages || !Array.isArray(messages)) {
    return jsonWithCredits({ error: 'Invalid request body' }, tier, creditsUsed, 400)
  }

  const userContent = messages[0]?.content ?? ''
  const promptType = resolvePromptType(userContent, body)
  const creditCost = resolveCreditCost(promptType)
  /** Pairs with meal-plan call; do not double-count free-tier generations. */
  const skipQuotaIncrement = isShoppingPrepPrompt(userContent)
  const skipGenerationLock =
    skipQuotaIncrement ||
    isIngredientSwapPrompt(userContent) ||
    isMealSwapPrompt(userContent) ||
    isLogDeviationPrompt(userContent)

  if (tier === 'free' && creditCost > 0) {
    const charge = await chargeCreditsAtomically(supabase, user.id, creditCost)
    if (charge.rpcError) {
      return jsonWithCredits(
        { error: 'Failed to verify credits' },
        tier,
        creditsUsed,
        500
      )
    }
    if (!charge.ok) {
      return jsonWithCredits(
        {
          error: 'CREDITS_EXHAUSTED',
          message: 'No credits remaining',
        },
        tier,
        creditsUsed,
        402
      )
    }
    creditsUsed += creditCost
  }

  let generationLockHeld = false

  if (!skipGenerationLock) {
    profile = await clearStuckGenerationLock(supabase, user.id, profile)

    if (profile?.is_generating) {
      return jsonWithCredits(
        {
          error: 'GENERATION_IN_PROGRESS',
          message: 'A plan generation is already in progress.',
        },
        tier,
        creditsUsed,
        429
      )
    }

    const { data: locked, error: lockErr } = await supabase
      .from('profiles')
      .update({ is_generating: true })
      .eq('id', user.id)
      .eq('is_generating', false)
      .select('id')
      .maybeSingle()

    if (lockErr || !locked) {
      return jsonWithCredits(
        {
          error: 'GENERATION_IN_PROGRESS',
          message: 'A plan generation is already in progress.',
        },
        tier,
        creditsUsed,
        429
      )
    }

    generationLockHeld = true
  }

  if (isMockGeneration()) {
    try {
      const id = process.env.MOCK_FIXTURE_ID || defaultMockProfileId
      const bundle = mockProfilesById[id]
      if (!bundle) {
        return jsonWithCredits(
          {
            error: `Unknown MOCK_FIXTURE_ID: ${id}. Use zm_male_fatloss, zm_female_fatloss, us_male_muscle, or us_female_muscle.`,
          },
          tier,
          creditsUsed,
          400
        )
      }
      const second = isShoppingPrepPrompt(userContent)
      const payload = mockAnthropicPayload(bundle.plan, bundle.shopping, second)
      return jsonWithCredits(payload, tier, creditsUsed)
    } finally {
      if (generationLockHeld) {
        await releaseGenerationLock(supabase, user.id)
      }
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 8000,
        messages: messagesForAnthropic(messages, userContent),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return jsonWithCredits(
        { error: data.error?.message || 'Anthropic API error' },
        tier,
        creditsUsed,
        response.status
      )
    }

    return jsonWithCredits(data, tier, creditsUsed)
  } catch (err) {
    console.error('Generate API error:', err)
    return jsonWithCredits({ error: 'Internal server error' }, tier, creditsUsed, 500)
  } finally {
    if (generationLockHeld) {
      await releaseGenerationLock(supabase, user.id)
    }
  }
}
