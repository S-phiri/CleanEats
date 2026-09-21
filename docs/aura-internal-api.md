# Aura internal API (CleanEats)

Server-to-server endpoints for the **Aura WhatsApp bot**. Not for browsers or end users.

## Environment variables

```env
# Required — long random string; share only with Aura (never commit)
CLEANEATS_AURA_SECRET=

# Required for these routes — Supabase service role (bypasses RLS)
# Use SUPABASE_SERVICE_ROLE_KEY or SUPA_BASE_SERVICE_ROLE_KEY (Lovable)
SUPABASE_SERVICE_ROLE_KEY=

# Seed script only (optional)
CLEANEATS_AURA_SEED_EMAIL=you@example.com
CLEANEATS_AURA_SEED_PHONE=27646604490
```

Generate a secret: `openssl rand -hex 32`

**Staging** must be deployed to a **public HTTPS URL** (Vercel preview/production). Aura cannot call `localhost`.

Run migration: [`supabase/migrations/20260921_aura_internal_api.sql`](../supabase/migrations/20260921_aura_internal_api.sql) in Supabase SQL Editor.

Seed your phone: `node scripts/seed-aura-phone.js`

## Auth

Every request:

```http
Authorization: Bearer <CLEANEATS_AURA_SECRET>
```

Missing/wrong token → `401 { "error": "unauthorized" }`

## Base URL

Replace with your deployed host, e.g. `https://cleaneats.vercel.app`

## Endpoints

### GET `/api/internal/aura/profile?phone=2764…`

Digits only (no `+`). Response `200`:

```json
{
  "user_id": "uuid",
  "first_name": "Simba",
  "phone": "27646604490",
  "fasting": false,
  "fasting_until": null,
  "today": {
    "date": "2026-09-21",
    "meal_type": "lunch",
    "dish": "Grilled Tilapia with Nshima & Rape"
  }
}
```

- `404` — `{ "error": "not_found" }` unknown phone
- `today.dish` — `null` if no plan/meal

### POST `/api/internal/aura/fasting`

```json
{ "phone": "27646604490", "fasting": true, "until": "2026-09-28" }
```

`until` optional (`YYYY-MM-DD` or null). Returns updated profile JSON (`200`).

### POST `/api/internal/aura/swap-meal`

```json
{ "phone": "27646604490", "meal_type": "lunch", "dish": "beans and rice" }
```

Updates today’s (or current weekday’s) meal name on the user’s latest plan. Returns profile JSON (`200`).

## Example curl

```bash
export BASE=https://your-staging-url.vercel.app
export SECRET=your_cleaneats_aura_secret

curl -s -H "Authorization: Bearer $SECRET" \
  "$BASE/api/internal/aura/profile?phone=27646604490" | jq

curl -s -X POST -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" \
  -d '{"phone":"27646604490","fasting":true,"until":"2026-09-28"}' \
  "$BASE/api/internal/aura/fasting" | jq

curl -s -X POST -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" \
  -d '{"phone":"27646604490","meal_type":"lunch","dish":"beans and rice"}' \
  "$BASE/api/internal/aura/swap-meal" | jq
```
