// FieldLog wordmark used in the landing header and footer. Bar-chart icon
// with the FieldLog text. Two color variants: navy on light backgrounds
// (header), white on dark backgrounds (footer). Brand colors hardcoded here
// since the SVG fill values are part of the wordmark, not theme tokens.

interface Props {
  variant?: 'dark' | 'light'
  className?: string
}

export function Logo({ variant = 'dark', className = '' }: Props) {
  const text = variant === 'dark' ? '#2C3E50' : '#ffffff'
  const navy = variant === 'dark' ? '#2C3E50' : '#ffffff'
  const accent = '#52896F'
  return (
    <svg viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="FieldLog">
      <rect x="5" y="12" width="10" height="36" rx="3" fill={navy} />
      <rect x="18" y="5" width="10" height="50" rx="3" fill={navy} opacity="0.85" />
      <rect x="31" y="18" width="10" height="30" rx="3" fill={accent} />
      <rect x="44" y="8" width="10" height="44" rx="3" fill={accent} opacity="0.85" />
      <text
        x="68"
        y="42"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill={text}
      >
        FieldLog
      </text>
    </svg>
  )
}
