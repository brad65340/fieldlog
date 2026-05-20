import { BRAND, COMPLIANCE_PALETTE } from '@/constants'
import type { RestrictionInfo } from '@/lib/restrictions'

// Renders restriction status cards at the top of the timetable page.
// Restricted fields surface white-on-solid-red with the [!] symbol; cleared
// and idle fields drop to muted styling so the eye lands on the active risks
// first. Same colorblind-safe palette as the application detail page.

export interface FieldRestriction {
  field_id: string
  field_name: string
  field_acreage: number | null
  last_application_start: string | null
  product_name: string | null
  contractor_name: string | null
  restriction: RestrictionInfo | null
}

export function ActiveRestrictionsList({ rows }: { rows: FieldRestriction[] }) {
  const active = rows.filter((r) => r.restriction?.anyActive)
  const cleared = rows.filter((r) => r.restriction && !r.restriction.anyActive)
  const idle = rows.filter((r) => !r.restriction)

  return (
    <div className="space-y-3">
      {active.length === 0 && (
        <ClearedHeadlineCard message="No active restrictions across any field." />
      )}
      {active.map((r) => (
        <RestrictionCard key={r.field_id} row={r} variant="active" />
      ))}
      {cleared.map((r) => (
        <RestrictionCard key={r.field_id} row={r} variant="cleared" />
      ))}
      {idle.map((r) => (
        <IdleFieldCard key={r.field_id} name={r.field_name} acreage={r.field_acreage} />
      ))}
    </div>
  )
}

function ClearedHeadlineCard({ message }: { message: string }) {
  const palette = COMPLIANCE_PALETTE.compliant
  return (
    <div className="rounded-lg p-4 text-white" style={{ backgroundColor: palette.solid }}>
      <p className="text-xs font-semibold tracking-wide">{palette.symbol} ALL CLEAR</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  )
}

function RestrictionCard({ row, variant }: { row: FieldRestriction; variant: 'active' | 'cleared' }) {
  const palette = variant === 'active' ? COMPLIANCE_PALETTE.flagged : COMPLIANCE_PALETTE.compliant
  const headline =
    variant === 'active' ? 'RESTRICTED' : 'CLEARED'
  return (
    <div className="rounded-lg p-4 text-white" style={{ backgroundColor: palette.solid }}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide">
          {palette.symbol} {row.field_name.toUpperCase()} - {headline}
        </p>
        {row.field_acreage != null && (
          <p className="text-xs opacity-90">{row.field_acreage} ac</p>
        )}
      </div>

      {row.last_application_start && (
        <p className="mt-2 text-sm opacity-95">
          {row.product_name ?? '(unknown product)'} applied{' '}
          {formatDate(row.last_application_start)}
          {row.contractor_name ? ` by ${row.contractor_name}` : ''}
        </p>
      )}

      {row.restriction && (
        <dl className="mt-3 space-y-1 text-xs">
          <Line
            label="Re-entry"
            text={
              row.restriction.reEntryClearsMs == null
                ? 'No interval on product'
                : row.restriction.reEntryActive
                  ? `Restricted until ${formatDateTime(row.restriction.reEntryClearsMs)}`
                  : `Cleared ${formatDateTime(row.restriction.reEntryClearsMs)}`
            }
          />
          <Line
            label="Pre-harvest"
            text={
              row.restriction.preHarvestClearsMs == null
                ? 'No interval on product'
                : row.restriction.preHarvestActive
                  ? `Harvest after ${formatDate(new Date(row.restriction.preHarvestClearsMs).toISOString())}`
                  : `Safe to harvest (cleared ${formatDate(new Date(row.restriction.preHarvestClearsMs).toISOString())})`
            }
          />
        </dl>
      )}
    </div>
  )
}

function IdleFieldCard({ name, acreage }: { name: string; acreage: number | null }) {
  return (
    <div
      className="rounded-lg border bg-white p-4"
      style={{ borderColor: BRAND.border, color: BRAND.textLight }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide" style={{ color: BRAND.primary }}>
          {name.toUpperCase()}
        </p>
        {acreage != null && <p className="text-xs">{acreage} ac</p>}
      </div>
      <p className="mt-2 text-sm">No applications logged on this field yet.</p>
    </div>
  )
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="uppercase tracking-wider opacity-80">{label}</dt>
      <dd className="text-right font-medium">{text}</dd>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
