/**
 * Shared dark surface tokens for client pages.
 */

export function buildPageTokens(_isDark) {
  return {
    bg: 'bg-base',
    surface: 'bg-base-2',
    s2: 'bg-base-3',
    border: 'border-[var(--line)]',
    border2: 'border-[var(--line-strong)]',
    text: 'text-ink',
    muted: 'text-ink-mute',
    soft: 'text-gold-soft',
    input: 'ce-input',
    chip: 'chip',
    chipOn: 'chip on',
  }
}

export function buildPlanViewTokens(_isDark) {
  const base = buildPageTokens()
  return {
    ...base,
    accentBtn: 'btn btn-primary',
    tabInactive: 'text-ink-mute hover:text-ink',
    greenBanner: 'bg-green/10 border border-green/40 text-green-soft',
  }
}
