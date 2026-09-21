import { createClient } from '@supabase/supabase-js'
import { getServiceRoleKey } from './service-role-key'

/** Service-role client for server-only routes (bypasses RLS). */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = getServiceRoleKey()
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and service role key are required')
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
