import { COMPLIANCE_PALETTE, type ComplianceStatus } from '@/constants'

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const p = COMPLIANCE_PALETTE[status]
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-semibold tracking-wide"
      style={{ backgroundColor: p.bg, color: p.fg }}
    >
      {p.label}
    </span>
  )
}
