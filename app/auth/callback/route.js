import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { origin } = new URL(request.url)

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }

    const supabase = createClient()

    // Supabase email confirmation / OAuth callback: code -> session cookies.
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

    // New users should always complete onboarding first.
    // Consider the profile "complete" once a key onboarding field exists.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, profile_data')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Callback error:', profileError)
      // If profile lookup fails for any reason, route user into onboarding (safe default).
      return NextResponse.redirect(`${origin}/profile`)
    }

    const goal =
      profile?.profile_data && typeof profile.profile_data === 'object'
        ? profile.profile_data.goal
        : null

    const isProfileComplete = !!goal || !!profile?.name
    return NextResponse.redirect(`${origin}${isProfileComplete ? '/dashboard' : '/profile'}`)
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
