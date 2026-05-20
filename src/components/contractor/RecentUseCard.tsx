import { BRAND, COMPLIANCE_PALETTE, type ComplianceStatus } from '@/constants'

// Recent-use callout on the product detail page. Shows when this product was
// last sprayed on this operation (RLS-scoped) with the compliance badge and,
// if flagged, the first violation reason.

export interface RecentUse {
  id: string
  application_start: string
  compliance_status: ComplianceStatus
  compliance_flags: string[] | null
  fields: { name: string } | null
  profiles: { first_name: string; last_name: string } | null
}

export function RecentUseCard({ lastApp }: { lastApp: RecentUse }) {
  const palette = COMPLIANCE_PALETTE[lastApp.compliance_status]
  const contractor = lastApp.profiles
    ? `${lastApp.profiles.first_name} ${lastApp.profiles.last_name}`
    : '(unknown)'
  const fieldName = lastApp.fields?.name ?? '(unknown field)'
  const when = new Date(lastApp.application_start).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const firstFlag = lastApp.compliance_flags?.[0]
  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        Recent use on this operation
      </h2>
      <p className="text-sm" style={{ color: BRAND.text }}>
        Last applied {when} on <span className="font-semibold">{fieldName}</span> by {contractor}.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span
          aria-label={palette.label}
          className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: palette.solid }}
        >
          {palette.symbol}
        </span>
        <span className="text-sm font-medium" style={{ color: BRAND.text }}>{palette.label}</span>
      </div>
      {firstFlag && (
        <p className="mt-2 text-xs font-medium" style={{ color: BRAND.error }}>
          [!] {firstFlag}
        </p>
      )}
    </section>
  )
}
