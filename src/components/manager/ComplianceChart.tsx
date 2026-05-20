'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { BRAND, COMPLIANCE_PALETTE, COMPLIANCE_STATUS, type ComplianceStatus } from '@/constants'
import type { ManagerApplicationRow } from '@/hooks/useManagerApplications'

// Donut chart for compliance breakdown. Colorblind discipline: each legend
// row pairs COMPLIANCE_PALETTE.solid + COMPLIANCE_PALETTE.symbol + count +
// percentage so the status reads in greyscale as well.

interface Props {
  applications: ManagerApplicationRow[]
}

interface Slice {
  status: ComplianceStatus
  value: number
  color: string
  label: string
  symbol: string
}

export function ComplianceChart({ applications }: Props) {
  const total = applications.length
  const counts: Record<ComplianceStatus, number> = {
    compliant: 0,
    flagged: 0,
    pending: 0,
  }
  for (const a of applications) counts[a.compliance_status]++

  const data: Slice[] = (
    [COMPLIANCE_STATUS.compliant, COMPLIANCE_STATUS.flagged, COMPLIANCE_STATUS.pending] as ComplianceStatus[]
  ).map((status) => ({
    status,
    value: counts[status],
    color: COMPLIANCE_PALETTE[status].solid,
    label: COMPLIANCE_PALETTE[status].label,
    symbol: COMPLIANCE_PALETTE[status].symbol,
  }))

  const compliancePct = total > 0 ? Math.round((counts.compliant / total) * 100) : 0
  const hasData = total > 0

  return (
    <section className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Compliance breakdown
        </h2>
        <span className="text-xs" style={{ color: BRAND.textLight }}>{total} total</span>
      </div>

      <div className="relative mt-3 h-40">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell key={d.status} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => {
                  const slice = item?.payload as Slice | undefined
                  const sym = slice?.symbol ?? ''
                  const lbl = slice?.label ?? ''
                  return [`${value}`, `${sym} ${lbl}`]
                }}
                contentStyle={{ fontSize: '0.75rem', borderColor: BRAND.border }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm" style={{ color: BRAND.textLight }}>
            No applications yet
          </div>
        )}

        {hasData && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: BRAND.primary }}>{compliancePct}%</span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: BRAND.textLight }}>
              compliant
            </span>
          </div>
        )}
      </div>

      <ul className="mt-3 space-y-1.5 text-sm">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
          return (
            <li key={d.status} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: d.color }}
                >
                  {d.symbol}
                </span>
                <span className="font-medium" style={{ color: BRAND.text }}>{d.label}</span>
              </span>
              <span style={{ color: BRAND.textLight }}>
                {d.value} {total > 0 && <span className="text-xs">({pct}%)</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
