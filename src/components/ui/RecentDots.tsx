'use client'

import { BRAND, COMPLIANCE_PALETTE, type ComplianceStatus } from '@/constants'

// Color + glyph dot row used by ContractorList and FieldStatusCards.
// Each dot pairs COMPLIANCE_PALETTE.solid with COMPLIANCE_PALETTE.symbol so the
// status reads without relying on color alone -- colorblind-safe by construction.
// Pass statuses newest-first; the visual order is left-to-right newest-to-oldest.

const DOT_SIZE_CLS = 'h-6 w-6 text-xs'

interface Props {
  statuses: ComplianceStatus[]
  label?: string
  emptyLabel?: string
}

export function RecentDots({
  statuses,
  label = 'Recent application statuses (newest first)',
  emptyLabel = 'no recent',
}: Props) {
  if (statuses.length === 0) {
    return <span className="text-xs" style={{ color: BRAND.textLight }}>{emptyLabel}</span>
  }
  return (
    <div className="flex items-center gap-1.5" role="list" aria-label={label}>
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
