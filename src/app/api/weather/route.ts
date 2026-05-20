// GET /api/weather?lat=X&lng=Y -- live conditions + 5-day forecast.
// Order: auth -> rate limit -> input -> upstream fetch (parallel).
// Auth: any signed-in role (manager dashboard + contractor form).
// Rate limit: 60/hr per user.
// 200 { current, forecast }; 400/401/429/502 { error }.

import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import {
  fetchCurrentConditions,
  fetchForecastAtCoordinates,
  type CurrentConditions,
  type ForecastDay,
} from '@/lib/weather'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const err = (status: number, msg: string) => NextResponse.json({ error: msg }, { status })

export interface WeatherResponse {
  current: CurrentConditions
  forecast: ForecastDay[]
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return err(401, 'Unauthorized')

  const allowed = await rateLimit(user.id, 'weather:fetch')
  if (!allowed) return err(429, 'Too many requests')

  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return err(400, 'Invalid coordinates')
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return err(400, 'Invalid coordinates')

  try {
    const [current, forecast] = await Promise.all([
      fetchCurrentConditions(lat, lng),
      fetchForecastAtCoordinates(lat, lng),
    ])
    const body: WeatherResponse = { current, forecast }
    return NextResponse.json(body)
  } catch (e) {
    console.error('[api/weather] upstream failed', e)
    return err(502, 'Weather provider unavailable')
  }
}
