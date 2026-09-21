// Called by Aura WhatsApp bot. Phone is the join key.
// Writes only after user YES in WhatsApp.
// Server-to-server: Authorization Bearer CLEANEATS_AURA_SECRET.
// No Meta, Claude, or end-user OAuth here.
// Staging must be on a public URL — Aura cannot call localhost.

import { NextResponse } from 'next/server'
import { authorizeAuraRequest } from '../../../../../lib/aura-api-auth'
import { normalizePhoneDigits } from '../../../../../lib/phone-digits'
import { createAdminClient } from '../../../../../lib/supabase-admin'
import { buildAuraProfileForPhone, buildAuraProfileJson, getLatestPlan } from '../../../../../lib/aura-profile'

function parseUntil(until) {
  if (until == null || until === '') return null
  const s = String(until).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined
  return s
}

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
  if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
  if (typeof body.fasting !== 'boolean') {
    return NextResponse.json({ error: 'invalid_body', message: 'fasting must be boolean' }, { status: 400 })
  }

  const until = parseUntil(body.until)
  if (until === undefined) {
    return NextResponse.json({ error: 'invalid_body', message: 'until must be YYYY-MM-DD or null' }, { status: 400 })
  }

  try {
    const lookup = await buildAuraProfileForPhone(phone)
    if (lookup.error === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const supabase = createAdminClient()
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        aura_fasting: body.fasting,
        aura_fasting_until: body.fasting ? until : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lookup.profile.id)
      .select('*')
      .single()

    if (error) throw error

    const planRow = await getLatestPlan(updated.id)
    return NextResponse.json(buildAuraProfileJson(updated, planRow))
  } catch (e) {
    console.error('[aura/fasting POST]', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
