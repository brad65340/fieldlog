import { BRAND, COMPLIANCE_PALETTE } from '@/constants'
import { MS_PER_DAY, MS_PER_HOUR } from '@/lib/restrictions'

// Per-field horizontal timeline showing re-entry restricted periods (red
// blocks) against the safe baseline (green). Red blocks include the
// COMPLIANCE_PALETTE flagged glyph when wide enough so the status reads in
// any color perception. The today marker is a thick navy vertical line with
// a "Today" label above it.

const WINDOW_BEFORE_DAYS = 14
const WINDOW_AFTER_DAYS = 14
const MIN_GLYPH_WIDTH_PCT = 3

export interface TimelineApplication {
  id: string
  application_start: string
  re_entry_hours: number | null
  product_name: string | null
}

export interface TimelineField {
  field_id: string
  field_name: string
  applications: TimelineApplication[]
}

interface Block {
  leftPct: number
  widthPct: number
  productName: string | null
  endMs: number
}

export function FieldTimeline({ fields }: { fields: TimelineField[] }) {
  const now = Date.now()
  const windowStart = now - WINDOW_BEFORE_DAYS * MS_PER_DAY
  const windowEnd = now + WINDOW_AFTER_DAYS * MS_PER_DAY
  const windowMs = windowEnd - windowStart
  const todayPct = ((now - windowStart) / windowMs) * 100

  if (fields.length === 0) {
    return (
      <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Field timeline
        </h2>
        <p className="text-sm" style={{ color: BRAND.textLight }}>No fields configured.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Field timeline
        </h2>
        <Legend />
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <FieldRow
            key={f.field_id}
            field={f}
            windowStart={windowStart}
            windowMs={windowMs}
            todayPct={todayPct}
          />
        ))}
      </div>

      <AxisLabels windowStart={windowStart} windowEnd={windowEnd} todayPct={todayPct} />
    </section>
  )
}

function Legend() {
  const compliant = COMPLIANCE_PALETTE.compliant
  const flagged = COMPLIANCE_PALETTE.flagged
  return (
    <div className="flex items-center gap-3 text-[10px]" style={{ color: BRAND.textLight }}>
      <span className="flex items-center gap-1">
        <span
          aria-hidden
          className="flex h-3 w-3 items-center justify-center rounded-sm text-[8px] font-bold text-white"
          style={{ backgroundColor: compliant.solid }}
        >
          {compliant.symbol}
        </span>
        Safe
      </span>
      <span className="flex items-center gap-1">
        <span
          aria-hidden
          className="flex h-3 w-3 items-center justify-center rounded-sm text-[8px] font-bold text-white"
          style={{ backgroundColor: flagged.solid }}
        >
          {flagged.symbol}
        </span>
        Re-entry restricted
      </span>
    </div>
  )
}

function FieldRow({
  field,
  windowStart,
  windowMs,
  todayPct,
}: {
  field: TimelineField
  windowStart: number
  windowMs: number
  todayPct: number
}) {
  const compliant = COMPLIANCE_PALETTE.compliant
  const flagged = COMPLIANCE_PALETTE.flagged
  const blocks: Block[] = []
  const windowEnd = windowStart + windowMs

  for (const a of field.applications) {
    if (a.re_entry_hours == null) continue
    const startMs = new Date(a.application_start).getTime()
    const endMs = startMs + a.re_entry_hours * MS_PER_HOUR
    const clippedStart = Math.max(startMs, windowStart)
    const clippedEnd = Math.min(endMs, windowEnd)
    if (clippedEnd <= clippedStart) continue
    const leftPct = ((clippedStart - windowStart) / windowMs) * 100
    const widthPct = ((clippedEnd - clippedStart) / windowMs) * 100
    blocks.push({ leftPct, widthPct, productName: a.product_name, endMs })
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium" style={{ color: BRAND.text }}>
        {field.field_name}
      </p>
      <div
        className="relative h-6 overflow-hidden rounded border"
        style={{ borderColor: BRAND.border, backgroundColor: compliant.solid }}
      >
        {blocks.map((b, i) => (
          <div
            key={i}
            className="absolute inset-y-0 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ left: `${b.leftPct}%`, width: `${b.widthPct}%`, backgroundColor: flagged.solid }}
            title={`${b.productName ?? 'Application'}: re-entry until ${formatShort(b.endMs)}`}
          >
            {b.widthPct >= MIN_GLYPH_WIDTH_PCT ? flagged.symbol : ''}
          </div>
        ))}
        <div
          aria-label="Today"
          className="absolute inset-y-0"
          style={{ left: `${todayPct}%`, width: '2px', backgroundColor: BRAND.primary }}
        />
      </div>
    </div>
  )
}

function AxisLabels({
  windowStart,
  windowEnd,
  todayPct,
}: {
  windowStart: number
  windowEnd: number
  todayPct: number
}) {
  return (
    <div className="relative mt-2 h-4 text-[10px]" style={{ color: BRAND.textLight }}>
      <span className="absolute left-0">{formatShort(windowStart)}</span>
      <span
        className="absolute -translate-x-1/2 font-semibold"
        style={{ left: `${todayPct}%`, color: BRAND.primary }}
      >
        Today
      </span>
      <span className="absolute right-0">{formatShort(windowEnd)}</span>
    </div>
  )
}

function formatShort(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
