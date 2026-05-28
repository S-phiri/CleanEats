import { ClipboardList, Dumbbell, Wallet } from 'lucide-react'
import Glass from '../primitives/Glass'

const FEATURES = [
  {
    n: '01 · Plan',
    title: 'Meals that fit your life',
    body: 'Breakfast through dinner with calories, protein, carbs, and fat — using foods you can actually find at local shops.',
    Icon: ClipboardList,
  },
  {
    n: '02 · Train',
    title: 'Built around your week',
    body: 'Your targets follow your goal and how often you train. Each day lines up with what you need that day.',
    Icon: Dumbbell,
  },
  {
    n: '03 · Budget',
    title: 'Costs you can see',
    body: 'Shopping lists with estimated prices in your currency. Swap meals and see how the week adds up.',
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
