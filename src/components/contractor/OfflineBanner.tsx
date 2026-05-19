'use client'

import { useEffect, useState } from 'react'

// Visual offline indicator. Listens to window 'online' / 'offline' events
// and shows a banner while navigator.onLine is false.
//
// Phase 2 minimum: visual only. localStorage queueing of pending submissions
// + retry-on-reconnect is a deferred enhancement (noted in BLUEPRINT).

export function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // navigator.onLine is only meaningful in the browser, hence the effect.
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="w-full px-4 py-2 text-center text-sm font-medium"
      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
    >
      You are offline. Submit when your connection is restored.
    </div>
  )
}
