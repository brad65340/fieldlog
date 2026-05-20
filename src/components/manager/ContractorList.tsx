'use client'

import { BRAND, COMPLIANCE_PALETTE, type ComplianceStatus } from '@/constants'
import type { ContractorWithStats } from '@/hooks/useContractors'

// Visual-status dots use COMPLIANCE_PALETTE.solid (high-contrast) PLUS a
// glyph inside each dot (✓ / ! / ·) so the status reads without relying on
// color -- colorblind-safe by construction. Each dot is also labelled for
// screen readers.
const DOT_SIZE_CLS = 'h-6 w-6 text-xs'

export function ContractorList({ contractors }: { contractors: ContractorWithStats[] }) {
  if (contractors.length === 0) {
    return (
      <p className="text-sm" style={{ color: BRAND.textLight }}>
        No contractors yet. Use the form above to add the first one.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {contractors.map((c) => <Card key={c.id} c={c} />)}
    </ul>
  )
}

function Card({ c }: { c: ContractorWithStats }) {
  const flaggedColor = c.flagged_count > 0 ? BRAND.error : BRAND.textLight
  const lastApplied = c.last_application_at
    ? new Date(c.last_application_at).toLocaleDateString()
    : 'no applications yet'

  return (
    <li className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium" style={{ color: BRAND.primary }}>
            {c.first_name} {c.last_name}
          </p>
          <p className="truncate text-xs" style={{ color: BRAND.textLight }}>{c.email}</p>
        </div>
        <RecentDots statuses={c.recent_statuses} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Total" value={c.total_applications} />
        <Stat
          label="Flagged"
          value={c.flagged_count > 0 ? `[!] ${c.flagged_count}` : c.flagged_count}
          valueColor={flaggedColor}
        />
        <Stat label="Last" value={lastApplied} />
      </dl>
    </li>
  )
}

function Stat({ label, value, valueColor }: { label: string; value: number | string; valueColor?: string }) {
  return (
    <div>
      <dt className="uppercase tracking-wide" style={{ color: BRAND.textLight }}>{label}</dt>
      <dd className="font-medium" style={{ color: valueColor ?? BRAND.text }}>{value}</dd>
    </div>
  )
}

function RecentDots({ statuses }: { statuses: ComplianceStatus[] }) {
  if (statuses.length === 0) {
    return <span className="text-xs" style={{ color: BRAND.textLight }}>no recent</span>
  }
  return (
    <div className="flex items-center gap-1.5" role="list" aria-label="Recent application statuses (newest first)">
      {statuses.map((s, i) => {
        const p = COMPLIANCE_PALETTE[s]
        return (
          <span
            key={i}
            role="listitem"
            aria-label={p.label}
            title={p.label}
            className={`flex items-center justify-center rounded-full font-bold text-white ${DOT_SIZE_CLS}`}
            style={{ backgroundColor: p.solid }}
          >
            {p.symbol}
          </span>
        )
      })}
    </div>
  )
}
