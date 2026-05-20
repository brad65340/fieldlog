'use client'

import { BRAND, COMPLIANCE_PALETTE } from '@/constants'
import { useWeather } from '@/hooks/useWeather'
import type { Product } from '@/types'

// Live conditions sniff-test rendered beneath the GpsCapture once a location
// has been pinned. When a product is selected, the indicator compares its
// label limits against the current reading and surfaces a red warning panel
// for any predicted violation -- a real-time heads-up before submit.

interface Props {
  lat: number
  lng: number
  product: Product | null
}

export function SprayWindowIndicator({ lat, lng, product }: Props) {
  const { data, loading, error } = useWeather(lat, lng)
  const current = data?.current ?? null

  if (loading && !current) {
    return (
      <div
        className="h-20 animate-pulse rounded"
        style={{ backgroundColor: BRAND.border }}
        aria-hidden
      />
    )
  }
  if (error) {
    return (
      <p className="text-xs font-medium" style={{ color: BRAND.error }}>
        [!] Could not load live conditions: {error}
      </p>
    )
  }
  if (!current) return null

  const violations: string[] = []
  if (product) {
    const name = product.name
    if (product.max_wind_speed != null && current.wind_speed > product.max_wind_speed) {
      violations.push(
        `Wind ${current.wind_speed} mph exceeds label max of ${product.max_wind_speed} mph for ${name}`,
      )
    }
    if (product.min_temp != null && current.temperature < product.min_temp) {
      violations.push(
        `Temperature ${current.temperature}F below label min of ${product.min_temp}F for ${name}`,
      )
    }
    if (product.max_temp != null && current.temperature > product.max_temp) {
      violations.push(
        `Temperature ${current.temperature}F exceeds label max of ${product.max_temp}F for ${name}`,
      )
    }
  }

  const palette = violations.length > 0 ? COMPLIANCE_PALETTE.flagged : COMPLIANCE_PALETTE.compliant
  const statusText =
    violations.length > 0
      ? 'WARNING: CONDITIONS MAY VIOLATE LABEL'
      : product
        ? 'OK TO SPRAY'
        : 'LIVE CONDITIONS'

  return (
    <div className="rounded p-3 text-white" style={{ backgroundColor: palette.solid }}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold"
          style={{ color: palette.solid }}
        >
          {palette.symbol}
        </span>
        <p className="text-xs font-semibold tracking-wide">{statusText}</p>
      </div>
      <p className="mt-2 text-sm opacity-95">
        Wind {current.wind_speed} mph · {current.temperature}F · {current.conditions}
      </p>
      {violations.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {violations.map((v, i) => <li key={i}>[!] {v}</li>)}
        </ul>
      )}
      {violations.length > 0 && (
        <p className="mt-2 text-xs opacity-90">
          The application will be flagged if submitted under these conditions.
        </p>
      )}
    </div>
  )
}
