// Per-route rate limiting via Upstash Redis.
//
// Limits come from SECURITY.md (per-route table). Add a key here when adding
// a new rate-limited route; the type system forces the caller to use a
// declared route name.
//
// Behavior when Upstash env vars are missing:
//   - In NODE_ENV !== 'production': skip the check (returns true), log once
//     per process. Lets local dev run without standing up Redis.
//   - In production: throws. Rate limiting is a security control and silent
//     fallback in prod is a security regression we will not tolerate.

import { Ratelimit, type Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const LIMITS = {
  'applications:submit': { limit: 10, window: '1 m' as Duration },
  'contractors:create':  { limit: 20, window: '1 h' as Duration },
  'export:pdf':          { limit: 30, window: '1 h' as Duration },
  'weather:fetch':       { limit: 60, window: '1 h' as Duration },
} as const

type RouteName = keyof typeof LIMITS

let redisSingleton: Redis | null = null
const limiters: Partial<Record<RouteName, Ratelimit>> = {}
let warnedMissingEnv = false

function getRedis(): Redis | null {
  if (redisSingleton) return redisSingleton
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redisSingleton = new Redis({ url, token })
  return redisSingleton
}

function getLimiter(routeName: RouteName, redis: Redis): Ratelimit {
  let limiter = limiters[routeName]
  if (!limiter) {
    const { limit, window } = LIMITS[routeName]
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(limit, window),
      prefix: `fieldlog:${routeName}`,
      analytics: false,
    })
    limiters[routeName] = limiter
  }
  return limiter
}

export async function rateLimit(userId: string, routeName: RouteName): Promise<boolean> {
  const redis = getRedis()
  if (!redis) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('UPSTASH_REDIS_REST_URL / _TOKEN must be configured in production')
    }
    if (!warnedMissingEnv) {
      console.warn('[ratelimit] Upstash env vars missing; rate limiting disabled in dev')
      warnedMissingEnv = true
    }
    return true
  }
  const { success } = await getLimiter(routeName, redis).limit(userId)
  return success
}
