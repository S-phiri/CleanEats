import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  appendCacheDays,
  assembleMealPlan,
  buildCacheOnlyPlanMeta,
} from '../../../../lib/meal-cache'
import { COUNTRIES } from '../../../../lib/utils'
import { logCacheEvent } from '../../../../lib/log-api-cache'

export async function POST(request) {
  const started = Date.now()
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { profileData, tdee, mealPlan, appendCacheDays: shouldAppend } = body || {}

  if (!profileData || !tdee) {
    return NextResponse.json({ error: 'profileData and tdee required' }, { status: 400 })
  }

  try {
    if (shouldAppend && Array.isArray(mealPlan)) {
      const appended = await appendCacheDays(supabase, mealPlan, profileData, tdee)
      return NextResponse.json({
        mealPlan: appended.mealPlan,
        misses: appended.misses,
        context: {
          countryCode: appended.context.countryCode,
          culinaryStyle: appended.context.culinaryStyle,
          goal: appended.context.goal,
          daily: appended.context.daily,
        },
      })
    }

    const assembled = await assembleMealPlan(supabase, profileData, tdee)
    const cd = COUNTRIES[profileData.countryCode] || COUNTRIES.other
    const planMeta = buildCacheOnlyPlanMeta(profileData, assembled.context, cd)

    await logCacheEvent(supabase, user.id, {
      promptType: 'cache_assembly',
      cacheHits: assembled.stats.hits,
      cacheMisses: assembled.stats.misses,
      durationMs: Date.now() - started,
    })

    return NextResponse.json({
      mealPlan: assembled.mealPlan,
      misses: assembled.misses,
      stats: assembled.stats,
      fullyCached: assembled.fullyCached,
      useFullPlan: assembled.useFullPlan,
      planMeta,
      context: {
        countryCode: assembled.context.countryCode,
        culinaryStyle: assembled.context.culinaryStyle,
        goal: assembled.context.goal,
        daily: assembled.context.daily,
      },
    })
  } catch (err) {
    console.error('Plan assemble error:', err)
    return NextResponse.json({ error: 'Failed to assemble plan from cache' }, { status: 500 })
  }
}
