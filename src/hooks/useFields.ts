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
    const supabase = createClient()
    supabase
      .from('fields')
      .select('*')
      .order('name')
      .then(({ data, error: e }) => {
        if (cancelled) return
        if (e) setError(e.message)
        else setFields(data ?? [])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { fields, loading, error }
}
