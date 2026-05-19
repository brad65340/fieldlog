'use client'

import { useMemo, useState } from 'react'
import { BRAND } from '@/constants'
import { useManagerApplications } from '@/hooks/useManagerApplications'
import { ApplicationTable } from './ApplicationTable'
import { DEFAULT_FILTERS, FilterBar, rangeStartMs, type ManagerFilters } from './FilterBar'
import { StatsRow } from './StatsRow'

// Two-column dashboard layout per decision A1.
// Left column (md:col-span-3 of 5 -> 60%): FilterBar + ApplicationTable.
// Right column (md:col-span-2 of 5 -> 40%): Phase-5 placeholder slots
//   (compliance donut, weather panel, forecast strip, field status cards).
// Full-width row below: Phase-5 placeholder for the Leaflet map.

export function ManagerDashboardClient() {
  const { applications, loading, error, refetch } = useManagerApplications()
  const [filters, setFilters] = useState<ManagerFilters>(DEFAULT_FILTERS)

  const contractors = useMemo(() => {
    const map = new Map<string, { id: string; first_name: string; last_name: string }>()
    for (const app of applications) {
      if (!map.has(app.contractor_id) && app.profiles) {
        map.set(app.contractor_id, {
          id: app.contractor_id,
          first_name: app.profiles.first_name,
          last_name: app.profiles.last_name,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.first_name.localeCompare(b.first_name))
  }, [applications])

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (filters.status !== 'all' && a.compliance_status !== filters.status) return false
      if (filters.contractor_id && a.contractor_id !== filters.contractor_id) return false
      const minMs = rangeStartMs(filters.dateRange)
      if (minMs !== null && new Date(a.submitted_at).getTime() < minMs) return false
      return true
    })
  }, [applications, filters])

  return (
    <div className="space-y-6">
      <StatsRow applications={applications} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterBar filters={filters} onChange={setFilters} contractors={contractors} />
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded border px-3 py-1 text-sm"
          style={{ borderColor: BRAND.border, color: BRAND.textLight }}
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-sm" style={{ color: BRAND.error }}>{error}</p>}

      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-3">
          {loading ? (
            <p className="text-sm" style={{ color: BRAND.textLight }}>Loading...</p>
          ) : (
            <ApplicationTable applications={filtered} />
          )}
        </div>
        <aside className="space-y-3 md:col-span-2">
          <SlotPlaceholder title="Compliance chart" sub="Phase 5 (Recharts donut)" />
          <SlotPlaceholder title="Weather panel" sub="Phase 5 (current conditions)" />
          <SlotPlaceholder title="5-day forecast" sub="Phase 5 (spray windows)" />
          <SlotPlaceholder title="Field status cards" sub="Phase 5 (re-entry status)" />
        </aside>
      </div>

      <SlotPlaceholder title="Application map" sub="Phase 5 (Leaflet)" height="h-64" />
    </div>
  )
}

function SlotPlaceholder({ title, sub, height = 'h-32' }: { title: string; sub: string; height?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded border border-dashed bg-white p-4 text-center ${height}`}
      style={{ borderColor: BRAND.border, color: BRAND.textLight }}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs">{sub}</p>
    </div>
  )
}
