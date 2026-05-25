'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { easeOut, premiumHoverTransition } from '../lib/motion'

const stats = [
  { v: 'TDEE', l: 'Calculated first' },
  { v: '7+', l: 'Goal types' },
  { v: 'Local', l: 'Ingredient-aware' },
  { v: 'Precise', l: 'Gram-level portions' },
]

export default function HomeHeroMotion({ ctaHref, ctaLabel }) {
  const reduce = useReducedMotion()

  const lineEase = reduce ? { duration: 0 } : { duration: 0.65, ease: easeOut }
  const headlineWrap = {
    hidden: { opacity: reduce ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reduce
        ? { duration: 0 }
        : { staggerChildren: 0.11, delayChildren: 0.1 },
    },
  }
  const line = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: lineEase },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduce ? { duration: 0 } : { duration: 0.56, ease: easeOut, delay: 0.36 },
    },
  }

  const fadeUpLater = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduce ? { duration: 0 } : { duration: 0.56, ease: easeOut, delay: 0.48 },
    },
  }

  const statsContainer = {
    hidden: { opacity: reduce ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reduce
        ? { duration: 0 }
        : { staggerChildren: 0.07, delayChildren: 0.55 },
    },
  }
  const statsItem = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduce ? { duration: 0 } : { duration: 0.48, ease: easeOut },
    },
  }

  return (
    <div className="relative">
      {!reduce && (
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[min(18%,120px)] top-[-40px] h-[min(280px,45vw)] w-[min(280px,45vw)] rounded-full bg-green/[0.1] blur-[64px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.38, 0.48, 0.38] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative space-y-0">
        <div
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: easeOut }}
        >
          <div className="inline-flex items-center gap-2 bg-s2 border border-border2 text-green text-[0.74rem] font-semibold tracking-[2px] uppercase px-4 py-[7px] rounded-full mb-9">
            ✦ Precision Nutrition Engine
          </div>
        </div>

        <div
          className="font-syne text-[clamp(2.8rem,7vw,5.8rem)] font-black leading-[1.12] tracking-[-2px] mb-10 sm:mb-12 overflow-visible flex flex-col gap-1 sm:gap-2"
          variants={headlineWrap}
          initial="hidden"
          animate="visible"
        >
          <div variants={line} className="block text-ink pb-[0.02em]">
            Eat with
          </div>
          <div variants={line} className="block text-green pb-[0.02em]">
            strategy.
          </div>
          <div variants={line} className="block text-muted pb-[0.12em]">
            Not guesswork.
          </div>
        </div>

        <motion.p
          className="text-[1.08rem] text-muted max-w-[520px] leading-[1.75] mb-12 sm:mb-14"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          CleanEats calculates your exact caloric needs and builds a goal-specific meal plan
          using ingredients you can actually find where you live.
        </motion.p>

        <div
          className="flex gap-3 flex-wrap pt-1"
          variants={fadeUpLater}
          initial="hidden"
          animate="visible"
        >
          <div
            whileHover={reduce ? {} : { scale: 1.018, y: -2 }}
            whileTap={reduce ? {} : { scale: 0.989 }}
            transition={premiumHoverTransition}
          >
            <Link
              href={ctaHref}
              className="inline-block px-12 py-[18px] rounded-full bg-green text-on-accent font-semibold text-[1.05rem] transition-shadow duration-300 shadow-[0_0_22px_rgba(168,196,86,0.2)] hover:shadow-[0_0_40px_rgba(168,196,86,0.32)] hover:opacity-95"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        <div
          className="grid grid-cols-4 gap-px bg-border border border-border rounded-2xl overflow-hidden mt-16 sm:mt-24"
          variants={statsContainer}
          initial="hidden"
          animate="visible"
        >
          {stats.map((s) => (
            <div key={s.v} variants={statsItem} className="bg-surface py-7 px-5 text-center">
              <span className="font-syne text-[1.9rem] font-black text-green block">{s.v}</span>
              <div className="text-[0.78rem] text-muted mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
