import Link from 'next/link'
import { BRAND, ROUTES } from '@/constants'
import type { Product } from '@/types'

// Grid card for /contractor/products. Shows the four label limits at a
// glance plus the restricted-use callout. Card itself is a link to the
// detail page; "View details" is the visible affordance.

export function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      href={ROUTES.contractorProduct(p.id)}
      className="block rounded-lg border bg-white p-4 transition hover:shadow"
      style={{ borderColor: BRAND.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold" style={{ color: BRAND.primary }}>{p.name}</p>
          <p className="truncate text-xs" style={{ color: BRAND.textLight }}>
            EPA {p.epa_reg_number}
            {p.active_ingredient ? ` · ${p.active_ingredient}` : ''}
          </p>
        </div>
        {p.restricted_use && (
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white"
            style={{ backgroundColor: BRAND.error }}
          >
            [!] RU
          </span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <Stat
          label="Max rate"
          value={p.max_rate_per_acre != null ? `${p.max_rate_per_acre} ${p.rate_unit}` : '-'}
        />
        <Stat
          label="Max wind"
          value={p.max_wind_speed != null ? `${p.max_wind_speed} mph` : '-'}
        />
        <Stat
          label="Temp range"
          value={
            p.min_temp != null && p.max_temp != null ? `${p.min_temp}-${p.max_temp}F` : '-'
          }
        />
        <Stat
          label="Re-entry"
          value={
            p.re_entry_interval_hours != null ? `${p.re_entry_interval_hours} hrs` : '-'
          }
        />
      </dl>

      <p
        className="mt-3 text-xs font-medium underline"
        style={{ color: BRAND.accent }}
      >
        View details
      </p>
    </Link>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="uppercase tracking-wide" style={{ color: BRAND.textLight }}>{label}</dt>
      <dd className="font-semibold" style={{ color: BRAND.text }}>{value}</dd>
    </div>
  )
}
