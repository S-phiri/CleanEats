import { NextResponse } from 'next/server'
import { getServiceRoleKey } from './service-role-key'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 120
const hits = new Map()

function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return true
  }
  entry.count += 1
  return entry.count <= MAX_REQUESTS
}

function misconfigured() {
  return NextResponse.json({ error: 'server_misconfigured' }, { status: 503 })
}

/** Returns null if authorized, or a NextResponse error. */
export function authorizeAuraRequest(request) {
  const secret = process.env.CLEANEATS_AURA_SECRET?.trim()
  if (!secret) return misconfigured()

  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token || token !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!getServiceRoleKey() || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return misconfigured()
  }

  const ip = clientIp(request)
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  return null
}
