'use client'

import { BRAND } from '@/constants'
import type { Product } from '@/types'

// Inline quick-reference card shown beneath the product select once a product
// is chosen. Surfaces the four label values the contractor most needs (max
// rate, max wind, temp range, re-entry hours) plus a restricted-use callout
// and links to the full EPA label / SDS when those URLs are populated.

export function ProductQuickRef({ product }: { product: Product }) {
  return (
    <div
      className="rounded border bg-white p-3"
      style={{ borderColor: BRAND.border }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
          Label quick reference
        </p>
        {product.restricted_use && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white"
            style={{ backgroundColor: BRAND.error }}
          >
            [!] RESTRICTED USE
          </span>
        )}
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <Stat label="Max rate" value={formatRate(product)} />
        <Stat
          label="Max wind"
          value={product.max_wind_speed != null ? `${product.max_wind_speed} mph` : '-'}
        />
        <Stat
          label="Temp range"
          value={
            product.min_temp != null && product.max_temp != null
              ? `${product.min_temp}-${product.max_temp}F`
              : '-'
          }
        />
        <Stat
          label="Re-entry"
          value={
            product.re_entry_interval_hours != null
              ? `${product.re_entry_interval_hours} hrs`
              : '-'
          }
        />
      </dl>

      {(product.epa_label_url || product.sds_url) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t pt-2" style={{ borderColor: BRAND.border }}>
          {product.epa_label_url && (
            <a
              href={product.epa_label_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-2 py-1 text-xs font-medium"
              style={{ borderColor: BRAND.border, color: BRAND.primary }}
            >
              View full label
            </a>
          )}
          {product.sds_url && (
            <a
              href={product.sds_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-2 py-1 text-xs font-medium"
              style={{ borderColor: BRAND.border, color: BRAND.primary }}
            >
              View safety data
            </a>
          )}
        </div>
      )}
    </div>
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

function formatRate(product: Product): string {
  if (product.max_rate_per_acre == null) return '-'
  return `${product.max_rate_per_acre} ${product.rate_unit}`
}
