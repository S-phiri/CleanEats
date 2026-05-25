# CleanEats — Cursor Handoff Prompt

Paste this into Cursor as a single instruction. It encodes the full visual system, component vocabulary, and per-screen specs for the three pages I redesigned. Adapt to your Next.js + Tailwind stack.

---

## Context

You are redesigning **CleanEats** — an AI nutrition app for African athletes, part of the GRIND Ecosystem (Train · Compete · Eats). The product is currently a Next.js app with `app/page.js` (landing), `components/DashboardClient.js` (dashboard), and `components/PlanViewClient.js` (meal plan viewer).

The visual direction is a **dark, editorial, performance-grade** aesthetic — think premium athletic tooling, not lifestyle wellness. Glassmorphism on near-black, gold for premium/data, green for action/success only.

---

## Hard rules (do not break)

1. **No emoji as icons.** Use `lucide-react` exclusively. Stroke width 2, size 16/18/22/28 from a fixed scale.
2. **Touch targets ≥ 44×44px.** All buttons, day chips, slot cards, icon buttons.
3. **Contrast ≥ 4.5:1** for body text against any glass background. Re-test in dark mode (this is dark-only — verify on every gold tint).
4. **No hand-drawn product imagery / no emoji food icons.** Use Lucide glyphs (sunrise, sun, apple, moon) for meal slots; use diagonal-stripe placeholders for missing food photography.
5. **Tabular numerics** (`font-variant-numeric: tabular-nums`) on every metric, price, ring, KPI, chart axis, and ingredient quantity.
6. **No gradient backgrounds on whole sections.** Gradients are reserved for card-band headers and ring strokes.
7. **Respect `prefers-reduced-motion`** — disable transitions and seed animated values at target.
8. **Single primary CTA per screen.** Green pill only.

---

## Design tokens

Put these in `app/globals.css` as CSS custom properties on `:root`. Map to Tailwind via `theme.extend.colors` if you want utility access, but the CSS variables are the source of truth.

