export default function CardBand({ title, meta }) {
  return (
    <div className="card-band">
      <h3>{title}</h3>
      {meta && <span className="band-meta">{meta}</span>}
    </div>
  )
}
