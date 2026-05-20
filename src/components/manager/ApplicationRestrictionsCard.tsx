import { BRAND, COMPLIANCE_PALETTE } from '@/constants'
import type { ApplicationDetailRow } from '@/lib/queries/getApplicationById'

// Right-column "Field Restrictions" card for the detail page.
// Re-entry + pre-harvest status render as banner blocks: white text on solid
// red when the interval is still active, white text on solid green when
// cleared -- canonical colorblind-safe form (no red text on pink bg).

const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

export function RestrictionsCard({ app }: { app: ApplicationDetailRow }) {
  const startMs = new Date(app.application_start).getTime()
  const hours = app.products?.re_entry_interval_hours
  const days = app.products?.pre_harvest_interval_days

  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        Field Restrictions
      </h2>
      <div className="space-y-3">
        {hours == null ? (
          <FallbackLine label="Re-entry" text="No interval specified by label" />
        ) : (
          <StatusBlock
            heading="Re-entry"
            clearsMs={startMs + hours * MS_PER_HOUR}
            activeLine="Field cannot be re-entered until"
            clearedLine="Re-entry cleared at"
            interval={`${hours} hours after application start`}
            includeTime
          />
        )}

        {days == null ? (
          <FallbackLine label="Pre-harvest" text="No interval specified by label" />
        ) : (
          <StatusBlock
            heading="Pre-harvest"
            clearsMs={startMs + days * MS_PER_DAY}
            activeLine="Crop cannot be harvested until"
            clearedLine="Safe to harvest since"
            interval={`${days} days after application start`}
          />
        )}
      </div>
    </section>
  )
}

function StatusBlock({
  heading,
  clearsMs,
  activeLine,
  clearedLine,
  interval,
  includeTime = false,
}: {
  heading: string
  clearsMs: number
  activeLine: string
  clearedLine: string
  interval: string
  includeTime?: boolean
}) {
  const active = Date.now() < clearsMs
  const palette = active ? COMPLIANCE_PALETTE.flagged : COMPLIANCE_PALETTE.compliant
  const dateText = includeTime ? formatDateTime(clearsMs) : formatDate(clearsMs)
  const headline = active ? `${heading.toUpperCase()} ACTIVE` : `${heading.toUpperCase()} CLEARED`
  const body = active ? `${activeLine} ${dateText}` : `${clearedLine} ${dateText}`

  return (
    <div className="rounded-md p-3" style={{ backgroundColor: palette.solid, color: '#fff' }}>
      <p className="text-xs font-semibold tracking-wide">
        {palette.symbol} {headline}
      </p>
      <p className="mt-1 text-sm">{body}</p>
      <p className="mt-1 text-[10px] opacity-90">{interval}</p>
    </div>
  )
}

function FallbackLine({ label, text }: { label: string; text: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
      style={{ borderColor: BRAND.border, color: BRAND.textLight }}
    >
      <span className="font-medium">{label}</span>
      <span>{text}</span>
    </div>
  )
}

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
