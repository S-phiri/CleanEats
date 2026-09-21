// Called by Aura WhatsApp bot. Phone is the join key.
// Writes only after user YES in WhatsApp.
// Server-to-server: Authorization Bearer CLEANEATS_AURA_SECRET.
// No Meta, Claude, or end-user OAuth here.
// Staging must be on a public URL — Aura cannot call localhost.

import { NextResponse } from 'next/server'
import { authorizeAuraRequest } from '../../../../../lib/aura-api-auth'
import { normalizePhoneDigits } from '../../../../../lib/phone-digits'
import { createAdminClient } from '../../../../../lib/supabase-admin'
import { buildAuraProfileForPhone, buildAuraProfileJson } from '../../../../../lib/aura-profile'
import { applyMealSwap } from '../../../../../lib/aura-meal-plan'

export async function POST(request) {
  const denied = authorizeAuraRequest(request)
  if (denied) return denied

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const phone = normalizePhoneDigits(body.phone)
  const mealType = body.meal_type
  const dish = typeof body.dish === 'string' ? body.dish.trim() : ''

  if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
  if (!mealType || typeof mealType !== 'string') {
    return NextResponse.json({ error: 'invalid_body', message: 'meal_type required' }, { status: 400 })
  }
  if (!dish) {
    return NextResponse.json({ error: 'invalid_body', message: 'dish required' }, { status: 400 })
  }

  try {
    const lookup = await buildAuraProfileForPhone(phone)
    if (lookup.error === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    if (!lookup.planRow?.id) {
      return NextResponse.json({ error: 'no_plan' }, { status: 404 })
    }

    let nextJson
    try {
      nextJson = applyMealSwap(lookup.planRow.plan_json, mealType, dish)
    } catch (err) {
      if (err.message === 'meal_type_not_found') {
        return NextResponse.json({ error: 'meal_type_not_found' }, { status: 400 })
      }
      throw err
    }

    const supabase = createAdminClient()
    const { error: saveErr } = await supabase
      .from('plans')
      .update({ plan_json: nextJson })
      .eq('id', lookup.planRow.id)
      .eq('user_id', lookup.profile.id)

    if (saveErr) throw saveErr

    const planRow = { ...lookup.planRow, plan_json: nextJson }
    return NextResponse.json(buildAuraProfileJson(lookup.profile, planRow))
  } catch (e) {
    console.error('[aura/swap-meal POST]', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
