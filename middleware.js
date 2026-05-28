import { NextResponse } from 'next/server'
import { createMiddlewareClient } from './lib/supabase/server'

export async function middleware(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[CleanEats] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example → .env.local and add your Supabase keys. Auth middleware is skipped until then.'
      )
      return NextResponse.next({ request })
    }
    return new NextResponse('Application misconfigured: Supabase environment variables are missing.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const { supabase, getResponse } = createMiddlewareClient(request)

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/profile', '/plan', '/upgrade']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CleanEats middleware] no session cookie → redirect to /login from', request.nextUrl.pathname)
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const authGuestOnlyPaths = ['/login', '/signup', '/forgot-password']
  if (user && authGuestOnlyPaths.includes(request.nextUrl.pathname)) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CleanEats middleware] session present → redirect /login|/signup → /dashboard')
    }
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashUrl)
  }

  return getResponse()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
