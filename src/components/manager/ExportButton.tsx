'use client'

import { useState } from 'react'
import { BRAND } from '@/constants'

// Triggers GET /api/export/[id] -- that endpoint lands in Phase 4. Until then
// the fetch returns 404 and the button shows a friendly placeholder error.
// Phase 4 doesn't need to change this file: just shipping the route makes the
// download path light up.

export function ExportButton({ applicationId }: { applicationId: string }) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch(`/api/export/${applicationId}`)
      if (!res.ok) {
        setError(
          res.status === 404
            ? 'PDF export is not available yet (Phase 4).'
            : `Export failed (${res.status}).`
        )
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `FieldLog-Audit-${applicationId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[ExportButton] failed', err)
      setError('Network error. Try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="w-full rounded px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: BRAND.primary }}
      >
        {exporting ? 'Generating PDF...' : 'Download Audit PDF'}
      </button>
      {error && <p className="mt-2 text-sm" style={{ color: BRAND.error }}>{error}</p>}
    </div>
  )
}
