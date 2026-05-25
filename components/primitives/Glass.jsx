export default function Glass({ children, className = '', goldEdge = false, as: Tag = 'div', ...props }) {
  const cls = `glass ${goldEdge ? 'gold-edge' : ''} ${className}`.trim()
  return <Tag className={cls} {...props}>{children}</Tag>
}
