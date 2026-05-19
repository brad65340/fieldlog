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
    const supabase = createClient()
    supabase
      .from('products')
      .select('*')
      .order('name')
      .then(({ data, error: e }) => {
        if (cancelled) return
        if (e) setError(e.message)
        else setProducts(data ?? [])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading, error }
}
