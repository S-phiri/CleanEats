'use client'

import { useState } from 'react'
import Image from 'next/image'

const GRADIENT =
  'linear-gradient(to bottom, rgba(12,12,10,0.3) 0%, rgba(12,12,10,0.85) 60%, rgba(12,12,10,0.97) 100%)'

/**
 * Optional Unsplash backdrop with dark gradient and attribution.
 * @param {{ image?: { url: string, photographerName: string, photographerUrl: string } | null, children: React.ReactNode, className?: string, as?: 'div' | 'button', buttonProps?: object }} props
 */
export default function MealCardBackground({
  image,
  children,
  className = '',
  as = 'div',
  buttonProps = {},
}) {
  const [loaded, setLoaded] = useState(false)
  const hasImage = !!image?.url
  const Tag = as

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
          <div className="absolute inset-0" style={{ background: GRADIENT }} />
        </div>
      )}

      <div className="relative z-10">{children}</div>

      {hasImage && image.photographerName && (
        <p className="absolute bottom-1.5 right-2 z-20 text-[10px] leading-tight opacity-40 max-w-[55%] text-right pointer-events-auto">
          Photo by{' '}
          <a
            href={image.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            onClick={as === 'button' ? (e) => e.stopPropagation() : undefined}
          >
            {image.photographerName}
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com/?utm_source=cleaneats&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            onClick={as === 'button' ? (e) => e.stopPropagation() : undefined}
          >
            Unsplash
          </a>
        </p>
      )}
    </Tag>
  )
}
