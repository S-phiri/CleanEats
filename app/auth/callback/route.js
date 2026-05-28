import { createRouteHandlerClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  try {
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }

    const { supabase, redirect } = createRouteHandlerClient(request)

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Callback error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.id) {
      if (userError) console.error('Callback error:', userError)
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, profile_data')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Callback error:', profileError)
      return redirect(`${origin}/profile`)
    }

    const goal =
      profile?.profile_data && typeof profile.profile_data === 'object'
        ? profile.profile_data.goal
        : null

    const isProfileComplete = !!goal || !!profile?.name
    const destination = `${origin}${isProfileComplete ? '/dashboard' : '/profile'}`
    return redirect(destination)
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
