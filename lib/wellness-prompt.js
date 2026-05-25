import { WELLNESS_PILLARS } from './profile-options'

const byId = Object.fromEntries(WELLNESS_PILLARS.map(p => [p.id, p.label]))

function wellnessSupportInstructions() {
  return `
WELLNESS SUPPORT (always include in JSON — supportive only, not medical advice):
- intro: one short sentence tying the plan to their goal.
- foodIdeas: optional array; if the user selected wellness pillars, include 1–2 blocks { "focus", "label", "items"[] } with concrete whole foods. If no pillars, use [] or omit.
- supplements: 2–4 OPTIONAL items max—nutrients people commonly discuss for their goal (e.g. vitamin D, magnesium, omega-3). Each { "name", "note" (why people mention it), "caution" (e.g. meds/pregnancy—see clinician) }. Never diagnose or prescribe.
- hydratingDrinks: 2–3 low-sugar ideas (e.g. infused water, veg juice, small smoothie, kefir)—brief "note" each; not meal replacements.
Keep the main meal plan about macros; this section is secondary.
`
}

/**
 * Pillars add focus; supplements + drinks are always requested in JSON.
 */
export function buildWellnessPromptSection(pillarIds) {
  const base = wellnessSupportInstructions()
  if (!Array.isArray(pillarIds) || pillarIds.length === 0) return base
  const labels = pillarIds.map(id => byId[id] || id).join('; ')
  return `${base}
USER WELLNESS PILLARS (weight foodIdeas toward): ${labels}.
`
}

export function buildArchetypePromptBlock(archetype) {
  if (!archetype || !archetype.label) return ''
  return `
DERIVED PLAN FIT (from their answers — do not show internal codes or the word "archetype"):
- ${archetype.summary}
- Reflect this in planSubtitle or planSummary in plain language.
`
}
