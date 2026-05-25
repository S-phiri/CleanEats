import { ClipboardList, Dumbbell, Wallet } from 'lucide-react'
import Glass from '../primitives/Glass'

const FEATURES = [
  {
    n: '01 · PLAN',
    title: 'Localized meal intelligence',
    body: 'Plans built from real basket prices and culturally grounded staples — nshima, ugali, injera, pap. No imported substitutes.',
    Icon: ClipboardList,
  },
  {
    n: '02 · TRAIN',
    title: 'Synced to your session load',
    body: 'Macros recalibrate against your training block. Refuel windows, glycogen loads, recovery meals on one timeline.',
    Icon: Dumbbell,
  },
  {
    n: '03 · COST',
    title: 'Built for the budget',
    body: 'Daily plan cost tracked in ZMW, KES, ZAR. Swap any ingredient and the basket recomputes — performance and price in one view.',
    Icon: Wallet,
  },
]

export default function Features() {
  return (
    <section className="mb-24">
      <div className="grid md:grid-cols-3 gap-5">
        {FEATURES.map(({ n, title, body, Icon }) => (
          <Glass key={n} goldEdge className="p-6 glass-card-hover">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--r-sm)] bg-gold/15 border border-[var(--line)] mb-5">
              <Icon size={22} strokeWidth={2} className="text-gold" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold mb-2">{n}</p>
            <h3 className="font-syne font-bold text-[22px] text-ink mb-3">{title}</h3>
            <p className="text-[14.5px] text-ink-mute leading-relaxed">{body}</p>
          </Glass>
        ))}
      </div>
    </section>
  )
}
