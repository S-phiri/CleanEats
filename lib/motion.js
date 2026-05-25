'use client'

import { useReducedMotion } from 'framer-motion'

/** Premium ease — smooth deceleration */
export const easeOut = [0.22, 1, 0.36, 1]

/** Tween for hovers (avoid bouncy springs on CTAs) */
export const premiumHoverTransition = {
  type: 'tween',
  duration: 0.38,
  ease: easeOut,
}

/** Subtle press / hover — pair with `transition={premiumHoverTransition}` on the same `motion.*` */
export const buttonTap = { whileTap: { scale: 0.988 } }
export const buttonHover = { whileHover: { scale: 1.012, y: -1 } }

/**
 * Shared motion variants + reduced-motion-safe transitions.
 * Use in client components only.
 */
export function useMotionVariants() {
  const reduce = useReducedMotion()
  const none = reduce ? { duration: 0 } : false

  return {
    reduce,
    ease: easeOut,

    /** `whileInView` — spread onto motion.section / motion.div */
    scrollFadeUp: {
      initial: { opacity: 0, y: reduce ? 0 : 14 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-48px 0px -24px 0px', amount: 0.2 },
      transition: reduce ? { duration: 0 } : { duration: 0.55, ease: easeOut },
    },

    /** Stagger for child cards in a grid */
    cardStagger: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: none || { staggerChildren: 0.08, delayChildren: 0.04 },
      },
    },

    cardRise: {
      hidden: { opacity: 0, y: reduce ? 0 : 18 },
      visible: {
        opacity: 1,
        y: 0,
        transition: none || { duration: 0.52, ease: easeOut },
      },
    },

    authPageContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: none || { staggerChildren: 0.065, delayChildren: 0.1 },
      },
    },

    authFadeUp: {
      hidden: { opacity: 0, y: reduce ? 0 : 18 },
      visible: {
        opacity: 1,
        y: 0,
        transition: none || { duration: 0.46, ease: easeOut },
      },
    },

    authCard: {
      hidden: { opacity: 0, y: reduce ? 0 : 22, scale: reduce ? 1 : 0.97 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: none || { duration: 0.52, ease: easeOut },
      },
    },

    authAlert: {
      initial: { opacity: 0, y: reduce ? 0 : -8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: reduce ? 0 : -6 },
      transition: reduce ? { duration: 0 } : { duration: 0.22, ease: easeOut },
    },

    dashboardContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: none || { staggerChildren: 0.085, delayChildren: 0.05 },
      },
    },

    dashboardFadeUp: {
      hidden: { opacity: 0, y: reduce ? 0 : 22 },
      visible: {
        opacity: 1,
        y: 0,
        transition: none || { duration: 0.52, ease: easeOut },
      },
    },

    rowStagger: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: none || { staggerChildren: 0.055, delayChildren: 0.14 },
      },
    },

    rowItem: {
      hidden: { opacity: 0, y: reduce ? 0 : 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: none || { duration: 0.42, ease: easeOut },
      },
    },
  }
}
