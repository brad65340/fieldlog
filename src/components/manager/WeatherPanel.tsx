'use client'

import { SprayWindowBadge } from '@/components/ui/SprayWindowBadge'
import { BRAND } from '@/constants'
import { useWeather } from '@/hooks/useWeather'
import { sprayWindowFor } from '@/lib/weather'

// Per-field current conditions panel. One row per field, each row makes its
// own /api/weather call via useWeather, so the spray-window classification
// reflects that field's actual coordinates rather than a generic operation
// location. With 3 fields polling every 10 min, that's ~18 calls/hr per
// signed-in manager -- well inside the 60/hr 'weather:fetch' budget.

export interface WeatherField {
  id: string
  name: string
  lat: number
  lng: number
}

interface Props {
  fields: WeatherField[]
}

export function WeatherPanel({ fields }: Props) {
  return (
    <section className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        Field conditions
      </h2>
      {fields.length === 0 ? (
        <p className="text-sm" style={{ color: BRAND.textLight }}>
          No field coordinates configured.
        </p>
      ) : (
        <ul className="space-y-2">
          {fields.map((f) => (
            <li key={f.id}>
              <FieldRow field={f} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function FieldRow({ field }: { field: WeatherField }) {
  const { data, loading, error } = useWeather(field.lat, field.lng)
  const current = data?.current ?? null
  const window = current ? sprayWindowFor(current) : null

  return (
    <div className="rounded border p-3" style={{ borderColor: BRAND.border }}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium" style={{ color: BRAND.primary }}>{field.name}</p>
        {window && <SprayWindowBadge window={window} />}
      </div>

      {loading && !current && !error && (
        <div
          className="mt-2 h-3 w-3/4 animate-pulse rounded"
          style={{ backgroundColor: BRAND.border }}
          aria-hidden
        />
      )}

      {error && !current && (
        <p className="mt-1 text-xs font-medium" style={{ color: BRAND.error }}>
          [!] {error}
        </p>
      )}

      {current && (
        <p className="mt-1 text-xs" style={{ color: BRAND.textLight }}>
          <span className="font-semibold" style={{ color: BRAND.text }}>{current.temperature}F</span>
          {' · '}
          {current.conditions}
          {' · Wind '}
          <span className="font-semibold" style={{ color: BRAND.text }}>{current.wind_speed} mph</span>
          {' '}
          {compassDirection(current.wind_direction)}
        </p>
      )}
    </div>
  )
}

function compassDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const idx = Math.round((deg % 360) / 22.5) % 16
  return dirs[idx] ?? ''
}
