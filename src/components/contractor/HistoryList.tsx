'use client'

import { useState } from 'react'
import { ComplianceBadge } from '@/components/ui/ComplianceBadge'
import { BRAND, COMPLIANCE_STATUS } from '@/constants'
import {
  useContractorApplications,
  type ContractorHistoryRow,
} from '@/hooks/useContractorApplications'

export function HistoryList() {
  const { applications, loading, error } = useContractorApplications()

  if (loading) return <p className="text-sm" style={{ color: BRAND.textLight }}>Loading...</p>
  if (error) return <p className="text-sm" style={{ color: BRAND.error }}>{error}</p>
  if (applications.length === 0) {
    return <p className="text-sm" style={{ color: BRAND.textLight }}>No applications logged yet.</p>
  }

  return (
    <ul className="space-y-3">
      {applications.map((app) => (
        <HistoryCard key={app.id} app={app} />
      ))}
    </ul>
  )
}

function HistoryCard({ app }: { app: ContractorHistoryRow }) {
  const [expanded, setExpanded] = useState(false)
  const flagged = app.compliance_status === COMPLIANCE_STATUS.flagged
  const flags = app.compliance_flags ?? []
  const fieldName = app.fields?.name ?? '(unknown field)'
  const productName = app.products?.name ?? '(unknown product)'
  const epa = app.products?.epa_reg_number
  const w = app.weather_snapshots

  return (
    <li className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: BRAND.primary }}>{fieldName}</p>
          <p className="truncate text-sm" style={{ color: BRAND.textLight }}>
            {productName}{epa ? ` - EPA ${epa}` : ''}
          </p>
        </div>
        <ComplianceBadge status={app.compliance_status} />
      </div>

      <p className="mt-2 text-xs" style={{ color: BRAND.textLight }}>
        {new Date(app.submitted_at).toLocaleString()}
        {w && w.wind_speed !== null && w.temperature !== null
          ? ` - wind ${w.wind_speed} mph, ${w.temperature}F`
          : ''}
      </p>

      {flagged && flags.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-xs underline"
            style={{ color: BRAND.error }}
          >
            {expanded ? 'Hide flags' : `Show ${flags.length} flag${flags.length > 1 ? 's' : ''}`}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 text-sm" style={{ color: BRAND.error }}>
              {flags.map((f, i) => <li key={i}>- {f}</li>)}
            </ul>
          )}
        </>
      )}
    </li>
  )
}
