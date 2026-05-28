import { createBrowserClient } from '@supabase/ssr'

/** Browser / Client Component Supabase client (anon key, session in cookies). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
