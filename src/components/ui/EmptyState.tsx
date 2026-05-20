import type { ReactNode } from 'react'
import { BRAND, COMPLIANCE_PALETTE } from '@/constants'

// Designed empty state used in place of bare "No X yet" text. Carries a
// glyph + headline + body so the absence reads as deliberate. Use the
// `tone` prop to switch between informational (default), success (zero-flags
// callout), and error (failed load) variants -- colors come from
// COMPLIANCE_PALETTE so the visual language matches every other status
// surface in the app.

type Tone = 'neutral' | 'success' | 'error'

interface Props {
  title: string
  body?: ReactNode
  tone?: Tone
  action?: ReactNode
}

export function EmptyState({ title, body, tone = 'neutral', action }: Props) {
  const palette =
    tone === 'success'
      ? COMPLIANCE_PALETTE.compliant
      : tone === 'error'
        ? COMPLIANCE_PALETTE.flagged
        : null

  return (
    <div
      className="flex flex-col items-center rounded-lg border bg-white p-6 text-center"
      style={{ borderColor: BRAND.border }}
    >
      {palette && (
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white"
          style={{ backgroundColor: palette.solid }}
        >
          {palette.symbol}
        </span>
      )}
      <p className={`text-sm font-semibold ${palette ? 'mt-3' : ''}`} style={{ color: BRAND.primary }}>
        {title}
      </p>
      {body && (
        <div className="mt-1 text-xs" style={{ color: BRAND.textLight }}>
          {body}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
