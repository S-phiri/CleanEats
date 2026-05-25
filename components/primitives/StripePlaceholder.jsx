export default function StripePlaceholder({ icon: Icon, className = '', size = 'md' }) {
  const sizes = {
    sm: 'h-14 w-14 rounded-lg',
    md: 'h-16 w-16 rounded-lg',
    lg: 'h-[100px] w-[100px] rounded-[var(--r-md)]',
  }
  return (
    <div
      className={`stripe-placeholder flex items-center justify-center shrink-0 ${sizes[size] || sizes.md} ${className}`}
      aria-hidden
    >
      {Icon && <Icon size={22} strokeWidth={2} className="text-gold" />}
    </div>
  )
}
