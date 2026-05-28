/** Shared handling for /api/generate credit exhaustion (402). */

export const CREDITS_EXHAUSTED_MESSAGE =
  'You have used all your free credits this month. Upgrade to Pro for unlimited generations.'

export function isCreditsExhausted(response, data) {
  return response?.status === 402 || data?.error === 'CREDITS_EXHAUSTED'
}

export function creditsExhaustedMessage(data) {
  const msg = data?.message?.trim()
  if (msg && msg.toLowerCase() !== 'no credits remaining') {
    return msg
  }
  return CREDITS_EXHAUSTED_MESSAGE
}

/** @returns {{ message: string } | null} */
export function getCreditsExhaustedPayload(response, data) {
  if (!isCreditsExhausted(response, data)) return null
  return { message: creditsExhaustedMessage(data) }
}
