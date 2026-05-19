'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()
        const { data, error: e } = await supabase.from('products').select('*').order('name')
        if (cancelled) return
        if (e) setError(e.message)
        else setProducts(data ?? [])
      } catch (err) {
        if (cancelled) return
        console.error('[useProducts] load failed', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading, error }
}
