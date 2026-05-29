import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUnsplashAccessKey, searchUnsplashMealPhoto } from '../../../../lib/unsplash-search'

export async function GET(request) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')?.trim()
  if (!name) {
    return NextResponse.json({ error: 'name query parameter required' }, { status: 400 })
  }

  if (!getUnsplashAccessKey()) {
    return NextResponse.json({ error: 'Unsplash is not configured' }, { status: 503 })
  }

  const result = await searchUnsplashMealPhoto(name)
  if (!result) {
    return NextResponse.json({ url: null }, { status: 200 })
  }

  return NextResponse.json(result)
}