```css
:root {
  /* Surfaces */
  --base: #0C0C0A;
  --base-2: #131310;
  --base-3: #1A1A16;

  /* Ink */
  --ink: #F4EFE2;          /* primary text — warm cream */
  --ink-mute: #A7A293;     /* secondary */
  --ink-faint: #6F6B5E;    /* tertiary, axis labels */

  /* Gold (data + premium accents) */
  --gold: #C9A84C;
  --gold-soft: #E0C36B;
  --line: rgba(201, 168, 76, 0.18);
  --line-strong: rgba(201, 168, 76, 0.36);

  /* Green (CTA + success only) */
  --green: #7CB518;
  --green-soft: #9BD635;

  /* Glass */
  --glass-bg: linear-gradient(180deg, rgba(255, 247, 219, 0.04) 0%, rgba(255, 247, 219, 0.015) 100%);
  --glass-blur: 18px;

  /* Radii */
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 22px;
  --r-xl: 28px;

  /* Type */
  --f-display: "Syne", "Helvetica Neue", sans-serif;
  --f-body: "Instrument Sans", "Inter", system-ui, sans-serif;
  --f-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Body background uses a layered vignette, NOT a flat color:

```css
body {
  background:
    radial-gradient(1200px 600px at 85% -10%, rgba(201, 168, 76, 0.08), transparent 60%),
    radial-gradient(900px 500px at -10% 70%, rgba(124, 181, 24, 0.05), transparent 60%),
    var(--base);
}
```

### Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

**Display headings:** Syne 700/800 uppercase, `letter-spacing: -0.02em`, `line-height: 0.92–0.95`.
**Body:** Instrument Sans 400/500, base 16px, `line-height: 1.5`.
**Meta/labels:** JetBrains Mono 400, 10–11px, `letter-spacing: 0.12–0.16em`, uppercase. Use for eyebrows, KPI labels, axis ticks, status pills.

---

## Background performance grid (fixed, all pages)

A subtle gold lattice that bleeds behind every section.

```css
.bg-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.06;
  background-image:
    linear-gradient(var(--gold) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%);
}
.bg-tri {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><polygon points='40,8 72,72 8,72' fill='none' stroke='%23C9A84C' stroke-width='1'/></svg>");
  background-size: 80px 80px;
}
```

Render `<div class="bg-grid" />` and `<div class="bg-tri" />` at the top of your root layout. Set every page section to `position: relative; z-index: 1;` so content sits above.

---

## Core primitives (build these first)

### `Glass` card

```css
.glass {
  position: relative;
  background: var(--glass-bg), rgba(20, 20, 16, 0.6);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  backdrop-filter: blur(var(--glass-blur)) saturate(120%);
  overflow: hidden;
}
.glass.gold-edge {
  border-color: var(--line-strong);
  box-shadow:
    0 1px 0 rgba(255, 247, 219, 0.04) inset,
    0 24px 60px -30px rgba(201, 168, 76, 0.25);
}
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 247, 219, 0.06) 0%, transparent 22%);
}
```

### Card band header (gold gradient title strip)

```css
.card-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(201, 168, 76, 0.55) 0%, rgba(201, 168, 76, 0.18) 100%);
  border-bottom: 1px solid var(--line);
  color: #1A1408; /* dark ink on gold */
}
.card-band h3 {
  font-family: var(--f-display);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.01em;
  color: #1A1408;
  margin: 0;
}
.card-band .band-meta {
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(26, 20, 8, 0.7);
}
```

Every metric card has this band. Always include a band-meta label (date, count, source).

### Ring (animated SVG progress)

Build a `<Ring value={0–100} size={72} stroke={6} color="var(--green)" />` component. Two concentric `<circle>`s in SVG: track + stroke. Animate the stroke-dasharray via `useState` + `requestAnimationFrame`. **Critical**: seed the animated state with `target` (not 0) when `prefers-reduced-motion: reduce` is set, and add a 2-second `setTimeout` safety net that snaps to target if rAF gets throttled. The percentage label must be wrapped in a single `<span>` and use `display: flex; align-items: center; justify-content: center; white-space: nowrap;` — never grid place-items.

### Button

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; min-height: 44px; padding: 0 22px;
  border-radius: 999px; border: 1px solid transparent;
  font-family: var(--f-body); font-weight: 600; font-size: 14px;
  letter-spacing: 0.02em; text-transform: uppercase;
  white-space: nowrap; /* required — uppercase + letter-spacing causes wrap */
  transition: transform 180ms ease, background 180ms ease;
}
.btn-primary { background: var(--green); color: #0E1A03; }
.btn-primary:hover { background: var(--green-soft); }
.btn-ghost { background: transparent; color: var(--ink); border-color: var(--line-strong); }
```

### Area chart

SVG-only, no chart library. Smooth bezier path through points, gradient fill underneath using the green accent. Hover line + value tooltip in a small dark card. Y-axis ticks in JetBrains Mono 10px var(--ink-faint), X-axis labels uppercase. Gridlines `rgba(201,168,76,0.10)` dashed 3-4.

---

## TopBar (shared across all 3 pages)

```
[ CLEANEATS ]   ·   A GRIND Ecosystem Product   [Train] [Compete] [Eats]            [search] [bell] [avatar]
```

- `CLEAN` cream, `EATS` green. Syne 700, letter-spacing 0.04em.
- Ecosystem text Instrument Sans 13px, ink-mute. Pills are mono 11px uppercase inside `border: 1px solid var(--line)` rounded-full chips. The "Eats" pill uses `border-color: var(--line-strong); color: var(--gold-soft);` to mark current product.
- Search + bell are 44×44 icon-buttons with circular gold-tinted border. Bell has a green dot for unread.
- Avatar is a 44×44 circle with a 135° gradient `var(--gold) → #6E551A`, dark ink initials inside.
- On landing only, swap the icon buttons + avatar for `Log in` (ghost) + `Sign up` (green pill).

The topbar is `position: sticky; top: 0; z-index: 30;` with `backdrop-filter: blur(14px)` and a 1px gold-tinted bottom border.

---

## Screen 1 — Landing (`app/page.js`)

### Hero

- **Eyebrow pill**: small green dot + "Wednesday · 13 May · Lusaka" (dynamic date — `new Date()` localized).
- **H1**: three lines, line-height 0.92, font-size `clamp(40px, 6.4vw, 96px)`, Syne 800.
  - Line 1: "Fuel the grind." — gold gradient text fill via `background-clip: text`:
    ```css
    background: linear-gradient(180deg, #E8CE7A 0%, #C9A84C 55%, #8E7327 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 8px 24px rgba(201,168,76,0.25));
    ```
  - Line 2: "Precision nutrition" — cream `var(--ink)`.
  - Line 3: "for African athletes." — cream `var(--ink)`.
