import { createClient } from '../../../../lib/supabase/server'
import { createClient as createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { buildProfileContext, upsertMealsFromPlan } from '../../../../lib/meal-cache'

export async function POST(request) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { meals, profileData, tdee, source = 'claude' } = body || {}

  if (!Array.isArray(meals) || !profileData) {
    return NextResponse.json({ error: 'meals array and profileData required' }, { status: 400 })
  }

  try {
    const context = buildProfileContext(profileData, tdee)
    const admin = createAdminClient()
    const result = await upsertMealsFromPlan(admin, meals, context, source)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Cache library upsert error:', err)
    const message =
      err?.message?.includes('SUPABASE_SERVICE_ROLE_KEY')
        ? 'Server cache write is not configured'
        : 'Failed to save meals to library'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
