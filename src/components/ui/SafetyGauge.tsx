import { BRAND, COMPLIANCE_PALETTE } from '@/constants'

// Horizontal bar showing a safe range (green) bracketed by danger zones (red).
// Colorblind discipline: the same ✓ / ! glyphs from COMPLIANCE_PALETTE label
// each segment, and the "Safe: X to Y" line above the bar carries the
// numerics in plain text -- color is not the sole signal.
//
// When `value` is passed, a vertical marker line is drawn at that position
// (used by the weather panel to show the current wind reading against the
// 10 mph spray threshold).

interface Props {
  label: string
  unit: string
  scaleMin: number
  scaleMax: number
  safeMin: number | null
  safeMax: number | null
  value?: number
}

export function SafetyGauge({ label, unit, scaleMin, scaleMax, safeMin, safeMax, value }: Props) {
  const range = scaleMax - scaleMin
  const lowSafePct = safeMin == null ? 0 : Math.max(0, ((safeMin - scaleMin) / range) * 100)
  const highSafePct = safeMax == null ? 100 : Math.min(100, ((safeMax - scaleMin) / range) * 100)
  const greenWidth = Math.max(0, highSafePct - lowSafePct)

  const compliant = COMPLIANCE_PALETTE.compliant
  const flagged = COMPLIANCE_PALETTE.flagged

  const safeRangeText =
    safeMin != null && safeMax != null
      ? `Safe ${safeMin}${unit} to ${safeMax}${unit}`
      : safeMax != null
        ? `Safe up to ${safeMax}${unit}`
        : safeMin != null
          ? `Safe at or above ${safeMin}${unit}`
          : 'No limit'

  const valuePct =
    value != null
      ? Math.max(0, Math.min(100, ((value - scaleMin) / range) * 100))
      : null

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium" style={{ color: BRAND.text }}>{label}</span>
        <span style={{ color: BRAND.textLight }}>{safeRangeText}</span>
      </div>

      <div
        className="relative mt-2 h-6 w-full overflow-hidden rounded-full border"
        style={{ borderColor: BRAND.border }}
      >
        {lowSafePct > 0 && (
          <div
            className="absolute inset-y-0 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ left: 0, width: `${lowSafePct}%`, backgroundColor: flagged.solid }}
          >
            <span aria-label={flagged.label}>{flagged.symbol}</span>
          </div>
        )}
        <div
          className="absolute inset-y-0 flex items-center justify-center text-[10px] font-bold text-white"
          style={{ left: `${lowSafePct}%`, width: `${greenWidth}%`, backgroundColor: compliant.solid }}
        >
          <span aria-label={compliant.label}>{compliant.symbol}</span>
        </div>
        {highSafePct < 100 && (
          <div
            className="absolute inset-y-0 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ left: `${highSafePct}%`, width: `${100 - highSafePct}%`, backgroundColor: flagged.solid }}
          >
            <span aria-label={flagged.label}>{flagged.symbol}</span>
          </div>
        )}
        {valuePct != null && (
          <div
            aria-label={`Current value ${value}${unit}`}
            className="absolute inset-y-0"
            style={{ left: `${valuePct}%`, width: '3px', backgroundColor: BRAND.primary, transform: 'translateX(-50%)' }}
          />
        )}
      </div>

      <div className="mt-1 flex justify-between text-[10px]" style={{ color: BRAND.textLight }}>
        <span>{scaleMin}{unit}</span>
        {valuePct != null && (
          <span
            className="font-semibold"
            style={{ color: BRAND.primary }}
          >
            {value}{unit}
          </span>
        )}
        <span>{scaleMax}{unit}</span>
      </div>
    </div>
  )
}