- **Subhead**: "Localized meal intelligence, calibrated to your market basket and recovery window — built for performance in Lusaka, Nairobi, Johannesburg and beyond." Max 52ch.
- **CTAs**: `[Start your plan] (green pill, zap icon)` + `[Week view] (ghost outline, calendar-days icon)`.
- **Trust strip** below CTAs, gold-bordered top: `2,400+ athletes · 14 federations · 3 markets`.
- **Right column**: render an actual Performance Metrics glass card — TDEE 2,850 kcal with green 95% ring, Protein 175g with 73% gold ring, Hydration 3.2L with 80% green ring, and a green-pill footer "Plan synced · Lusaka basket · 412 ZMW today". This is the **same component** used on the dashboard — don't re-mock it.

### Features (3 cards)

```
01 · Plan — Localized meal intelligence — Plans built from real basket prices and culturally grounded staples — nshima, ugali, injera, pap. No imported substitutes.
02 · Train — Synced to your session load — Macros recalibrate against your training block. Refuel windows, glycogen loads, recovery meals on one timeline.
03 · Cost — Built for the budget — Daily plan cost tracked in ZMW, KES, ZAR. Swap any ingredient and the basket recomputes — performance and price in one view.
```

Card: glass with `border: 1px solid var(--line-strong)`, 44×44 rounded icon box (gold-tinted bg), mono eyebrow `01 · PLAN` in gold, Syne 700 22px title, ink-mute body 14.5px. Hover: `translateY(-2px)` + gold-glow shadow.

### Persona card

Two-column glass: left holds a Syne 600 24–30px pull-quote (uses a giant gold `"`), athlete photo placeholder + name "Chipo Mwansa" + role "800m · Zambia National Squad". Right holds 2×2 KPI grid: `−4% 800m PB`, `+9% Plan adherence`, `−18% Weekly basket cost`, `96% Sessions recovered`.

### Sign-up section (`id="signup"`)

