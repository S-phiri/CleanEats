'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'

const GRADIENTS = {
  default:
    'linear-gradient(to bottom, rgba(12,12,10,0.3) 0%, rgba(12,12,10,0.85) 60%, rgba(12,12,10,0.97) 100%)',
  /** Bottom 60% darkens for readable overlaid text */
  card:
    'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)',
}

/**
 * Optional Unsplash backdrop with dark gradient and optional attribution.
 * @param {{ image?: { url: string, photographerName: string, photographerUrl: string } | null, children: React.ReactNode, className?: string, as?: 'div' | 'button', buttonProps?: object, overlay?: 'default' | 'card', showAttribution?: boolean }} props
 */
export default function MealCardBackground({
  image,
  children,
  className = '',
  as = 'div',
  buttonProps = {},
  overlay = 'default',
  showAttribution = true,
}) {
  const [loaded, setLoaded] = useState(false)
  const [attributionOpen, setAttributionOpen] = useState(false)
  const hasImage = !!image?.url
  const Tag = as

  const attributionLabel = image?.photographerName
    ? `Photo by ${image.photographerName} on Unsplash`
    : 'Photo on Unsplash'

  function stopParentActivation(e) {
    if (as === 'button') e.stopPropagation()
  }

  const sharedClass = `relative overflow-hidden ${className}`

  return (
    <Tag className={sharedClass} {...(as === 'button' ? buttonProps : {})}>
      {hasImage && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden
        >
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(false)}
          />
          <div
            className="absolute inset-0"
            style={{ background: GRADIENTS[overlay] || GRADIENTS.default }}
          />
        </div>
      )}

      {!hasImage && (
        <div
          className="absolute inset-0 bg-base-3"
          style={{ background: GRADIENTS.card }}
          aria-hidden
        />
      )}

      <div className="relative z-10 h-full">{children}</div>

      {showAttribution && hasImage && image.photographerName && (
        <div
          className="absolute bottom-1.5 right-1.5 z-20 pointer-events-auto"
          onMouseEnter={() => setAttributionOpen(true)}
          onMouseLeave={() => setAttributionOpen(false)}
        >
          <button
            type="button"
            className="flex h-4 w-4 items-center justify-center rounded-sm bg-black/45 text-white/75 hover:text-white hover:bg-black/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            aria-label={attributionLabel}
            aria-expanded={attributionOpen}
            onClick={(e) => {
              stopParentActivation(e)
              setAttributionOpen((open) => !open)
            }}
          >
            <Camera size={10} strokeWidth={2} aria-hidden />
          </button>

          <div
            role="tooltip"
            className={`absolute bottom-full right-0 pb-1 w-max max-w-[min(240px,70vw)] transition-opacity ${
              attributionOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
            }`}
          >
            <p className="rounded-md border border-[var(--line)] bg-base-2/95 px-2.5 py-1.5 text-[10px] leading-snug text-ink-mute shadow-lg backdrop-blur-sm">
              Photo by{' '}
              <a
                href={image.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-ink hover:text-green-soft"
                onClick={stopParentActivation}
              >
                {image.photographerName}
              </a>{' '}
              on{' '}
              <a
                href="https://unsplash.com/?utm_source=cleaneats&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-ink hover:text-green-soft"
                onClick={stopParentActivation}
              >
                Unsplash
              </a>
            </p>
          </div>
        </div>
      )}
    </Tag>
  )
}
