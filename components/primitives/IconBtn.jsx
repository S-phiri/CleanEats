export default function IconBtn({ children, label, className = '', onClick, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`icon-btn ${className}`.trim()}
      aria-label={label}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
