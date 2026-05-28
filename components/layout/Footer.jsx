import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="page-layer border-t border-[var(--line)] mt-20">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <Link href="/" className="font-syne font-bold text-lg tracking-[0.04em]">
            <span className="text-ink">CLEAN</span>
            <span className="text-green">EATS</span>
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute mt-3">
            © {year} CleanEats
          </p>
        </div>
        <p className="font-syne font-semibold text-base text-ink-mute max-w-md leading-snug">
          Eat well. Train hard. Feel good.
        </p>
      </div>
    </footer>
  )
}
