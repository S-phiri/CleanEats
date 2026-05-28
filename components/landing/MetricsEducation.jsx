import { Flame, Dumbbell, CalendarCheck } from 'lucide-react'
import Glass from '../primitives/Glass'

const CARDS = [
  {
    Icon: Flame,
    label: 'Calories',
    title: 'Your daily target, not a limit',
    body: 'TDEE is the number of calories your body needs given your size and how active you are. Eat below it to lose fat, above it to build muscle, at it to maintain.',
  },
  {
    Icon: Dumbbell,
    label: 'Macros',
    title: 'Protein, carbs and fat — all three matter',
    body: 'Macros tell you what your calories are made of. Protein builds and repairs muscle. Carbs fuel your training. Fat supports hormones and recovery. CleanEats balances all three around your goal.',
  },
  {
    Icon: CalendarCheck,
    label: 'Consistency',
    title: 'Most days beats perfect days',
    body: 'Hitting 80% of your targets consistently will do more for you than one perfect week followed by nothing. Your plan is built to be realistic, not extreme.',
  },
]

export default function MetricsEducation() {
  return (
    <section className="mb-24" aria-labelledby="metrics-education-heading">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C9A84C] mb-3">
        Learn the basics
      </p>
      <h2
        id="metrics-education-heading"
        className="font-syne font-bold text-3xl md:text-4xl text-ink leading-tight mb-8"
      >
        What these numbers mean
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        {CARDS.map(({ Icon, label, title, body }) => (
          <Glass key={title} goldEdge className="p-6 glass-card-hover">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--r-sm)] bg-gold/15 border border-[var(--line)] mb-5">
              <Icon size={22} strokeWidth={2} className="text-[#C9A84C]" aria-hidden />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold mb-2">{label}</p>
            <h3 className="font-syne font-bold text-[22px] text-ink mb-3 leading-snug">{title}</h3>
            <p className="text-[14.5px] text-ink-mute leading-relaxed">{body}</p>
          </Glass>
        ))}
      </div>
    </section>
  )
}
