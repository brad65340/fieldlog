'use client'

import type { ReactNode } from 'react'
import { BRAND } from '@/constants'

// Shared form primitives for the contractor surface. Section is a card-style
// wrapper, Row a labelled field, and INPUT_CLS/INPUT_STYLE pin the input look
// across the form. Kept generic so future contractor forms can reuse them.

export const INPUT_CLS = 'w-full rounded border px-3 py-2 text-base'
export const INPUT_STYLE = { borderColor: BRAND.border }

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
