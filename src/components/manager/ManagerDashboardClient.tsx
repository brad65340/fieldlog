'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { BRAND } from '@/constants'
import { useFields } from '@/hooks/useFields'
import { useManagerApplications } from '@/hooks/useManagerApplications'
import { ActivityChart } from './ActivityChart'
import { ApplicationTable } from './ApplicationTable'
import { ComplianceChart } from './ComplianceChart'
import { FieldStatusCards } from './FieldStatusCards'
import { DEFAULT_FILTERS, FilterBar, rangeStartMs, type ManagerFilters } from './FilterBar'
import { ForecastStrip } from './ForecastStrip'
import { StatsRow } from './StatsRow'
import { WeatherPanel } from './WeatherPanel'

// Leaflet touches window at import time, so the map is loaded client-only.
const ApplicationMap = dynamic(() => import('./ApplicationMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

// Phase 5 layout:
// Two-column row: left (3/5) = ApplicationTable, right (2/5) = sidebar with
//   ComplianceChart + WeatherPanel + ForecastStrip. Sidebar height roughly
//   matches the table so neither column trails behind with whitespace.
// Full-width rows below the split: ActivityChart, FieldStatusCards (3-col
// grid on md+), and the Leaflet ApplicationMap last.

export function ManagerDashboardClient() {
  const { applications, loading, error, refetch } = useManagerApplications()
  const { fields } = useFields()
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

  // Fields with coordinates feed the WeatherPanel (one row per field) and
  // also seed the ForecastStrip's anchor location (first alphabetically --
  // a single 5-day forecast for the operation's general area).
  const fieldsWithCoords = useMemo(
    () =>
      fields
        .filter(
          (f): f is typeof f & { lat: number; lng: number } =>
            f.lat != null && f.lng != null,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [fields],
  )
  const anchorField = fieldsWithCoords[0] ?? null

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
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : (
            <ApplicationTable applications={filtered} />
          )}
        </div>
        <aside className="space-y-3 md:col-span-2">
          <ComplianceChart applications={applications} />
          <WeatherPanel fields={fieldsWithCoords} />
          {anchorField && <ForecastStrip lat={anchorField.lat} lng={anchorField.lng} />}
        </aside>
      </div>

      <ActivityChart applications={applications} />
      <FieldStatusCards fields={fields} applications={applications} />
      <ApplicationMap applications={applications} />
    </div>
  )
}

function MapSkeleton() {
  return (
    <div
      className="flex h-64 items-center justify-center rounded border bg-white text-sm"
      style={{ borderColor: BRAND.border, color: BRAND.textLight }}
    >
      Loading map...
    </div>
  )
}
