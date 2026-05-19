'use client'

import {
  BRAND,
  COMPLIANCE_PALETTE,
  COMPLIANCE_STATUS,
  type ComplianceStatus,
} from '@/constants'

interface Props {
  applicationId: string
  status: ComplianceStatus
  flags: string[]
  submittedAt: string
  onLogAnother: () => void
}

export function ComplianceResult({ applicationId, status, flags, submittedAt, onLogAnother }: Props) {
  const palette = COMPLIANCE_PALETTE[status]

  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: palette.bg, color: palette.fg }}>
      <div className="text-xs font-semibold tracking-wide">{palette.label}</div>

      {status === COMPLIANCE_STATUS.compliant && (
        <p className="mt-2 text-base font-medium">Application logged. All label requirements met.</p>
      )}

      {status === COMPLIANCE_STATUS.flagged && (
        <>
          <p className="mt-2 text-base font-medium">Application logged with compliance flags.</p>
          <ul className="mt-3 space-y-1 text-sm">
            {flags.map((flag, i) => (
              <li key={i}>- {flag}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">This application has been flagged for manager review.</p>
        </>
      )}

      {status === COMPLIANCE_STATUS.pending && (
        <p className="mt-2 text-base font-medium">
          Application logged. Compliance check pending (no GPS captured).
        </p>
      )}

      <p className="mt-4 text-xs opacity-75">
        Submitted {new Date(submittedAt).toLocaleString()} - id {applicationId.slice(0, 8)}
      </p>

      <button
        type="button"
        onClick={onLogAnother}
        className="mt-5 w-full rounded px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: BRAND.primary }}
      >
        Log another application
      </button>
    </div>
  )
}
