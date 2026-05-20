import { SafetyGauge } from '@/components/ui/SafetyGauge'
import { BRAND } from '@/constants'
import type { Product } from '@/types'
import { RecentUseCard, type RecentUse } from './RecentUseCard'

export type { RecentUse }

// Full product page for /contractor/products/[id]. Sections mirror the spec
// in docs/phases/phase-05-polish-seed.md Module 5.5: product header, app
// requirements, weather requirements (with gauges), safety intervals,
// documentation (EPA label / SDS), and recent use on this operation.

interface Props {
  product: Product
  lastApp: RecentUse | null
}

const WIND_SCALE_MAX = 20
const TEMP_SCALE_MIN = 20
const TEMP_SCALE_MAX = 110

export function ProductDetail({ product: p, lastApp }: Props) {
  return (
    <div className="mt-3 space-y-4">
      <Header product={p} />
      <ApplicationRequirements product={p} />
      <WeatherRequirements product={p} />
      <SafetyIntervals product={p} />
      <Documentation product={p} />
      {lastApp && <RecentUseCard lastApp={lastApp} />}
    </div>
  )
}

function Header({ product: p }: { product: Product }) {
  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold" style={{ color: BRAND.primary }}>{p.name}</h1>
          <p className="mt-0.5 text-xs" style={{ color: BRAND.textLight }}>
            EPA {p.epa_reg_number}
            {p.active_ingredient ? ` · ${p.active_ingredient}` : ''}
          </p>
        </div>
        {p.restricted_use && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white"
            style={{ backgroundColor: BRAND.error }}
          >
            [!] RESTRICTED
          </span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <Stat label="Use class" value={p.use_classification ?? '-'} />
        <Stat label="Signal word" value={p.signal_word ?? '-'} />
      </dl>
    </section>
  )
}

function ApplicationRequirements({ product: p }: { product: Product }) {
  return (
    <Card title="Application requirements">
      <Line
        label="Max application rate"
        value={p.max_rate_per_acre != null ? `${p.max_rate_per_acre} ${p.rate_unit}` : '-'}
      />
      <Line label="Application method" value={p.application_method ?? '-'} />
      <Line label="Target pests" value={p.target_pests?.join(', ') || '-'} />
      <Line label="Compatible crops" value={p.compatible_crops?.join(', ') || '-'} />
    </Card>
  )
}

function WeatherRequirements({ product: p }: { product: Product }) {
  return (
    <Card title="Weather requirements">
      <div className="space-y-4">
        <SafetyGauge
          label="Wind speed"
          unit=" mph"
          scaleMin={0}
          scaleMax={WIND_SCALE_MAX}
          safeMin={null}
          safeMax={p.max_wind_speed}
        />
        <SafetyGauge
          label="Temperature"
          unit="F"
          scaleMin={TEMP_SCALE_MIN}
          scaleMax={TEMP_SCALE_MAX}
          safeMin={p.min_temp}
          safeMax={p.max_temp}
        />
      </div>
    </Card>
  )
}

function SafetyIntervals({ product: p }: { product: Product }) {
  return (
    <Card title="Safety intervals">
      <Line
        label="Re-entry interval"
        value={
          p.re_entry_interval_hours != null
            ? `${p.re_entry_interval_hours} hours after application`
            : 'Not specified'
        }
      />
      <Line
        label="Pre-harvest interval"
        value={
          p.pre_harvest_interval_days != null
            ? `${p.pre_harvest_interval_days} days before harvest`
            : 'Not specified'
        }
      />
    </Card>
  )
}

function Documentation({ product: p }: { product: Product }) {
  const hasLabel = !!p.epa_label_url
  const hasSds = !!p.sds_url
  return (
    <Card title="Documentation">
      <div className="flex flex-col gap-2">
        {hasLabel ? (
          <a
            href={p.epa_label_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded border px-3 py-2 text-center text-sm font-medium"
            style={{ borderColor: BRAND.border, color: BRAND.primary }}
          >
            View EPA Label
          </a>
        ) : (
          <p className="text-xs" style={{ color: BRAND.textLight }}>
            EPA label URL not on file.
          </p>
        )}
        {hasSds && (
          <a
            href={p.sds_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded border px-3 py-2 text-center text-sm font-medium"
            style={{ borderColor: BRAND.border, color: BRAND.primary }}
          >
            View Safety Data Sheet
          </a>
        )}
        {!hasSds && (
          <p className="text-xs" style={{ color: BRAND.textLight }}>
            Safety data sheet not available.
          </p>
        )}
      </div>
    </Card>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span style={{ color: BRAND.textLight }}>{label}</span>
      <span className="text-right font-medium" style={{ color: BRAND.text }}>{value}</span>
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
