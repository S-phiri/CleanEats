'use client'

import { motion } from 'framer-motion'
import { useMotionVariants } from '../lib/motion'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['10 credits/month', '3-day plans', 'Basic shopping list'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$6',
    period: '/month',
    features: ['Unlimited generations', '5-day plans', 'Local prices & shopping list', 'Prep guide', 'Save plans'],
    highlight: true,
  },
  {
    name: 'Coach',
    price: '$18',
    period: '/month',
    features: ['Everything in Pro', 'Up to 20 client profiles', 'Generate plans for clients', 'PDF export'],
    highlight: false,
  },
]

export default function HomePricingMotion() {
  const m = useMotionVariants()
  const { scrollFadeUp, cardStagger, cardRise } = m

  return (
    <motion.section className="mt-20 sm:mt-28" {...scrollFadeUp}>
      <h2 className="font-syne text-2xl font-bold mb-3">Simple pricing</h2>
      <p className="text-muted text-sm mb-10">Start free. Upgrade when you&apos;re ready.</p>

      <div
        className="grid grid-cols-3 gap-4"
        variants={cardStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            variants={cardRise}
            className={`bg-surface rounded-2xl p-6 border ${plan.highlight ? 'border-green' : 'border-border'} relative`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full bg-green text-on-accent">
                Most popular
              </div>
            )}
            <p className="text-muted text-xs font-semibold uppercase tracking-widest mb-2">{plan.name}</p>
            <p className="font-syne text-3xl font-black mb-1">
              {plan.price}
              <span className="text-base font-normal text-muted">{plan.period}</span>
            </p>
            <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2">
              {plan.features.map((f) => (
                <p key={f} className="text-sm text-soft">
                  ✓ {f}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
