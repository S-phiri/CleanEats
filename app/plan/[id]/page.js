import { createClient } from '../../../lib/supabase-server'
import { redirect } from 'next/navigation'
import PlanViewClient from '../../../components/PlanViewClient'

export default async function PlanPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = params

  const { data: row, error } = await supabase
    .from('plans')
    .select('id, plan_json, plan_title, plan_subtitle, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !row) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  return (
    <PlanViewClient
      key={row.id}
      user={{ id: user.id, email: user.email }}
      tier={profile?.tier}
      planTitle={row.plan_title}
      planSubtitle={row.plan_subtitle}
      planData={row.plan_json}
    />
  )
}
