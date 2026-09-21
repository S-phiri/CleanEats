/** Supabase service role — Lovable uses SUPA_BASE_SERVICE_ROLE_KEY; Vercel/docs use SUPABASE_SERVICE_ROLE_KEY. */
export function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPA_BASE_SERVICE_ROLE_KEY?.trim() ||
    ''
  )
}
