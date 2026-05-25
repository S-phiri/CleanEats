/**
 * Derives a human-readable "plan profile" from collected facts (no user-facing archetype picker).
 * Used for copy, prompts, and stored analytics-style key — not shown as a choosable category.
 */

const GOAL_LABELS = {
  losefat: 'Fat loss',
  recomp: 'Body recomposition',
  leanbulk: 'Lean bulk',
  musclegain: 'Muscle gain',
  maintain: 'Maintenance & performance',
  athletic: 'Athletic performance',
  gut: 'Gut health & longevity',
}

const ACTIVITY_LABELS = {
  none: 'light training',
  low: 'training 1–2×/week',
  mod: 'training 3–4×/week',
  high: 'training 5–6×/week',
  vhigh: 'daily or twice-daily training',
}

const AGE_BAND_LABELS = {
  'under-25': 'under 25',
  '25-39': '25–39',
  '40-54': '40–54',
  '55+': '55+',
}

function ageBandFromAge(age) {
  const a = parseInt(age, 10)
  if (Number.isNaN(a) || a <= 0) return '25-39'
  if (a < 25) return 'under-25'
  if (a < 40) return '25-39'
  if (a < 55) return '40-54'
  return '55+'
}

/**
 * @param {object} profile — fields: age, sex, goal, activity
 * @returns {{ key: string, label: string, ageBand: string, summary: string, goalLabel: string, activityLabel: string }}
 */
export function inferArchetype(profile) {
  const { age, sex, goal, activity } = profile || {}
  const ageBand = ageBandFromAge(age)
  const goalLabel = GOAL_LABELS[goal] || 'Your goal'
  const activityLabel = ACTIVITY_LABELS[activity] || 'your activity level'
  const ageWords = AGE_BAND_LABELS[ageBand] || ageBand

  const sexPart =
    sex === 'Male' || sex === 'Female' ? sex : null
  const labelParts = [goalLabel, ageWords]
  if (sexPart) labelParts.push(sexPart)
  const label = labelParts.join(' · ')

  const key = `${goal || 'unknown'}_${ageBand}_${sexPart || 'ns'}`

  const summary =
    `Calories and protein are calibrated for ${goalLabel.toLowerCase()} with ${activityLabel}, ` +
    `for someone in the ${ageWords} range${sexPart ? ` (${sexPart})` : ''}.`

  return {
    key,
    label,
    ageBand,
    summary,
    goalLabel,
    activityLabel,
  }
}
