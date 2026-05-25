import Glass from '../primitives/Glass'

const KPIS = [
  { v: '−4%', l: '800m PB' },
  { v: '+9%', l: 'Plan adherence' },
  { v: '−18%', l: 'Weekly basket cost' },
  { v: '96%', l: 'Sessions recovered' },
]

export default function Persona() {
  return (
    <section className="mb-24">
      <Glass goldEdge className="grid md:grid-cols-2 gap-8 p-8 md:p-10">
        <div>
          <span className="font-syne text-[120px] leading-none text-gold/30 block -mb-8" aria-hidden>
            &ldquo;
          </span>
          <blockquote className="font-syne font-semibold text-2xl md:text-[30px] text-ink leading-snug relative z-10">
            The plan reads my training week like a coach does. It costs me less than buying ingredients at
            random — and my times dropped 4% in the build block.
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="stripe-placeholder h-14 w-14 rounded-full shrink-0" />
            <div>
              <p className="font-syne font-semibold text-ink">Chipo Mwansa</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                800m · Zambia National Squad
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {KPIS.map((k) => (
            <div
              key={k.l}
              className="rounded-[var(--r-md)] border border-[var(--line-strong)] bg-base-3/50 p-4 flex flex-col justify-center"
            >
              <p className="font-syne font-bold text-2xl tabular-nums text-gold-soft">{k.v}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mute mt-1">{k.l}</p>
            </div>
          ))}
        </div>
      </Glass>
    </section>
  )
}
