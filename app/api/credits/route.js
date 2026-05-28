import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

const FREE_CREDIT_CAP = 10

function startOfCurrentMonthUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

function parseResetDate(value) {
  if (!value) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

async function creditsUsedAfterMonthlyReset(supabase, userId, profile) {
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

function creditsRemaining(tier, creditsUsed) {
  if (tier === 'pro' || tier === 'coach') return null
  return Math.max(0, FREE_CREDIT_CAP - creditsUsed)
}

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, credits_used, last_reset_date')
    .eq('id', user.id)
    .single()

  const tier = profile?.tier || 'free'
  const credits_used = await creditsUsedAfterMonthlyReset(supabase, user.id, profile)

  return NextResponse.json({
    credits_used,
    credits_remaining: creditsRemaining(tier, credits_used),
    tier,
  })
}
