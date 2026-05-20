'use client'

import { useCallback, useEffect, useState } from 'react'
import { COMPLIANCE_STATUS, USER_ROLES, type ComplianceStatus } from '@/constants'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

// Per B5: ContractorWithStats is derived in the hook from a single joined
// query (profiles + nested applications), not separate fetches.
export interface ContractorWithStats extends Profile {
  total_applications: number
  compliant_count: number
  flagged_count: number
  last_application_at: string | null
  // Newest-first statuses of the last 5 applications. Used for the dots
  // on each contractor card in the manager UI.
  recent_statuses: ComplianceStatus[]
}

interface JoinedRow extends Profile {
  applications: Array<{ compliance_status: ComplianceStatus; submitted_at: string }>
}

const RECENT_LIMIT = 5

export function useContractors() {
  const [contractors, setContractors] = useState<ContractorWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error: e } = await supabase
        .from('profiles')
        .select('*, applications(compliance_status, submitted_at)')
        .eq('role', USER_ROLES.contractor)
        .order('first_name')
      if (e) {
        setError(e.message)
      } else {
        const rows = (data as JoinedRow[] | null) ?? []
        setContractors(rows.map(toStats))
        setError(null)
      }
    } catch (err) {
      console.error('[useContractors] refetch failed', err)
      setError(err instanceof Error ? err.message : 'Failed to load contractors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { contractors, loading, error, refetch }
}

function toStats(row: JoinedRow): ContractorWithStats {
  const apps = row.applications ?? []
  const compliant = apps.filter((a) => a.compliance_status === COMPLIANCE_STATUS.compliant).length
  const flagged = apps.filter((a) => a.compliance_status === COMPLIANCE_STATUS.flagged).length
  const sorted = [...apps].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
  return {
    ...row,
    total_applications: apps.length,
    compliant_count: compliant,
    flagged_count: flagged,
    last_application_at: sorted[0]?.submitted_at ?? null,
    recent_statuses: sorted.slice(0, RECENT_LIMIT).map((a) => a.compliance_status),
  }
}
