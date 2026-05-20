import { BRAND, COMPLIANCE_PALETTE } from '@/constants'
import type { ApplicationDetailRow } from '@/lib/queries/getApplicationById'

// Right-column "Conditions at Application" card for the detail page.
// Each weather reading sits next to the product label limit; green ✓ when
// compliant, red ! when violating. Four independent signals on flagged rows
// (color + weight + underline + [!] glyph) -- colorblind-safe by construction.

type Indicator = 'compliant' | 'flagged' | 'neutral'

export function ConditionsCard({ app }: { app: ApplicationDetailRow }) {
  const p = app.products
  const w = app.weather_snapshots

  if (!w) {
    return (
      <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Conditions at Application
        </h2>
        <p className="text-sm" style={{ color: BRAND.textLight }}>
          No weather data captured (no GPS at submit time).
        </p>
      </section>
    )
  }

  const windInd: Indicator =
    w.wind_speed == null || p?.max_wind_speed == null
      ? 'neutral'
      : w.wind_speed > p.max_wind_speed
        ? 'flagged'
        : 'compliant'

  const tempInd: Indicator =
    w.temperature == null || p?.min_temp == null || p?.max_temp == null
      ? 'neutral'
      : w.temperature < p.min_temp || w.temperature > p.max_temp
        ? 'flagged'
        : 'compliant'

  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        Conditions at Application
      </h2>
      <div className="space-y-3">
        <ConditionRow
          label="Wind speed"
          indicator={windInd}
          reading={w.wind_speed != null ? `${w.wind_speed} mph` : '-'}
          limit={p?.max_wind_speed != null ? `Max ${p.max_wind_speed} mph` : undefined}
        />
        <ConditionRow
          label="Temperature"
          indicator={tempInd}
          reading={w.temperature != null ? `${w.temperature}F` : '-'}
          limit={
            p?.min_temp != null && p?.max_temp != null
              ? `Range ${p.min_temp}F to ${p.max_temp}F`
              : undefined
          }
        />
        <ConditionRow
          label="Wind direction"
          indicator="neutral"
          reading={w.wind_direction != null ? `${w.wind_direction} degrees` : '-'}
        />
        <ConditionRow
          label="Humidity"
          indicator="neutral"
          reading={w.humidity != null ? `${w.humidity}%` : '-'}
        />
        <ConditionRow label="Sky" indicator="neutral" reading={w.conditions ?? '-'} />
      </div>
      <p
        className="mt-4 border-t pt-2 text-[10px] uppercase tracking-wide"
        style={{ borderColor: BRAND.border, color: BRAND.textLight }}
      >
        Captured {new Date(w.captured_at).toLocaleString()} via {w.source}
      </p>
    </section>
  )
}

function ConditionRow({
  label,
  indicator,
  reading,
  limit,
}: {
  label: string
  indicator: Indicator
  reading: string
  limit?: string
}) {
  const palette =
    indicator === 'compliant'
      ? COMPLIANCE_PALETTE.compliant
      : indicator === 'flagged'
        ? COMPLIANCE_PALETTE.flagged
        : null
  const flagged = indicator === 'flagged'
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2">
        {palette ? (
          <span
            aria-label={palette.label}
            title={palette.label}
            className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: palette.solid }}
          >
            {palette.symbol}
          </span>
        ) : (
          <span aria-hidden className="h-5 w-5" />
        )}
        <span className="text-sm" style={{ color: BRAND.textLight }}>
          {label}
        </span>
      </span>
      <span className="flex flex-wrap items-baseline justify-end gap-x-2 text-right">
        <span
          className="text-sm font-semibold"
          style={{
            color: flagged ? BRAND.error : BRAND.text,
            textDecoration: flagged ? 'underline' : undefined,
          }}
        >
          {flagged ? `[!] ${reading}` : reading}
        </span>
        {limit && (
          <span className="text-xs" style={{ color: BRAND.textLight }}>
            {limit}
          </span>
        )}
      </span>
    </div>
  )
}
