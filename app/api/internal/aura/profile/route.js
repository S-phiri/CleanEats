// Called by Aura WhatsApp bot. Phone is the join key.
// Writes only after user YES in WhatsApp (this route is read-only).
// Server-to-server: Authorization Bearer CLEANEATS_AURA_SECRET.
// No Meta, Claude, or end-user OAuth here.
// Staging must be on a public URL — Aura cannot call localhost.

import { NextResponse } from 'next/server'
import { authorizeAuraRequest } from '../../../../../lib/aura-api-auth'
import { normalizePhoneDigits } from '../../../../../lib/phone-digits'
import { buildAuraProfileForPhone } from '../../../../../lib/aura-profile'

export async function GET(request) {
  const denied = authorizeAuraRequest(request)
  if (denied) return denied

  const phoneParam = request.nextUrl.searchParams.get('phone')
  const phone = normalizePhoneDigits(phoneParam)
  if (!phone) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
  }

  try {
    const result = await buildAuraProfileForPhone(phone)
    if (result.error === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json(result.body)
  } catch (e) {
    console.error('[aura/profile GET]', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
