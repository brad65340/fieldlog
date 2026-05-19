'use client'

import Link from 'next/link'
import { ComplianceBadge } from '@/components/ui/ComplianceBadge'
import { BRAND, COMPLIANCE_STATUS, ROUTES } from '@/constants'
import type { ManagerApplicationRow } from '@/hooks/useManagerApplications'

// Card-based list for Phase 3. Phase 5 polishes to a sticky-header desktop
// table; for the demo, cards work on every viewport and FLAGGED rows are
// already visually unmistakable (red left border + light red background tint
// + the badge itself).

interface Props {
  applications: ManagerApplicationRow[]
}

const FLAGGED_TINT = '#FEF2F2'

export function ApplicationTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <p className="text-sm" style={{ color: BRAND.textLight }}>
        No applications match the current filters.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {applications.map((a) => <Row key={a.id} app={a} />)}
    </ul>
  )
}

function Row({ app }: { app: ManagerApplicationRow }) {
  const flagged = app.compliance_status === COMPLIANCE_STATUS.flagged
  const contractor = app.profiles
    ? `${app.profiles.first_name} ${app.profiles.last_name}`
    : '(unknown contractor)'
  const fieldName = app.fields?.name ?? '(unknown field)'
  const productName = app.products?.name ?? '(unknown product)'
  const epa = app.products?.epa_reg_number
  const w = app.weather_snapshots

  return (
    <li
      className="rounded border bg-white"
      style={{
        borderColor: BRAND.border,
        borderLeftWidth: flagged ? '4px' : undefined,
        borderLeftColor: flagged ? BRAND.error : undefined,
        backgroundColor: flagged ? FLAGGED_TINT : '#fff',
      }}
    >
      <Link
        href={ROUTES.managerApplication(app.id)}
        className="block p-4 transition hover:opacity-90"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium" style={{ color: BRAND.primary }}>
              {fieldName} - {contractor}
            </p>
            <p className="truncate text-sm" style={{ color: BRAND.textLight }}>
              {productName}{epa ? ` - EPA ${epa}` : ''}
            </p>
          </div>
          <ComplianceBadge status={app.compliance_status} />
        </div>
        <p className="mt-2 text-xs" style={{ color: BRAND.textLight }}>
          {new Date(app.submitted_at).toLocaleString()}
          {w && w.wind_speed !== null && w.temperature !== null
            ? ` - wind ${w.wind_speed} mph, ${w.temperature}F${w.conditions ? `, ${w.conditions}` : ''}`
            : ''}
        </p>
      </Link>
    </li>
  )
}
