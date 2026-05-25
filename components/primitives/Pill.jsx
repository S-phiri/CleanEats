export default function Pill({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'border border-line text-ink-mute bg-base-3/80',
    gold: 'border border-line-strong text-gold-soft bg-gold/10',
    green: 'border border-green/50 text-green-soft bg-green/15',
    eyebrow: 'border border-line text-gold-soft bg-green/10 font-mono text-[10px] uppercase tracking-[0.14em]',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  )
}
