'use client'

import { RecentDots } from '@/components/ui/RecentDots'
import { BRAND, COMPLIANCE_PALETTE, type ComplianceStatus } from '@/constants'
import type { ManagerApplicationRow } from '@/hooks/useManagerApplications'
import { computeRestriction } from '@/lib/restrictions'
import type { Field } from '@/types'

// Per-field card: most recent application + re-entry / pre-harvest status +
// last 5 application dots. Re-entry status badges reuse COMPLIANCE_PALETTE
// (compliant green / flagged red + the same ✓ / ! glyphs) so the visual
// language is identical to ComplianceBadge -- colorblind-safe by construction.

const RECENT_DOT_COUNT = 5

interface Props {
  fields: Field[]
  applications: ManagerApplicationRow[]
}

export function FieldStatusCards({ fields, applications }: Props) {
  if (fields.length === 0) {
    return (
      <section className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Fields
        </h2>
        <p className="mt-2 text-sm" style={{ color: BRAND.textLight }}>
          No fields configured yet.
        </p>
      </section>
    )
  }

  const sorted = [...fields].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <section className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        Field status
      </h2>
      <ul className="mt-3 grid gap-3 md:grid-cols-3">
        {sorted.map((f) => {
          const fieldApps = applications
            .filter((a) => a.field_id === f.id)
            .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
          return <FieldCard key={f.id} field={f} fieldApps={fieldApps} />
        })}
      </ul>
    </section>
  )
}

function FieldCard({ field, fieldApps }: { field: Field; fieldApps: ManagerApplicationRow[] }) {
  const last = fieldApps[0] ?? null
  const recent: ComplianceStatus[] = fieldApps.slice(0, RECENT_DOT_COUNT).map((a) => a.compliance_status)

  return (
    <li className="rounded border p-3" style={{ borderColor: BRAND.border }}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium" style={{ color: BRAND.primary }}>{field.name}</p>
        <p className="text-xs" style={{ color: BRAND.textLight }}>
          {field.acreage ? `${field.acreage} ac` : ''}
        </p>
      </div>

      {last ? (
        <>
          <p className="mt-1 text-xs" style={{ color: BRAND.textLight }}>
            Last: {new Date(last.application_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {last.products ? ` - ${last.products.name}` : ''}
            {last.profiles ? ` - ${last.profiles.first_name} ${last.profiles.last_name}` : ''}
          </p>

          <div className="mt-2 grid gap-1.5 text-xs">
            <ReEntryRow app={last} />
            <PreHarvestRow app={last} />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wide" style={{ color: BRAND.textLight }}>
              Recent
            </span>
            <RecentDots statuses={recent} emptyLabel="" />
          </div>
        </>
      ) : (
        <p className="mt-1 text-xs" style={{ color: BRAND.textLight }}>
          No applications logged yet.
        </p>
      )}
    </li>
  )
}

function ReEntryRow({ app }: { app: ManagerApplicationRow }) {
  const hours = app.products?.re_entry_interval_hours
  if (hours == null) {
    return <StatusLine label="Re-entry" text="No interval on product" />
  }
  const { reEntryClearsMs, reEntryActive } = computeRestriction(app.application_start, hours, null)
  return (
    <StatusLine
      label="Re-entry"
      restricted={reEntryActive}
      text={
        reEntryActive
          ? `Restricted until ${formatDateTime(reEntryClearsMs as number)}`
          : `Cleared ${formatDateTime(reEntryClearsMs as number)}`
      }
    />
  )
}

function PreHarvestRow({ app }: { app: ManagerApplicationRow }) {
  const days = app.products?.pre_harvest_interval_days
  if (days == null) {
    return <StatusLine label="Pre-harvest" text="No interval on product" />
  }
  const { preHarvestClearsMs, preHarvestActive } = computeRestriction(
    app.application_start,
    null,
    days,
  )
  return (
    <StatusLine
      label="Pre-harvest"
      restricted={preHarvestActive}
      text={
        preHarvestActive
          ? `Harvest after ${formatDate(preHarvestClearsMs as number)}`
          : `Safe to harvest (cleared ${formatDate(preHarvestClearsMs as number)})`
      }
    />
  )
}

function StatusLine({
  label,
  text,
  restricted,
}: {
  label: string
  text: string
  restricted?: boolean
}) {
  const palette = restricted == null
    ? null
    : restricted
      ? COMPLIANCE_PALETTE.flagged
      : COMPLIANCE_PALETTE.compliant
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wide" style={{ color: BRAND.textLight }}>{label}</span>
      <span className="flex items-center gap-1.5">
        {palette && (
          <span
            aria-hidden
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: palette.solid }}
          >
            {palette.symbol}
          </span>
        )}
        <span className="font-medium" style={{ color: BRAND.text }}>{text}</span>
      </span>
    </div>
  )
}

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
