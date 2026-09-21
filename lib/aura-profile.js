import { createAdminClient } from './supabase-admin'
import { normalizePhoneDigits } from './phone-digits'
import { resolveTodayMeal, isAuraFastingActive, getLocalPlanContext } from './aura-meal-plan'

function firstName(name) {
  if (!name || typeof name !== 'string') return null
  const part = name.trim().split(/\s+/)[0]
  return part || null
}

export async function findProfileByPhoneDigits(phoneDigits) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('phone_digits', phoneDigits).maybeSingle()
  if (error) throw error
  return data
}

export async function getLatestPlan(userId) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('plans')
    .select('id, plan_json, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export function buildAuraProfileJson(profile, planRow) {
  const { date } = getLocalPlanContext()
  const todayMeal = resolveTodayMeal(planRow?.plan_json?.mealPlan)
  const fasting = isAuraFastingActive(profile, date)

  return {
    user_id: profile.id,
    first_name: firstName(profile.name),
    phone: profile.phone_digits,
    fasting,
    fasting_until: fasting ? profile.aura_fasting_until || null : null,
    today: {
      date: todayMeal.date,
      meal_type: todayMeal.meal_type,
      dish: todayMeal.dish,
    },
  }
}

export async function buildAuraProfileForPhone(rawPhone) {
  const phone = normalizePhoneDigits(rawPhone)
  if (!phone) return { error: 'invalid_phone', status: 400 }

  const profile = await findProfileByPhoneDigits(phone)
  if (!profile) return { error: 'not_found', status: 404 }

  const planRow = await getLatestPlan(profile.id)
  return { body: buildAuraProfileJson(profile, planRow), profile, planRow, phone }
}
