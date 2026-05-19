'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Field } from '@/types'

export function useFields() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()
        const { data, error: e } = await supabase.from('fields').select('*').order('name')
        if (cancelled) return
        if (e) setError(e.message)
        else setFields(data ?? [])
      } catch (err) {
        if (cancelled) return
        console.error('[useFields] load failed', err)
        setError(err instanceof Error ? err.message : 'Failed to load fields')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { fields, loading, error }
}
