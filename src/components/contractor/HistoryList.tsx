'use client'

import { useState } from 'react'
import { ComplianceBadge } from '@/components/ui/ComplianceBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { BRAND, COMPLIANCE_STATUS } from '@/constants'
import {
  useContractorApplications,
  type ContractorHistoryRow,
} from '@/hooks/useContractorApplications'

export function HistoryList() {
  const { applications, loading, error } = useContractorApplications()

  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    )
  }
  if (error) {
    return (
      <EmptyState
        title="Could not load your applications"
        body={error}
        tone="error"
      />
    )
  }
  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications logged yet"
        body="Use the Log tab to record your first application."
      />
    )
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
        {formatSubmitted(app.submitted_at)}
      </p>
      {w && (w.wind_speed != null || w.temperature != null || w.conditions) && (
        <p className="mt-1 text-xs" style={{ color: BRAND.textLight }}>
          {[
            w.wind_speed != null ? `Wind ${w.wind_speed} mph` : null,
            w.temperature != null ? `${w.temperature}F` : null,
            w.conditions ?? null,
          ].filter(Boolean).join(' · ')}
        </p>
      )}

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
            <ul className="mt-2 space-y-1 text-sm font-medium" style={{ color: BRAND.error }}>
              {flags.map((f, i) => <li key={i}>[!] {f}</li>)}
            </ul>
          )}
        </>
      )}
    </li>
  )
}

function formatSubmitted(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${date} at ${time}`
}
