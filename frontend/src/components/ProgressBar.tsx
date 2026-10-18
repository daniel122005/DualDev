export default function ProgressBar({
  value,
  color,
  height,
  label,
}: {
  value: number
  color?: string
  height?: number
  label?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className="progress-bar"
      style={height ? { height } : undefined}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, ...(color ? { background: `linear-gradient(90deg, ${color}, ${color}bb)` } : null) }}
      />
    </div>
  )
}
