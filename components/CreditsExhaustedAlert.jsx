'use client'

import Link from 'next/link'
import { CREDITS_EXHAUSTED_MESSAGE } from '../lib/generate-api-errors'

export default function CreditsExhaustedAlert({ message = CREDITS_EXHAUSTED_MESSAGE }) {
  return (
    <span>
      {message}{' '}
      <Link href="/upgrade" className="text-green hover:underline font-medium">
        Upgrade to Pro
      </Link>
    </span>
  )
}
