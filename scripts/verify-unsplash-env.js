/**
 * Verify Unsplash server search (no key printed).
 * Run: node scripts/verify-unsplash-env.js
 */
const path = require('path')
const fs = require('fs')

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  const text = fs.readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

async function main() {
  const { getUnsplashAccessKey, searchUnsplashMealPhoto } = await import('../lib/unsplash-search.js')
  const key = getUnsplashAccessKey()
  if (!key) {
    console.error('FAIL: No UNSPLASH_ACCESS_KEY or NEXT_PUBLIC_UNSPLASH_ACCESS_KEY in .env.local')
    process.exit(1)
  }
  console.log('OK: Unsplash access key is configured (length', key.length + ')')

  const result = await searchUnsplashMealPhoto('grilled chicken')
  if (!result?.url) {
    console.error('FAIL: search returned no image (check key validity or rate limits)')
    process.exit(1)
  }
  if (!result.url.includes('images.unsplash.com')) {
    console.error('FAIL: unexpected image URL host')
    process.exit(1)
  }
  console.log('OK: Server-side search returned an image URL')
  console.log('OK: No browser CORS — client should use /api/unsplash/search')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
