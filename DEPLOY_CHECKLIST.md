# Pre-deployment checklist (Vercel · Next.js 14)

Last audited: project build via `npm run build`. Use this with [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) for environment variables.

---

## 1. `next.config.js`

| Item | Status | Notes |
|------|--------|-------|
| `output: "export"` not set | ✅ | No `output` key — App Router + Route Handlers + middleware are supported on Vercel |
| `images.remotePatterns` for external domains | ✅ | No `next/image` usage in the app; fonts load via `<link>` to Google Fonts. Add `remotePatterns` when you introduce external images (e.g. Supabase Storage: `*.supabase.co`) |
| Unstable experimental flags | ✅ | Only `experimental.optimizePackageImports: ['framer-motion']` — supported in Next.js 14.2 for tree-shaking; safe on Vercel |

**File:** [`next.config.js`](next.config.js)

---

## 2. `package.json`

| Item | Status | Notes |
|------|--------|-------|
| `"build": "next build"` | ✅ | Present |
| `node:` protocol imports in app code | ✅ | None in `/app`, `/lib`, `/components`, `middleware.js` |
| Native binary dependencies | ✅ | None (`sharp`, `bcrypt`, etc. not in dependencies) |
| Edge / Vercel compatibility | ✅ | Route handlers use default Node runtime (no `export const runtime = 'edge'`) |
| Postinstall patch | ⚠️ | `postinstall` runs [`scripts/fix-next-parseurl.js`](scripts/fix-next-parseurl.js) — patches Next 14.2.35 `parseUrl` for dev/HMR. Runs on Vercel install; verify build logs show no postinstall failure |

**Dependencies:** `@supabase/ssr`, `@supabase/supabase-js`, `framer-motion`, `lucide-react`, `next@14.2.35` — all compatible with Vercel serverless.

---

## 3. App Router structure

| Item | Status | Notes |
|------|--------|-------|
| Route Handlers use named HTTP exports | ✅ | No default exports on route files |
| `app/api/generate/route.js` | ✅ | `export async function POST` |
| `app/api/credits/route.js` | ✅ | `export async function GET` |
| `app/auth/callback/route.js` | ✅ | `export async function GET` |
| `"use client"` files import `fs` / `path` / `crypto` | ✅ | Only in `/scripts` (not bundled into the app) |
| Client components import `next/headers` / `supabase/server` | ✅ | None — server helpers only in Server Components and route handlers |

**Root layout:** [`app/layout.js`](app/layout.js) sets `export const dynamic = 'force-dynamic'` (session-aware app; expected on Vercel).

**Middleware:** [`middleware.js`](middleware.js) matcher excludes `/api` — API routes skip auth middleware (handlers enforce auth themselves).

---

## 4. Framer Motion

| File | `"use client"` | Status |
|------|----------------|--------|
| `app/login/page.js` | Yes | ✅ |
| `app/signup/page.js` | Yes | ✅ |
| `components/PremiumSelect.js` | Yes | ✅ |
| `components/HomeHeroMotion.js` | Yes | ✅ |
| `components/HomePricingMotion.js` | Yes | ✅ |
| `components/CountUpInteger.js` | Yes | ✅ |
| `lib/motion.js` | Yes | ✅ |
| Server Components (`app/page.js`, landing `Hero.jsx`, etc.) | N/A | ✅ No `framer-motion` imports |

No server component imports Framer Motion directly. Landing [`Hero.jsx`](components/landing/Hero.jsx) is a client component without motion (static markup).

---

## 5. Vercel environment variables (required before deploy)

Copy from [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md). Set in **Vercel → Project → Settings → Environment Variables** (Production + Preview).

### Supabase (required)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — only if using cron/admin routes (`lib/supabase/admin.js`)

### Anthropic (required for live generation)

- [ ] `ANTHROPIC_API_KEY`

### App config (optional)

- [ ] `MOCK_GENERATION` — set to `1` only for preview/staging without Claude
- [ ] `MOCK_FIXTURE_ID` — optional when mock mode is on

### Cron (when `/api/reset-locks` is deployed)

- [ ] `CRON_SECRET`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (same as above)

`NODE_ENV` is set automatically by Vercel — do not add manually.

---

## 6. Post-deploy (manual)

- [ ] Supabase **Authentication → URL configuration**: Site URL + redirect URLs include `https://<your-app>.vercel.app` and `https://<your-app>.vercel.app/auth/callback`
- [ ] Supabase **SQL Editor**: run [`supabase-profiles-credits-migration.sql`](supabase-profiles-credits-migration.sql) if not already applied (existing projects)
- [ ] Supabase **SQL Editor**: run [`supabase-increment-credits-rpc.sql`](supabase-increment-credits-rpc.sql) (required for free-tier plan generation)
- [ ] Run `npm run verify:env` locally after copying production Supabase keys into `.env.local`
- [ ] Smoke test: signup → profile → generate plan → dashboard (first generate should not return **Failed to verify credits**)
- [ ] Confirm `/api/generate` completes within your Vercel plan timeout (long Claude calls may need Pro plan or streaming later)

---

## Summary

| Section | Result |
|---------|--------|
| next.config.js | ✅ Ready (no changes required) |
| package.json | ✅ Ready |
| App Router / Route Handlers | ✅ Ready |
| Framer Motion boundaries | ✅ Ready |
| Env vars | ⬜ Complete [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) in Vercel dashboard |

No code changes were required for this audit; the project is configured for Vercel App Router deployment.
