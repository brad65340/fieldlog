'use client'

import { SprayWindowBadge } from '@/components/ui/SprayWindowBadge'
import { BRAND } from '@/constants'
import { useWeather } from '@/hooks/useWeather'
import type { ForecastDay } from '@/lib/weather'

// 5-day forecast strip rendered under the WeatherPanel. The forecast is
// fetched once for an "anchor" field (operation-level rollup); per-field
// forecasts would multiply API calls without much added signal at this
// geographic scale. The per-day spray-window pill carries the same colors +
// label + glyph used in WeatherPanel via the shared SprayWindowBadge.

interface Props {
  lat: number
  lng: number
}

export function ForecastStrip({ lat, lng }: Props) {
  const { data, loading, error } = useWeather(lat, lng)
  const forecast = data?.forecast ?? []

  return (
    <section className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        5-day forecast
      </h2>

      {loading && forecast.length === 0 && (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded"
              style={{ backgroundColor: BRAND.border }}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm font-medium" style={{ color: BRAND.error }}>
          [!] {error}
        </p>
      )}

      {forecast.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {forecast.map((day) => (
            <DayCard key={day.date} day={day} />
          ))}
        </div>
      )}
    </section>
  )
}

function DayCard({ day }: { day: ForecastDay }) {
  return (
    <div
      className="flex flex-col items-center rounded border p-2 text-center"
      style={{ borderColor: BRAND.border }}
    >
      <p className="text-xs font-semibold" style={{ color: BRAND.primary }}>{day.date}</p>
      <p className="mt-1 text-[10px]" style={{ color: BRAND.textLight }}>{day.conditions}</p>
      <p className="mt-2 text-sm font-bold" style={{ color: BRAND.text }}>{day.high}F</p>
      <p className="text-[10px]" style={{ color: BRAND.textLight }}>low {day.low}F</p>
      <p className="mt-1 text-[10px]" style={{ color: BRAND.textLight }}>wind {day.wind_speed} mph</p>
      <div className="mt-2 w-full">
        <SprayWindowBadge window={day.spray_window} variant="full" />
      </div>
    </div>
  )
}
