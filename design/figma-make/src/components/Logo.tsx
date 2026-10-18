import { useId } from 'react'

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="DualDev"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id={`${id}t`} x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f3b2c" />
          <stop offset="1" stopColor="#03130d" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="22" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7af0b4" />
          <stop offset="1" stopColor="#b6ff3c" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="62" height="62" rx="18" fill={`url(#${id}t)`} />
      <rect x="1.5" y="1.5" width="61" height="61" rx="17.5" stroke="#7af0b4" strokeOpacity=".28" />
      {/* bowl of the D: a loop that closes around the cursor */}
      <path
        d="M24 15.5h8.5a16.5 16.5 0 0 1 0 33H24"
        stroke={`url(#${id}g)`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* stem */}
      <path d="M17 15.5v33" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" />
      {/* chevron cursor in the negative space */}
      <path d="M31 25.5l7 6.5-7 6.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Logo({
  size = 40,
  wordmark = true,
  tagline = false,
}: {
  size?: number
  wordmark?: boolean
  tagline?: boolean
}) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.3 }}>
      <LogoMark size={size} />
      {wordmark && (
        <div style={{ lineHeight: 1 }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: size * 0.5, letterSpacing: '0.02em' }}>
            <span style={{ color: '#fff' }}>DUAL</span>
            <span
              style={{
                background: 'linear-gradient(90deg,#7af0b4,#b6ff3c)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              DEV
            </span>
          </div>
          {tagline && (
            <div
              className="font-display"
              style={{ fontSize: size * 0.17, letterSpacing: '0.24em', color: 'var(--color-muted)', marginTop: size * 0.12, fontWeight: 600 }}
            >
              APRENDE · PRACTICA · AVANZA
            </div>
          )}
        </div>
      )}
    </div>
  )
}
