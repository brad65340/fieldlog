'use client'

import { BRAND } from '@/constants'

export interface ManagerFilters {
  status: 'all' | 'compliant' | 'flagged' | 'pending'
  contractor_id: string | null
  dateRange: 'week' | 'month' | 'all'
}

export const DEFAULT_FILTERS: ManagerFilters = {
  status: 'all',
  contractor_id: null,
  dateRange: 'all',
}

interface Props {
  filters: ManagerFilters
  onChange: (filters: ManagerFilters) => void
  contractors: Array<{ id: string; first_name: string; last_name: string }>
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'compliant', label: 'Compliant' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'pending', label: 'Pending' },
] as const

const RANGE_TABS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
] as const

export function FilterBar({ filters, onChange, contractors }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TabRow ariaLabel="Compliance status" tabs={STATUS_TABS} active={filters.status}
        onSelect={(k) => onChange({ ...filters, status: k as ManagerFilters['status'] })} />
      <select
        value={filters.contractor_id ?? ''}
        onChange={(e) => onChange({ ...filters, contractor_id: e.target.value || null })}
        className="rounded border px-2 py-1 text-sm"
        style={{ borderColor: BRAND.border }}
      >
        <option value="">All contractors</option>
        {contractors.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
      </select>
      <TabRow ariaLabel="Date range" tabs={RANGE_TABS} active={filters.dateRange}
        onSelect={(k) => onChange({ ...filters, dateRange: k as ManagerFilters['dateRange'] })} />
    </div>
  )
}

function TabRow({
  ariaLabel, tabs, active, onSelect,
}: {
  ariaLabel: string
  tabs: ReadonlyArray<{ key: string; label: string }>
  active: string
  onSelect: (key: string) => void
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex overflow-hidden rounded border"
      style={{ borderColor: BRAND.border }}>
      {tabs.map((t, i) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(t.key)}
            className={`px-3 py-1 text-sm ${i > 0 ? 'border-l' : ''}`}
            style={{
              backgroundColor: isActive ? BRAND.primary : '#fff',
              color: isActive ? '#fff' : BRAND.text,
              borderColor: BRAND.border,
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// Boundary helpers used by the dashboard to apply the dateRange filter
// per decision C3 (ISO Monday week, calendar month, all-time).
export function rangeStartMs(range: ManagerFilters['dateRange']): number | null {
  if (range === 'all') return null
  const now = new Date()
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  // ISO week: Monday 00:00 of current week.
  const day = now.getDay() // 0=Sun..6=Sat
  const offsetToMonday = (day + 6) % 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetToMonday)
  return monday.getTime()
}
