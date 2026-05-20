import type { ReactNode } from 'react'
import { ComplianceBadge } from '@/components/ui/ComplianceBadge'
import { BRAND, COMPLIANCE_PALETTE, COMPLIANCE_STATUS } from '@/constants'
import type { ApplicationDetailRow } from '@/lib/queries/getApplicationById'
import { ConditionsCard } from './ApplicationConditionsCard'
import { RestrictionsCard } from './ApplicationRestrictionsCard'
import { ExportButton } from './ExportButton'

// Two-column layout per A2. Server-rendered; ExportButton is the only
// interactive piece and lives in its own client component.
//
// Right column lives in ApplicationConditionsPanel: ConditionsCard renders
// reading vs label limit side-by-side with green/red indicators, and
// RestrictionsCard renders the re-entry + pre-harvest countdown blocks.
// Violation rows here (left column) use four independent signals
// (color + weight + underline + [!] glyph) -- same precedent as the audit PDF.

export function ApplicationDetail({ app }: { app: ApplicationDetailRow }) {
  const flagged = app.compliance_status === COMPLIANCE_STATUS.flagged
  const flags = app.compliance_flags ?? []

  const contractor = app.profiles
    ? `${app.profiles.first_name} ${app.profiles.last_name}`
    : '(unknown contractor)'
  const fieldName = app.fields?.name ?? '(unknown field)'
  const fieldAcreage = app.fields?.acreage
  const fieldLabel = fieldAcreage != null ? `${fieldName} (${fieldAcreage} ac)` : fieldName

  const p = app.products
  const rateViolation = p?.max_rate_per_acre != null && app.rate_applied > p.max_rate_per_acre

  const gpsText =
    app.lat != null && app.lng != null
      ? `${app.lat.toFixed(5)}, ${app.lng.toFixed(5)}`
      : 'Not captured'

  return (
    <div>
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: BRAND.textLight }}>Application</p>
            <h1 className="font-mono text-2xl font-bold" style={{ color: BRAND.primary }}>
              FL-{app.id.slice(0, 8)}
            </h1>
            <p className="text-sm" style={{ color: BRAND.textLight }}>
              Submitted {new Date(app.submitted_at).toLocaleString()}
            </p>
          </div>
          <ComplianceBadge status={app.compliance_status} />
        </div>

        {flagged && flags.length > 0 && (
          <div
            className="mt-4 rounded-lg p-4"
            style={{ backgroundColor: COMPLIANCE_PALETTE.flagged.solid, color: '#fff' }}
          >
            <p className="font-semibold">[!] Compliance Issues Detected</p>
            <ul className="mt-2 space-y-1 text-sm">
              {flags.map((f, i) => <li key={i}>[!] {f}</li>)}
            </ul>
          </div>
        )}
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card title="Application Details">
            <Row label="Contractor" value={contractor} />
            <Row label="Field" value={fieldLabel} />
            <Row label="Acreage Treated" value={`${app.acreage_treated} acres`} />
            <Row label="Target Pest" value={app.target_pest ?? 'Not specified'} />
            <Row label="Application Start" value={new Date(app.application_start).toLocaleString()} />
            <Row label="Application End" value={app.application_end ? new Date(app.application_end).toLocaleString() : 'Not recorded'} />
            <Row label="GPS Coordinates" value={gpsText} />
            <Row label="Notes" value={app.notes && app.notes.length > 0 ? app.notes : 'None'} />
          </Card>
          <Card title="Product Information">
            <Row label="Product" value={p?.name ?? '(unknown)'} />
            <Row label="EPA Registration No." value={p?.epa_reg_number ?? '-'} />
            <Row label="Active Ingredient" value={p?.active_ingredient ?? '-'} />
            <Row label="Restricted Use" value={p?.restricted_use ? 'Yes' : 'No'} />
            <Row label="Application Rate" value={`${app.rate_applied} ${app.rate_unit}`} highlight={rateViolation} />
            <Row label="Max Rate (label)" value={p?.max_rate_per_acre != null ? `${p.max_rate_per_acre} ${p.rate_unit ?? ''}`.trim() : 'Not specified'} />
          </Card>
        </div>

        <div className="space-y-4">
          <ConditionsCard app={app} />
          <RestrictionsCard app={app} />
        </div>
      </div>

      <div className="mt-6">
        <ExportButton applicationId={app.id} />
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>{title}</h2>
      <dl className="space-y-2 text-sm">{children}</dl>
    </section>
  )
}

function Row({ label, value, highlight = false }: { label: string; value: ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt style={{ color: BRAND.textLight }}>{label}</dt>
      <dd
        className={highlight ? 'text-right underline' : 'text-right'}
        style={{ color: highlight ? BRAND.error : BRAND.text, fontWeight: highlight ? 700 : 400 }}
      >
        {highlight ? <>[!] {value}</> : value}
      </dd>
    </div>
  )
}
