import { BRAND } from '@/constants'

// Lightweight skeleton primitive used in place of "Loading..." text while
// data is in flight. Pulses via Tailwind's animate-pulse + a soft grey fill
// matched to BRAND.border so it reads as a placeholder, not active content.

interface Props {
  className?: string
  width?: string
  height?: string
  radius?: string
}

export function Skeleton({ className = '', width, height = '1rem', radius = '0.375rem' }: Props) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        backgroundColor: BRAND.border,
        width,
        height,
        borderRadius: radius,
      }}
      aria-hidden
    />
  )
}

export function SkeletonCard({ height = '6rem' }: { height?: string }) {
  return (
    <div
      className="animate-pulse rounded-lg border bg-white p-4"
      style={{ borderColor: BRAND.border, height }}
      aria-hidden
    >
      <div className="h-3 w-24 rounded" style={{ backgroundColor: BRAND.border }} />
      <div className="mt-3 h-3 w-3/4 rounded" style={{ backgroundColor: BRAND.border }} />
      <div className="mt-2 h-3 w-1/2 rounded" style={{ backgroundColor: BRAND.border }} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div
      className="animate-pulse rounded border bg-white p-4"
      style={{ borderColor: BRAND.border }}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-1/2 rounded" style={{ backgroundColor: BRAND.border }} />
          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: BRAND.border }} />
        </div>
        <div className="h-5 w-20 rounded-full" style={{ backgroundColor: BRAND.border }} />
      </div>
      <div className="mt-3 h-3 w-2/5 rounded" style={{ backgroundColor: BRAND.border }} />
    </div>
  )
}
