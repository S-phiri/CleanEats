# CleanEats — Precision Meal Planning

Next.js app: Supabase auth + profiles, AI meal plans (Anthropic), saved plans, plan viewer with shopping list and regenerate flow.

## What’s implemented

| Feature | Location |
|--------|-----------|
| Landing | `app/page.js` |
| Login / signup / OAuth callback | `app/login`, `app/signup`, `app/auth/callback` |
| Protected routes | `middleware.js` (`/dashboard`, `/profile`, `/plan`, `/upgrade`) |
| 5-step profile + generate | `app/profile/page.js` → `POST /api/generate` → saves `plans` row |
| Generate API (auth + tier limit) | `app/api/generate/route.js` |
| Dashboard + plan list | `app/dashboard/page.js` |
| Plan viewer (tabs, theme, regenerate) | `app/plan/[id]/page.js`, `components/PlanViewClient.js` |
| Upgrade placeholder (no Stripe yet) | `app/upgrade/page.js` |
| Supabase helpers | `lib/supabase-server.js`, `lib/supabase-browser.js` |
| Countries / TDEE | `lib/utils.js` |
| Next dev shim | `scripts/fix-next-parseurl.js` (runs on `npm install` via `postinstall`) |

Root layout uses `export const dynamic = 'force-dynamic'` so `next build` works without Supabase env at build time (pages are rendered on demand).

## Stack

- **Next.js 14** (App Router), **React 18**
- **Supabase** (Postgres + Auth)
- **Tailwind CSS**
- **Anthropic** (Claude, via server route only)

---

## Run locally (step-by-step)

### 1. Install dependencies

```bash
npm install
```

**Why:** Pulls Next, React, Supabase clients, Tailwind toolchain so the dev server and build can run.

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Wait until the database is ready.

**Why:** The app stores `profiles` and `plans` and uses Supabase Auth for users.

### 3. Apply the database schema

1. Supabase → **SQL Editor** → New query.
2. Paste everything in `supabase-schema.sql` and run it.

**Why:** Creates `profiles`, `plans`, RLS policies, and the signup trigger so new users get a profile row.

### 4. Configure Auth URLs (local)

Supabase → **Authentication** → **URL configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** include `http://localhost:3000/auth/callback`

**Why:** Email confirmation and OAuth return the browser to your app; wrong URLs cause “redirect mismatch” errors.

### 5. (Optional) Google sign-in

Supabase → **Authentication** → **Providers** → Google: enable and add Client ID/Secret.  
In Google Cloud Console, authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.

**Why:** The login/signup pages call `signInWithOAuth`; without this, Google buttons will error.

### 6. Environment variables

```bash
copy .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # anon public key
ANTHROPIC_API_KEY=sk-ant-...           # never NEXT_PUBLIC_ — server only
```

**Why:** The browser needs the public Supabase URL/key; the server needs the Anthropic key for `/api/generate`. Keys in `NEXT_PUBLIC_*` are exposed to the client — never put Anthropic there.

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Why:** `next dev` serves the App Router with hot reload.

### 7b. If you see “URL and Key are required” (Supabase)

That comes from **middleware** when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing. **Create `.env.local`** in the project root (same folder as `package.json`), add both keys, then **restart** `npm run dev`. Next only reads env files when the process starts.

In **development only**, if those vars are missing, middleware now **skips** Supabase (you can browse the marketing page) but **login, dashboard, and API calls will not work** until `.env.local` is filled in.

### 7c. If you see `parseUrl is not a function` (dev WebSocket / HMR)

Some **Next.js 14.2.35** builds reference `parseUrl` in `dist/lib/url.js` but do not ship it. After every `npm install`, **`postinstall`** runs `scripts/fix-next-parseurl.js`, which adds a tiny `parseUrl` shim. If errors persist, run manually:

```bash
node scripts/fix-next-parseurl.js
```

Then restart `npm run dev`.

### 7d. Sign-in fails (400 / “Invalid login” / endless loading)

1. **One folder only:** Run the app from the folder that contains your real `.env.local` (e.g. `C:\dev\CleanEats`). Opening the project from two paths can confuse which env file loads.
2. **Verify URL + key belong to the same project:**

   ```bash
   npm run verify:env
   ```

3. In **Supabase → Authentication → Users:** find your email → ensure the account exists and **Email Confirmed** is set (or turn off **Confirm email** under **Providers → Email** while testing).
4. **Wrong password:** use **Forgot password** from Supabase Auth UI or reset the user password in the dashboard.
5. In the browser **Network** tab, inspect the failing request to `...supabase.co/auth/v1/token` and read the JSON **error_description**.

### 8. Sanity check

1. Sign up → confirm email if required → log in.
2. Complete **Profile** → **Generate My Plan** (uses credits on free tier).
3. Open the plan from **Dashboard**; try tabs and (optionally) **Regenerate with what I have**.

---

## Build for production (local)

```bash
npm run build
npm start
```

**Why:** `build` checks that all routes compile; `start` runs the optimized server like production.

---

## Deploy to Vercel (beta)

1. Push the repo to GitHub (or connect Git in Vercel).
2. **New project** → import repo → framework Preset: Next.js.
3. **Environment variables** (same three as `.env.local`) for Production (and Preview if you want previews to work).
4. Deploy.

Then in Supabase **URL configuration**, set:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

**Why:** Production hostname must be allowed or auth redirects fail after deploy.

---

## Not built yet (post-beta ideas)

- Stripe (or other) checkout + webhook → set `profiles.tier` to `pro`
- DPO / mobile money (region-specific)
- PDF export
- Scheduled job for monthly `generations_this_month` reset (see comments in `supabase-schema.sql`)
- Stricter alignment of “3-day vs 5-day” plans with tier in prompts/API

---

## Security note

This project targets **Next.js 14.2.35** for known RSC security fixes. Run `npm install` after pulling to stay on the locked version.
