'use client'

import { useEffect, useState } from 'react'
import type { WeatherResponse } from '@/app/api/weather/route'

// Polls GET /api/weather every POLL_INTERVAL_MS while coords are present.
// Skips polling entirely when lat or lng is null -- callers should pass null
// to defer until they have coordinates (e.g. before GPS capture). Aborts the
// in-flight fetch on unmount / coord change so we don't update unmounted
// components or race-condition into stale state.

const POLL_INTERVAL_MS = 10 * 60 * 1000

interface Result {
  data: WeatherResponse | null
  loading: boolean
  error: string | null
}

export function useWeather(lat: number | null, lng: number | null): Result {
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(lat != null && lng != null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lat == null || lng == null) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, { signal: controller.signal })
        if (cancelled) return
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          setError(body.error ?? `Weather request failed (${res.status})`)
          return
        }
        const body = (await res.json()) as WeatherResponse
        setData(body)
        setError(null)
      } catch (e) {
        if (cancelled) return
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Weather request failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    void load()
    const interval = setInterval(() => {
      if (!cancelled) void load()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      controller.abort()
      clearInterval(interval)
    }
  }, [lat, lng])

  return { data, loading, error }
}
