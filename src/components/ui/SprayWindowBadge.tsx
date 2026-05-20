import { COMPLIANCE_PALETTE } from '@/constants'
import type { SprayWindow } from '@/lib/weather'

// Inline pill that pairs a spray-window classification with its label, glyph,
// and color. Used by the per-field WeatherPanel rows AND the 5-day
// ForecastStrip cells, so the three states read identically across the
// dashboard. Colorblind discipline: label + glyph carry the meaning, color
// reinforces -- never the sole signal (deuteranopia struggles with red/green
// distinctions; amber/red/green palette must always be labelled).

const AMBER = '#D97706'

interface BadgeSpec {
  label: string
  glyph: string
  bg: string
}

const BADGE: Record<SprayWindow, BadgeSpec> = {
  good: {
    label: 'GOOD',
    glyph: COMPLIANCE_PALETTE.compliant.symbol,
    bg: COMPLIANCE_PALETTE.compliant.solid,
  },
  marginal: {
    label: 'MARGINAL',
    glyph: '~',
    bg: AMBER,
  },
  poor: {
    label: 'POOR',
    glyph: COMPLIANCE_PALETTE.flagged.symbol,
    bg: COMPLIANCE_PALETTE.flagged.solid,
  },
}

interface Props {
  window: SprayWindow
  /**
   * `pill` (default): compact inline badge for tables and per-field rows.
   * `full`: full-width block (`block`) used by the ForecastStrip cells.
   */
  variant?: 'pill' | 'full'
}

export function SprayWindowBadge({ window, variant = 'pill' }: Props) {
  const spec = BADGE[window]
  const widthCls = variant === 'full' ? 'w-full justify-center' : ''
  return (
    <span
      aria-label={`Spray window: ${spec.label}`}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white ${widthCls}`}
      style={{ backgroundColor: spec.bg }}
    >
      <span aria-hidden>{spec.glyph}</span>
      {spec.label}
    </span>
  )
}
