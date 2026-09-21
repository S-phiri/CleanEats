# CleanEats × Aura — closed WhatsApp test

**Mode:** closed test, not launch. **All WhatsApp sends and webhooks run in Aura**, not this repo.

**Business number:** +27 64 660 4490 (CleanEats tenant on Aura)

---

## What this repo does NOT contain

- No Meta developer app, webhook, templates, or `/api/whatsapp/*`
- No `wa.me` founder-as-bot
- No homepage or product copy promising WhatsApp (until Aura signs off)

Keep using the **website as today**: profile, plans, `/api/generate`, DPO.

---

## Before Aura sends anything

### 1. Test phones (2–5 total)

| Name | E.164 phone | Country | Written opt-in date | Notes |
|------|-------------|---------|---------------------|-------|
| You | | | | First receiver |
| | | | | |
| | | | | |

Copy [`closed-test-allowlist.example.json`](./closed-test-allowlist.example.json) → `closed-test-allowlist.json` (gitignored), fill in, share **only with Aura** for the allowlist.

**Rules**

- SA (+27) or ZM (+260) numbers OK
- WhatsApp installed; happy to receive tests and reply
- **No** scraping CleanEats.fit signups — volunteers only

### 2. Written opt-in (per tester)

Each person agrees in writing (email, WhatsApp, or doc) to something like:

> I agree to receive **meal / check-in test messages** from the **CleanEats** WhatsApp business name during the closed test. I know messages are experimental.

Keep a copy for your records.

---

## When Aura says a send is going out

### Your phone first

1. Wait for Aura to tell you **when** to expect the message.
2. Receive **one template** message.
3. **Screenshot:** delivered / failed / exact wording → send to Aura.
4. **Reply** with normal text, e.g. `lunch was fine` — confirms webhook (and later coach).
5. **STOP:** reply **only after Aura confirms opt-out is live** — before that it does nothing useful.

Repeat steps 2–4 with 1–2 other opted-in testers once the first loop works.

### If a send fails

Report to Aura:

- **Exact time** (with timezone)
- **Destination phone** (E.164)

Do **not** open a CleanEats feature request for infra failures.

---

## Blocked until Aura says “loop is safe”

- Web phone + opt-in UI on CleanEats
- Homepage / nav “Message us on WhatsApp”
- WhatsApp display name change to Grind
- Blasts beyond this allowlist
- Syncing site opt-in to Aura contacts

---

## Aura-side templates (names must match catalog)

- `cleaneats_meal_reminder`
- `cleaneats_checkin`
- `cleaneats_checkin_daily`

---

## Related plan

Cursor plan: **CleanEats as Aura guinea pig** (`whatsapp_meta_integration_a9884098.plan.md`)
