import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '../../Nav'
import DashboardClient from '../../components/DashboardClient'
import { creditsRemainingForProfile } from '../../lib/credits'
import { COUNTRIES } from '../../lib/utils'

export default async function Dashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: plans } = await supabase
    .from('plans')
    .select('id, created_at, plan_title, plan_subtitle, target_calories')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: latestRow } = await supabase
    .from('plans')
    .select('id, plan_json, plan_title, plan_subtitle, target_calories, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestPlanJson = latestRow?.plan_json
    ? (typeof latestRow.plan_json === 'string'
      ? (() => { try { return JSON.parse(latestRow.plan_json) } catch { return null } })()
      : latestRow.plan_json)
    : null

  const latestPlan = latestRow
    ? {
        ...latestRow,
        plan_json: latestPlanJson
          ? {
              ...latestPlanJson,
              targetCalories: latestPlanJson.targetCalories ?? latestRow.target_calories ?? null,
            }
          : null,
      }
    : null

  const tier = profile?.tier || 'free'
  const hasProfile = !!(profile?.profile_data && profile.profile_data.goal)
  const initialCreditsRemaining = creditsRemainingForProfile(profile)
  const displayName = profile?.name || user.email.split('@')[0]
  const profileData = profile?.profile_data || {}
  const countryKey = (profileData.countryCode || 'ZM').toUpperCase()
  const cd = COUNTRIES[countryKey] || COUNTRIES.other
  const location =
    (profileData.city && String(profileData.city).trim()) || cd?.name || ''

  return (
    <>
      <Nav user={user} tier={tier} />
      <DashboardClient
        user={{ id: user.id, email: user.email }}
        displayName={displayName}
        plans={plans || []}
        tier={tier}
        hasProfile={hasProfile}
        initialCreditsRemaining={initialCreditsRemaining}
        latestPlan={latestPlan}
        location={location}
        profileData={profileData}
      />
    </>
  )
}
