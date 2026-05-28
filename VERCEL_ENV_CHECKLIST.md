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

**Discovered `process.env` references:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `MOCK_GENERATION`, `MOCK_FIXTURE_ID`, `CRON_SECRET`, `NODE_ENV`
