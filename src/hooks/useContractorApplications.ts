'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Application } from '@/types'

// Application + the columns we project from joined tables. Postgrest returns
// single-row relations as objects (FK on the same side), so fields/products/
// weather_snapshots are objects, not arrays. weather_snapshots can be null
// when an application was logged without GPS (status=pending).
export type ContractorHistoryRow = Application & {
  fields: { name: string } | null
  products: { name: string; epa_reg_number: string } | null
  weather_snapshots: { wind_speed: number | null; temperature: number | null } | null
}

export function useContractorApplications() {
  const [applications, setApplications] = useState<ContractorHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) setError('Not signed in')
          return
        }
        const { data, error: e } = await supabase
          .from('applications')
          .select(
            '*, fields(name), products(name, epa_reg_number), weather_snapshots(wind_speed, temperature)'
          )
          .eq('contractor_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(50)
        if (cancelled) return
        if (e) setError(e.message)
        else setApplications((data as ContractorHistoryRow[] | null) ?? [])
      } catch (err) {
        if (cancelled) return
        console.error('[useContractorApplications] load failed', err)
        setError(err instanceof Error ? err.message : 'Failed to load applications')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { applications, loading, error }
}
