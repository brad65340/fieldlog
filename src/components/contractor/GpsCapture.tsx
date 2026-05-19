'use client'

import { BRAND } from '@/constants'

interface Props {
  gps: { lat: number; lng: number } | null
  error: string | null
  onCapture: () => void
}

export function GpsCapture({ gps, error, onCapture }: Props) {
  return (
    <div className="rounded border p-3" style={{ borderColor: BRAND.border }}>
      <button
        type="button"
        onClick={onCapture}
        className="w-full rounded px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: BRAND.accent }}
      >
        {gps ? 'Recapture location' : 'Use my location'}
      </button>
      {gps && (
        <p className="mt-2 text-xs" style={{ color: BRAND.textLight }}>
          Captured: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
        </p>
      )}
      {error && <p className="mt-2 text-xs" style={{ color: BRAND.error }}>{error}</p>}
      {!gps && !error && (
        <p className="mt-2 text-xs" style={{ color: BRAND.textLight }}>
          Without GPS, the application is logged but compliance check is deferred.
        </p>
      )}
    </div>
  )
}
