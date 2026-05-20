// "See it in action" -- 2-second visual that tells the whole story per
// Module 5.9 spec. Three static panels mirror the real manager dashboard:
// the red FLAGGED row, the compliance donut, and a field-status card with
// active re-entry restriction. Colors and glyphs match COMPLIANCE_PALETTE so
// the mockup reads the same colorblind-safe way as the live product.

import { COMPLIANCE_PALETTE } from '@/constants'

export function SeeItInAction() {
  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#2C3E50' }}>
            See It In Action
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: '#4a4a68' }}>
            A wind-violation caught in real time. The manager sees it the moment the contractor submits.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FlaggedRowMockup />
          <ComplianceDonutMockup />
          <FieldStatusMockup />
        </div>
      </div>
    </section>
  )
}

function FlaggedRowMockup() {
  const flagged = COMPLIANCE_PALETTE.flagged
  return (
    <article
      className="rounded-lg border bg-white p-4 shadow-sm"
      style={{
        borderColor: '#e8e7e5',
        borderLeftColor: flagged.solid,
        borderLeftWidth: 4,
        backgroundColor: flagged.bg,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#4a4a68' }}>
        Application table
      </p>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold" style={{ color: '#2C3E50' }}>
            North Field · Maria Santos
          </p>
          <p className="text-xs" style={{ color: '#4a4a68' }}>
            Roundup PowerMax 3 · EPA 524-549
          </p>
        </div>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white"
          style={{ backgroundColor: flagged.solid }}
        >
          {flagged.symbol} {flagged.label}
        </span>
      </div>
      <p className="mt-3 text-xs" style={{ color: '#4a4a68' }}>
        May 17 · wind 14.2 mph · 66F
      </p>
      <p className="mt-2 text-xs font-medium" style={{ color: '#991B1B' }}>
        [!] Wind 14.2 mph exceeded label limit of 10 mph
      </p>
    </article>
  )
}

function ComplianceDonutMockup() {
  const compliant = COMPLIANCE_PALETTE.compliant
  const flagged = COMPLIANCE_PALETTE.flagged
  const pending = COMPLIANCE_PALETTE.pending
  // Donut math: outer circumference = 2*pi*r. r=42 -> C = ~264.
  // 5 compliant / 1 flagged / 2 pending of 8 total.
  const C = 2 * Math.PI * 42
  const compliantArc = (5 / 8) * C
  const flaggedArc = (1 / 8) * C
  const pendingArc = (2 / 8) * C

  return (
    <article
      className="rounded-lg border bg-white p-4 shadow-sm"
      style={{ borderColor: '#e8e7e5' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#4a4a68' }}>
        Compliance breakdown
      </p>
      <div className="mt-2 flex items-center justify-center">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="transparent" stroke={compliant.solid} strokeWidth="14" strokeDasharray={`${compliantArc} ${C}`} />
            <circle cx="50" cy="50" r="42" fill="transparent" stroke={flagged.solid} strokeWidth="14" strokeDasharray={`${flaggedArc} ${C}`} strokeDashoffset={`-${compliantArc}`} />
            <circle cx="50" cy="50" r="42" fill="transparent" stroke={pending.solid} strokeWidth="14" strokeDasharray={`${pendingArc} ${C}`} strokeDashoffset={`-${compliantArc + flaggedArc}`} />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color: '#2C3E50' }}>62%</span>
            <span className="text-[9px] uppercase tracking-wide" style={{ color: '#4a4a68' }}>
              compliant
            </span>
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        <LegendRow palette={compliant} count={5} />
        <LegendRow palette={flagged} count={1} />
        <LegendRow palette={pending} count={2} />
      </ul>
    </article>
  )
}

function LegendRow({
  palette,
  count,
}: {
  palette: { solid: string; symbol: string; label: string }
  count: number
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: palette.solid }}
        >
          {palette.symbol}
        </span>
        <span style={{ color: '#1a1a2e' }}>{palette.label}</span>
      </span>
      <span style={{ color: '#4a4a68' }}>{count}</span>
    </li>
  )
}

function FieldStatusMockup() {
  const flagged = COMPLIANCE_PALETTE.flagged
  const compliant = COMPLIANCE_PALETTE.compliant
  return (
    <article
      className="rounded-lg border bg-white p-4 shadow-sm"
      style={{ borderColor: '#e8e7e5' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#4a4a68' }}>
        Field status
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="font-semibold" style={{ color: '#2C3E50' }}>
          East Timber Field
        </p>
        <p className="text-xs" style={{ color: '#4a4a68' }}>
          60 ac
        </p>
      </div>
      <p className="mt-1 text-xs" style={{ color: '#4a4a68' }}>
        Last: May 20 · Liberty 280 SL · Tyler Reed
      </p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="uppercase tracking-wider" style={{ color: '#4a4a68' }}>
          Re-entry
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: flagged.solid }}
          >
            {flagged.symbol}
          </span>
          <span className="font-medium" style={{ color: '#1a1a2e' }}>
            Restricted until 7:14 PM
          </span>
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="uppercase tracking-wider" style={{ color: '#4a4a68' }}>
          Pre-harvest
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: compliant.solid }}
          >
            {compliant.symbol}
          </span>
          <span className="font-medium" style={{ color: '#1a1a2e' }}>
            Harvest after May 27
          </span>
        </span>
      </div>
    </article>
  )
}
