'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BRAND, COMPLIANCE_PALETTE, COMPLIANCE_STATUS, type ComplianceStatus } from '@/constants'
import type { ManagerApplicationRow } from '@/hooks/useManagerApplications'

// 14-day stacked bar chart of application submissions. Colorblind discipline:
// segment colors come from COMPLIANCE_PALETTE.solid (distinct hues), the
// legend pairs each color with its glyph + label, and the tooltip prefixes
// each row with the same glyph -- color is never the sole signal.

const DAYS_BACK = 14
const MS_PER_DAY = 86_400_000

interface Bucket {
  key: string
  date: string
  compliant: number
  flagged: number
  pending: number
}

const STATUSES_IN_STACK_ORDER: ComplianceStatus[] = [
  COMPLIANCE_STATUS.compliant,
  COMPLIANCE_STATUS.flagged,
  COMPLIANCE_STATUS.pending,
]

function buildBuckets(applications: ManagerApplicationRow[]): Bucket[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets = new Map<string, Bucket>()
  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * MS_PER_DAY)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    buckets.set(key, { key, date: label, compliant: 0, flagged: 0, pending: 0 })
  }
  for (const a of applications) {
    const t = new Date(a.submitted_at)
    const key = new Date(t.getFullYear(), t.getMonth(), t.getDate()).toISOString().slice(0, 10)
    const b = buckets.get(key)
    if (b) b[a.compliance_status]++
  }
  return Array.from(buckets.values())
}

export function ActivityChart({ applications }: { applications: ManagerApplicationRow[] }) {
  const data = buildBuckets(applications)
  const total = data.reduce((s, b) => s + b.compliant + b.flagged + b.pending, 0)

  return (
    <section className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Last 14 days
        </h2>
        <span className="text-xs" style={{ color: BRAND.textLight }}>{total} submissions</span>
      </div>

      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={BRAND.border} vertical={false} />
            <XAxis
              dataKey="date"
              interval="preserveStartEnd"
              tick={{ fontSize: 10, fill: BRAND.textLight }}
              axisLine={{ stroke: BRAND.border }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: BRAND.textLight }}
              axisLine={{ stroke: BRAND.border }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: BRAND.background }}
              contentStyle={{ fontSize: '0.75rem', borderColor: BRAND.border }}
              formatter={(value, name) => {
                const status = name as ComplianceStatus
                const p = COMPLIANCE_PALETTE[status]
                return [`${value}`, `${p.symbol} ${p.label}`]
              }}
            />
            {STATUSES_IN_STACK_ORDER.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="apps"
                fill={COMPLIANCE_PALETTE[status].solid}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        {STATUSES_IN_STACK_ORDER.map((status) => {
          const p = COMPLIANCE_PALETTE[status]
          return (
            <li key={status} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="flex h-3.5 w-3.5 items-center justify-center rounded-sm text-[9px] font-bold text-white"
                style={{ backgroundColor: p.solid }}
              >
                {p.symbol}
              </span>
              <span style={{ color: BRAND.textLight }}>{p.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
