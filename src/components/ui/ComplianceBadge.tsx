import { COMPLIANCE_PALETTE, type ComplianceStatus } from '@/constants'

// Solid pill: high-contrast background with white text + the
// COMPLIANCE_PALETTE.symbol as a leading glyph (✓ / ! / ·). Three
// independent signals -- color, shape (glyph), and the label text --
// so the status reads in any color perception and against any row
// background tint (e.g. FLAGGED row's pink tint, which used to swallow
// the old soft-pink badge bg).

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const p = COMPLIANCE_PALETTE[status]
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold tracking-wide text-white"
      style={{ backgroundColor: p.solid }}
    >
      <span aria-hidden>{p.symbol}</span>
      {p.label}
    </span>
  )
}
