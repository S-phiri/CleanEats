/**
 * Verifies .env.local: Supabase URL host matches the `ref` claim in the anon JWT.
 * Run: node scripts/verify-supabase-env.js
 */
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ Missing .env.local in project root (next to package.json).')
  process.exit(1)
}

const raw = fs.readFileSync(envPath, 'utf8')
const urlLine = raw.match(/^\s*NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)
const keyLine = raw.match(/^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m)

if (!urlLine?.[1]?.trim()) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set')
  process.exit(1)
}
if (!keyLine?.[1]?.trim()) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set')
  process.exit(1)
}

const urlStr = urlLine[1].trim().replace(/^["']|["']$/g, '')
const key = keyLine[1].trim().replace(/^["']|["']$/g, '')

let host
try {
  host = new URL(urlStr).hostname
} catch {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
  process.exit(1)
}

const expectedPrefix = host.replace('.supabase.co', '')
if (!host.endsWith('.supabase.co')) {
  console.error('❌ URL should look like https://xxxx.supabase.co')
  process.exit(1)
}

const parts = key.split('.')
if (parts.length !== 3 || !parts[1]) {
  console.error('❌ Anon key should be a JWT with three dot-separated segments')
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
} catch {
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
  } catch {
    console.error('❌ Could not decode anon key JWT payload')
    process.exit(1)
  }
}

const ref = payload.ref
if (!ref) {
  console.error('❌ JWT payload has no ref claim')
  process.exit(1)
}

if (ref !== expectedPrefix) {
  console.error('❌ Mismatch: URL project ref is', expectedPrefix, 'but JWT ref is', ref)
  console.error('   Fix: copy URL + anon key from the SAME Supabase project (Settings → API).')
  process.exit(1)
}

if (!key.startsWith('eyJ')) {
  console.error('❌ Anon key should start with eyJ (check for a typo like an extra leading letter).')
  process.exit(1)
}

console.log('✅ NEXT_PUBLIC_SUPABASE_URL and anon key ref match:', ref)
console.log('   Restart npm run dev after any .env change.')
