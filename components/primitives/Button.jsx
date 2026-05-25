import Link from 'next/link'

export default function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  type = 'button',
  disabled,
  onClick,
  ...props
}) {
  const cls = `btn ${variant === 'ghost' ? 'btn-ghost' : 'btn-primary'} ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
