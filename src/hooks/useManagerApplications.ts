'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Application } from '@/types'

// Joined row shape the dashboard works with. Joins per Phase 3 decisions B2/B3:
// products include re-entry + pre-harvest intervals (Phase 5 field cards),
// fields and applications both carry lat/lng (Phase 5 map).
export type ManagerApplicationRow = Application & {
  profiles: { first_name: string; last_name: string } | null
  fields: { name: string; lat: number | null; lng: number | null } | null
  products: {
    name: string
    epa_reg_number: string
    re_entry_interval_hours: number | null
    pre_harvest_interval_days: number | null
  } | null
  weather_snapshots: {
    wind_speed: number | null
    temperature: number | null
    conditions: string | null
  } | null
}

const POLL_INTERVAL_MS = 30_000

export function useManagerApplications() {
  const [applications, setApplications] = useState<ManagerApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error: e } = await supabase
        .from('applications')
        .select(
          '*, profiles(first_name, last_name), fields(name, lat, lng), products(name, epa_reg_number, re_entry_interval_hours, pre_harvest_interval_days), weather_snapshots(wind_speed, temperature, conditions)'
        )
        .order('submitted_at', { ascending: false })
        .limit(100)
      if (e) {
        setError(e.message)
      } else {
        setApplications((data as ManagerApplicationRow[] | null) ?? [])
        setError(null)
      }
    } catch (err) {
      console.error('[useManagerApplications] refetch failed', err)
      setError(err instanceof Error ? err.message : 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void refetch()
    const interval = setInterval(() => {
      if (!cancelled) void refetch()
    }, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [refetch])

  return { applications, loading, error, refetch }
}
