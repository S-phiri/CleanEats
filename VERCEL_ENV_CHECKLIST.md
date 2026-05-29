# Vercel environment checklist

Set these in **Vercel → Project → Settings → Environment Variables** before deploying. Use **Production** (and **Preview** if preview deployments should work).

After adding vars, redeploy. In **Supabase → Authentication → URL configuration**:

- **Site URL:** `https://cleaneats.fit` (production)
- **Redirect URLs** (add each):
  - `https://cleaneats.fit/auth/callback`
  - `https://cleaneats.fit/reset-password`
  - `http://localhost:3000/auth/callback` (local dev)
  - `http://localhost:3000/reset-password` (local dev)

Run locally: copy `.env.example` → `.env.local`, fill values, then `npm run dev`.

---

## Supabase

Required for auth, profiles, plans, and middleware session refresh.

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (`https://<ref>.supabase.co`)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase **anon** public key (not service_role)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — service role key for cron/admin routes only (`lib/supabase/admin.js`)

Verify URL and anon key match the same project: `npm run verify:env`

**Database SQL (run once in Supabase SQL Editor):**

- [ ] `supabase-schema.sql` — base tables, RLS, signup trigger
- [ ] `supabase-profiles-credits-migration.sql` — `credits_used`, `last_reset_date`, `is_generating` (skip if schema already includes these)
- [ ] `supabase-increment-credits-rpc.sql` — required for `/api/generate` credit charging

---

## Anthropic

Required for meal plan generation (`/api/generate`). Omit only if using mock mode (see App Config).

- [ ] `ANTHROPIC_API_KEY` — Anthropic API key (**server-only**; never `NEXT_PUBLIC_`)

---

## App Config

- [ ] `NEXT_PUBLIC_SITE_URL` — public app origin. **Production:** `https://cleaneats.fit`. **Local `.env.local`:** `http://localhost:3000`. Used for signup `emailRedirectTo`, OAuth, and password reset.

Optional — development, testing, or local runs without calling Anthropic.

- [ ] `MOCK_GENERATION` — `1` or `true` to use mock fixtures instead of Claude (optional)
- [ ] `MOCK_FIXTURE_ID` — fixture id when mock mode is on (optional; defaults in code if unset)

`NODE_ENV` is set by Vercel/Next.js automatically. **Do not** add it manually unless you have a specific reason.

---

## Unsplash (meal card images)

Required for dashboard/plan meal photos. Requests go through `/api/unsplash/search` (server-side; no browser CORS).

- [ ] `UNSPLASH_ACCESS_KEY` — Unsplash **Access Key** from [unsplash.com/developers](https://unsplash.com/developers) (**server-only**; do not use `NEXT_PUBLIC_` for new setups)
- [ ] **Redeploy** after adding or changing this variable (not baked into client bundle, but required at runtime on the server)

Legacy fallback: if only `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` is set, the API route still works, but prefer `UNSPLASH_ACCESS_KEY` on Vercel.

Verify locally: `npm run verify:unsplash`

---

## Cron

Required when `/api/reset-locks` (or similar admin cron routes) is deployed:

- [ ] `CRON_SECRET` — shared secret for cron request authentication (Vercel `Authorization: Bearer`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — also listed under Supabase; used by `lib/supabase/admin.js`

---

## Audit summary

| Check | Result |
|-------|--------|
| Hardcoded API keys / tokens in `/app`, `/lib`, `/middleware.js` | None found |
| Direct `.env` imports in `/app` or `/lib` | None found |
| `.env.local` in `.gitignore` | Yes |

**Discovered `process.env` references:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `UNSPLASH_ACCESS_KEY`, `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`, `MOCK_GENERATION`, `MOCK_FIXTURE_ID`, `CRON_SECRET`, `NODE_ENV`