Two columns. Left: eyebrow + Syne 700 H2 "Train in your city. / Fuel from your market." + body + 4-item check list. Right: glass form with fields `Full name`, `Email` (regex validate `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), `City` (Lusaka / Nairobi / Johannesburg / Addis Ababa / Lagos / Kampala), `Sport` (Track & Field / Football / Cycling / Basketball / Rugby / Boxing / Other). Inputs 48px tall, dark fill, gold focus border. Validate on `onBlur`, show errors below field in `#E07B5B` mono. On valid submit, swap form for a success state with green check, "You're in, {firstName}.", and a link "Preview your dashboard".

### Footer

Wordmark + `© 2026 GRIND Ecosystem · Train · Compete · Eats` on the left. Right: Syne 600 mantra "Fuel the grind. Localized meal intelligence — outcomes over features." Top 1px gold-tinted divider.

---

## Screen 2 — Dashboard (`components/DashboardClient.js`)

### Header

Eyebrow "Wednesday · 13 May · Lusaka". H1 Syne 700 `clamp(36px, 5vw, 56px)`: "Fuel today, / {athleteFirstName}." Right-aligned: ghost `Week view` button + primary `Start session` button.

### Grid (12-col, gap 20px)

**col-5**: `<PerformanceMetrics />` card
- Band "Performance Metrics" · meta "Day · 13 May"
- 4 metric rows: TDEE (2,850 kcal, 95% green ring), Protein (175g, 73% gold ring, gradient bar), Carbohydrate (348g, 55% gold ring, bar), Hydration (3.2L, 80% green ring, bar).
- Each row: mono label, Syne 700 28px tabular value with mono unit suffix, mono sub-line ("128 / 175g · 47g remaining"), bar (gold→green gradient fill on `rgba(255,247,219,0.06)` track).

**col-7**: stacked

**`<WeekPlan />`** card
- Band "This Week's Plan" · "Cycle 3 · Build"
- Top row: mono eyebrow "Overview" + Syne 22px "26 meals planned · 4 locked today" + prev/next icon buttons
- 7-day strip: day cells `min-height: 88px`, Syne 22px tabular day number, mono lbl, meal-count dots (4px gold circles). Today gets a 6px green dot top-right with glow. Active day has green-tinted bg + green border.
- KPI strip (3 tiles): "Weekly avg kcal 2,790 · ▲ 3% vs last week" / "Plan cost 412 ZMW · ▼ 2.1%" / "Adherence 92% · 12/13 meals on-plan"

**`<MarketPriceIndex />`** card
- Band "Market Price Index" · "ZMW · Lusaka basket"
- Top: mono eyebrow "Localized cost · current plan" + Syne 32px tabular value `162.00` + mono "ZMW / DAY" + delta % (green-soft if down, `#E07B5B` if up).
- Right of header: W / M / Q segmented tabs (pill-in-pill, active = ink fill on base text).
- Area chart 620×210, hover scrubbing with tooltip card.
- Footer: legend `[green dot] Daily basket cost · Source: ZMW retail · Soweto Market · refreshed 06:00` + small ghost "Export CSV" button.

**col-12**: `<MealList />` — 4 rows of meal cards
- 64px striped-gold placeholder thumb with Lucide icon (`sunrise`, `sun`, `apple`, `moon`)
- Mono tag `BREAKFAST · 06:30` in gold, Syne 17px title, ink-mute 13px sub
- Right: status pill — done shows 28px green circle with check; active shows green "NOW" + chevron; queued shows just chevron
- Click any meal opens a right-side drawer (sliding from right, 440px wide, gold border)

### Recipe drawer

Gold gradient card-band header with meal title (Syne 700 22px dark ink, mono tag above), close button. Body: 4-up macro tiles (kcal/protein/carbs/fat), mono eyebrow "Ingredients · Lusaka pricing", dashed-divider rows with ingredient name + mono gold price `+22.50 ZMW`, mono eyebrow "Coach note", short coaching paragraph, gold horizontal hairline, two-button footer: ghost `Add to list` + primary `Mark complete`.

---

## Screen 3 — Meal Plan Viewer (`components/PlanViewClient.js`)

### Header

Eyebrow "Cycle 3 · Build block · Lusaka, Zambia". H1 Syne 800 `clamp(34px, 4.5vw, 56px)`: "Day {n}: Lusaka / Performance Plan". Right-aligned: KPI tile `Day total cost {x} ZMW · ▼ 2.1% vs avg` + ghost `Share` + primary `Build shopping list`.

### Day chips (horizontally scrollable on mobile)

7 chips, each `min-width: 92px`, glass-tinted, Syne 22px day number, mono day label, mono block tag (`Build · Volume`, `Threshold`, `Recovery`, etc.) below. Active chip = green-tinted bg, green-soft number, green label.

### Two-column grid (1fr 1.2fr, stacks below 1080px)

**Left** — `<SlotList />` glass card with 4 slot cards (Breakfast → Dinner):
- Grid: 100px striped thumb (Lucide icon in gold, mono slot label bottom-left) | meal text block | right meta (status pill + prep time + chevron)
- States: `done` (gold-tinted), `on` (selected, green-tinted), default
- Slot tag: Syne 700 13px uppercase tracked, gold (or green-soft when active)
- Slot title: Syne 700 19px

**Right** — `<RecipePanel />` glass card, **sticky** at `top: 96px`:
- 16:9 hero panel with diagonal-stripe gold/green placeholder, "LUNCH" gold mono pill bottom-left, "32 min" clock pill top-right
- Mono eyebrow + Syne 28px meal title (not uppercase, balanced wrap)
- 4-up macro tiles
- Section tabs: `Ingredients` / `Shopping ({n})` / `Coach note`
- Ingredients tab: dashed-divider rows with mono qty (64px col) · name · gold mono price; gold "Meal total" totals bar at bottom
- Shopping tab: 22px rounded checkbox (transparent → green fill with check on toggle), strike-through label when checked, right-side mono price
- Notes tab: bordered glass note panel
- Hairline divider, two-button footer: ghost `Swap ingredient` + primary `Mark as completed` (disables to "Completed" with check)

---

## Interaction & motion

- **Press feedback**: every button scales to `0.98` on `:active`. Cards scale `0.997`.
- **Transitions**: 160–220ms. Color/border on hover, transform on press. No layout animations.
- **Animations**: rings count up from 0 → target over 1.2s with cubic ease-out. Hover scrub line on chart fades in instantly.
- **Reduced motion**: seed animated states at target, disable transitions globally.
- **Drawer**: slide in from right with `cubic-bezier(.2,.7,.2,1)` 280ms. Backdrop fades 220ms.

---

## Accessibility checks (must pass)

- All icon-only buttons have `aria-label`.
- Inputs have visible `<label>` (not placeholder-only).
- Errors live in a `role="alert"` region directly below the field.
- Tab order matches visual order.
- Focus rings: 2px solid `var(--green-soft)` with `outline-offset: 2px`.
- Color is never the sole signal — pair with icon or text (e.g., green NOW pill includes the word "NOW").
- Charts have a screen-reader summary `<p>` describing the trend.
- Touch targets ≥ 44×44.

---

## File structure (suggested)

```
app/
  globals.css                # tokens + base styles
  layout.tsx                 # injects fonts + bg-grid + bg-tri
  page.tsx                   # landing
  dashboard/page.tsx
  plan/[day]/page.tsx
components/
  primitives/
    Glass.tsx
    CardBand.tsx
    Button.tsx
    Ring.tsx
    AreaChart.tsx
    IconBtn.tsx
    Pill.tsx
  layout/
    TopBar.tsx               # shared, current={'landing'|'dashboard'|'plan'}
    Footer.tsx
  landing/
    Hero.tsx
    HeroPreviewCard.tsx      # reuses PerformanceMetrics
    Features.tsx
    Persona.tsx
    SignUpForm.tsx
  dashboard/
    PerformanceMetrics.tsx
    WeekPlan.tsx
    MarketPriceIndex.tsx
    MealList.tsx
    MealDrawer.tsx
  plan/
    PlanHead.tsx
    DayChips.tsx
    SlotList.tsx
    RecipePanel.tsx
```

---

## Sample copy (use verbatim)

**Hero subhead**: "Localized meal intelligence, calibrated to your market basket and recovery window — built for performance in Lusaka, Nairobi, Johannesburg and beyond."

**Persona quote**: "The plan reads my training week like a coach does. It costs me less than buying ingredients at random — and my times dropped 4% in the build block."

**Mantra (footer)**: "Fuel the grind. Localized meal intelligence — outcomes over features."

**Meal coach notes** — write tight, coach-voice, 1–2 sentences each:
- *Oats & Baobab Smoothie*: "Pre-soak the oats overnight to lower the GI. Drink 90 minutes before your morning session."
- *Spicy Nshima & Grilled Tilapia*: "Grill the tilapia over high heat with paprika and ginger. Pair with 500ml water + electrolytes."
- *Roasted Groundnuts & Mango*: "Roast the groundnuts dry, then toss with a pinch of sea salt. Eat 30 minutes before evening tempo work."
- *Beef Stew with Sweet Potato*: "Slow-simmer the beef for 40+ minutes to extract collagen. Eat at least 2 hours before sleep."

---

## Delivery checklist

- [ ] All three pages render with the bg-grid + bg-tri behind every section
- [ ] Topbar is sticky, sharp across breakpoints, no nav pill wrap
- [ ] Hero H1 line 1 is the gold gradient text fill (not a box), lines 2–3 are cream
- [ ] Right of hero is the live PerformanceMetrics card — same component as the dashboard
- [ ] Every metric card has a gold gradient card-band header with band-meta
- [ ] Rings animate, but seed at target with reduced-motion + 2s rAF safety
- [ ] Area chart hover tooltip works, range tabs swap data
- [ ] Drawer opens from the right, backdrop fades, Esc closes
- [ ] Sign-up validates on blur, success state has correct first name
- [ ] Meal Plan day chips scroll horizontally on mobile without breaking layout
- [ ] Slot cards reflect status changes (active / done / queued) live
- [ ] All buttons have `white-space: nowrap`
- [ ] Lighthouse: contrast ≥ 4.5:1 on every text/bg pair, touch targets ≥ 44px

When you're done, screenshot all three pages at 1440 desktop + 390 mobile and post for review.
