export default function StatChip({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-4 py-2"
      style={{ background: `${color}15`, border: `1px solid ${color}33` }}
    >
      <span style={{ fontSize: 20 }} aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <p className="font-display text-lg font-black" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  )
}
