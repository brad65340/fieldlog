'use client'

import { BRAND, COMPLIANCE_PALETTE, COMPLIANCE_STATUS } from '@/constants'
import type { ManagerApplicationRow } from '@/hooks/useManagerApplications'

// Card colors come from COMPLIANCE_PALETTE.solid -- single source shared with
// the RecentDots in ContractorList so visual language stays consistent and
// changes propagate from one place.

function startOfYearMs(): number {
  return new Date(new Date().getFullYear(), 0, 1).getTime()
}

export function StatsRow({ applications }: { applications: ManagerApplicationRow[] }) {
  const yearStart = startOfYearMs()
  const thisSeason = applications.filter((a) => new Date(a.submitted_at).getTime() >= yearStart)
  const total = thisSeason.length
  const compliant = thisSeason.filter((a) => a.compliance_status === COMPLIANCE_STATUS.compliant).length
  const flagged = thisSeason.filter((a) => a.compliance_status === COMPLIANCE_STATUS.flagged).length
  const pct = total > 0 ? Math.round((compliant / total) * 100) : 0
  const activeContractors = new Set(thisSeason.map((a) => a.contractor_id)).size

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card bg={BRAND.primary} label="Total this season" value={total} />
      <Card bg={COMPLIANCE_PALETTE.compliant.solid} label="Compliant" value={total === 0 ? '0' : `${compliant} (${pct}%)`} />
      <Card bg={COMPLIANCE_PALETTE.flagged.solid} label="Flagged" value={flagged} />
      <Card bg={BRAND.primary} label="Active contractors" value={activeContractors} />
    </div>
  )
}

function Card({ bg, label, value }: { bg: string; label: string; value: number | string }) {
  return (
    <div className="rounded-lg p-4 text-white" style={{ backgroundColor: bg }}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-90">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
