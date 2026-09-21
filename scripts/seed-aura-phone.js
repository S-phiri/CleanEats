/**
 * Attach phone_digits to a CleanEats profile for Aura closed testing.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: CLEANEATS_AURA_SEED_EMAIL, CLEANEATS_AURA_SEED_PHONE (default 27646604490)
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function loadEnvLocal() {
  const p = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const val = m[2].trim().replace(/^["']|["']$/g, '')
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPA_BASE_SERVICE_ROLE_KEY || ''
}

function normalizePhoneDigits(raw) {
  let d = String(raw ?? '').replace(/\D/g, '')
  if (!d) return null
  if (d.startsWith('0')) {
    if (d.length === 10) return `27${d.slice(1)}`
    if (d.length === 9) return `260${d.slice(1)}`
  }
  return d
}

async function main() {
  loadEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = getServiceRoleKey()
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or service role key in .env.local')
    process.exit(1)
  }

  const email = process.env.CLEANEATS_AURA_SEED_EMAIL
  const phone = normalizePhoneDigits(process.env.CLEANEATS_AURA_SEED_PHONE || '27646604490')
  if (!phone) {
    console.error('Invalid CLEANEATS_AURA_SEED_PHONE')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  let userId
  if (email) {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (error) throw error
    const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
      console.error(`No auth user for email: ${email}`)
      process.exit(1)
    }
    userId = user.id
  } else {
    const { data: profiles, error } = await supabase.from('profiles').select('id, name').limit(1)
    if (error) throw error
    if (!profiles?.length) {
      console.error('No profiles found. Set CLEANEATS_AURA_SEED_EMAIL.')
      process.exit(1)
    }
    userId = profiles[0].id
    console.log('Using first profile:', profiles[0].name || userId)
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ phone_digits: phone, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, name, phone_digits')
    .single()

  if (error) {
    console.error('Update failed:', error.message)
    console.error('Run supabase/migrations/20260921_aura_internal_api.sql if columns are missing.')
    process.exit(1)
  }

  console.log('OK — phone_digits set:', data)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
