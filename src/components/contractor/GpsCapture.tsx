'use client'

import { BRAND, COMPLIANCE_PALETTE } from '@/constants'

// When GPS is captured, the panel inverts to solid green + ✓ glyph + the
// captured coordinates so the success state is unmistakable (same colorblind
// pattern as ComplianceBadge / ComplianceResult: solid bg + white text + glyph).
// The recapture action drops down to a secondary link so the primary
// confirmation reads as the dominant visual.

interface Props {
  gps: { lat: number; lng: number } | null
  error: string | null
  onCapture: () => void
}

export function GpsCapture({ gps, error, onCapture }: Props) {
  if (gps) {
    const palette = COMPLIANCE_PALETTE.compliant
    return (
      <div className="rounded-md p-4 text-white" style={{ backgroundColor: palette.solid }}>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold"
            style={{ color: palette.solid }}
          >
            {palette.symbol}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide">LOCATION CAPTURED</p>
            <p className="text-xs opacity-90">
              {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCapture}
          className="mt-3 text-xs font-medium underline"
          style={{ color: '#fff' }}
        >
          Recapture
        </button>
      </div>
    )
  }

  return (
    <div className="rounded border p-3" style={{ borderColor: BRAND.border }}>
      <button
        type="button"
        onClick={onCapture}
        className="w-full rounded-lg px-4 py-3 text-base font-semibold text-white"
        style={{ backgroundColor: BRAND.accent }}
      >
        Use my location
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium" style={{ color: BRAND.error }}>
          [!] {error}
        </p>
      ) : (
        <p className="mt-2 text-xs" style={{ color: BRAND.textLight }}>
          Without GPS, the application is logged but compliance check is deferred.
        </p>
      )}
    </div>
  )
}
