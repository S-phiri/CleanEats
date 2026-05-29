/**
 * Seed meals_library from mock-plan-fixtures.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Run: node scripts/seed-meals-library.js
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

const { createClient } = require('@supabase/supabase-js')

const SEED_META = {
  zm_male_fatloss: {
    countryCode: 'ZM',
    goal: 'losefat',
    culinaryStyle: 'mixed',
    dietTags: ['No Restrictions'],
    budgetTier: 'mid',
    source: 'import',
  },
  zm_female_fatloss: {
    countryCode: 'ZM',
    goal: 'losefat',
    culinaryStyle: 'mixed',
    dietTags: ['No Restrictions'],
    budgetTier: 'mid',
    source: 'import',
  },
  us_male_muscle: {
    countryCode: 'US',
    goal: 'musclegain',
    culinaryStyle: 'modern',
    dietTags: ['No Restrictions'],
    budgetTier: 'mid',
    source: 'import',
  },
  us_female_muscle: {
    countryCode: 'US',
    goal: 'musclegain',
    culinaryStyle: 'modern',
    dietTags: ['No Restrictions'],
    budgetTier: 'mid',
    source: 'import',
  },
}

async function main() {
  const { mockProfilesById, MOCK_PROFILE_IDS } = await import('../lib/mock-plan-fixtures.js')
  const { libraryRowFromMeal } = await import('../lib/meal-cache.js')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const seen = new Set()
  let inserted = 0
  let skipped = 0

  for (const id of MOCK_PROFILE_IDS) {
    const bundle = mockProfilesById[id]
    const meta = SEED_META[id]
    if (!bundle?.plan?.mealPlan || !meta) continue

    for (const day of bundle.plan.mealPlan) {
      for (const meal of day.meals || []) {
        const row = libraryRowFromMeal(meal, meta)
        if (seen.has(row.content_hash)) {
          skipped += 1
          continue
        }
        seen.add(row.content_hash)

        const { error } = await supabase.from('meals_library').upsert(row, {
          onConflict: 'content_hash',
          ignoreDuplicates: false,
        })

        if (error) {
          console.error('Insert failed:', meal.name, error.message)
        } else {
          inserted += 1
        }
      }
    }
  }

  console.log(`Seed complete: ${inserted} meals upserted, ${skipped} duplicates skipped.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
