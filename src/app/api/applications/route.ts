// POST /api/applications -- submit a pesticide application.
// Order: auth -> role -> rate limit -> input -> ownership -> business logic.
// Weather + compliance run server-side (ADR-002). Row immutable on insert (ADR-001).
// 201 { applicationId, complianceStatus, flags }; 400/401/404/429/500 { error }.
// Never 403 for unauthorized resources -- always 404 (Hard Rule 7).

import { type NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ApplicationSubmitSchema } from '@/schemas'
import { rateLimit } from '@/lib/ratelimit'
import { checkCompliance } from '@/lib/compliance'
import { fetchWeatherAtCoordinates, type WeatherData } from '@/lib/weather'
import { COMPLIANCE_STATUS, USER_ROLES } from '@/constants'
import type { ComplianceStatus } from '@/constants'

const err = (status: number, msg: string) =>
  NextResponse.json({ error: msg }, { status })

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return err(401, 'Unauthorized')

  // 2. Role check (and grab operation_id while we're here)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, operation_id')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== USER_ROLES.contractor) return err(401, 'Unauthorized')

  // 3. Rate limit
  const allowed = await rateLimit(user.id, 'applications:submit')
  if (!allowed) return err(429, 'Too many requests')

  // 4. Input validation
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return err(400, 'Invalid input')
  }
  const parsed = ApplicationSubmitSchema.safeParse(raw)
  if (!parsed.success) return err(400, 'Invalid input')
  const input = parsed.data

  // 5. Field ownership (must belong to caller's operation)
  const { data: field } = await supabase
    .from('fields')
    .select('id')
    .eq('id', input.field_id)
    .eq('operation_id', profile.operation_id)
    .maybeSingle()
  if (!field) return err(404, 'Not found')

  // 6. Product (global catalog; existence check only)
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', input.product_id)
    .maybeSingle()
  if (!product) return err(404, 'Not found')

  // 7+8. Weather + compliance (only if GPS captured; otherwise pending)
  let weather: WeatherData | null = null
  let complianceStatus: ComplianceStatus = COMPLIANCE_STATUS.pending
  let complianceFlags: string[] | null = null

  if (input.lat !== undefined && input.lng !== undefined) {
    try {
      weather = await fetchWeatherAtCoordinates(input.lat, input.lng)
      const result = checkCompliance(
        product,
        { wind_speed: weather.wind_speed, temperature: weather.temperature },
        { rate_applied: input.rate_applied }
      )
      complianceStatus = result.status
      complianceFlags = result.flags
    } catch (err) {
      // Weather fetch failed -- record application as pending. Don't fail
      // the request: the contractor's record of work still gets captured.
      console.error('[applications] weather fetch failed', err)
    }
  }

  // 9. Insert application via the user's authenticated client (RLS applies)
  const { data: inserted, error: appErr } = await supabase
    .from('applications')
    .insert({
      operation_id: profile.operation_id,
      contractor_id: user.id,
      field_id: input.field_id,
      product_id: input.product_id,
      rate_applied: input.rate_applied,
      rate_unit: input.rate_unit,
      acreage_treated: input.acreage_treated,
      target_pest: input.target_pest ?? null,
      application_start: input.application_start,
      application_end: input.application_end ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      compliance_status: complianceStatus,
      compliance_flags: complianceFlags,
      notes: input.notes ?? null,
    })
    .select('id')
    .single()
  if (appErr || !inserted) {
    console.error('[applications] insert failed', appErr)
    return err(500, 'Internal server error')
  }

  // 9b. Insert weather_snapshot via service-role client (ADR-002 -- no
  // user-facing INSERT policy on weather_snapshots, so the anon client
  // would be rejected).
  if (weather) {
    const admin = createServiceClient()
    const { error: wErr } = await admin.from('weather_snapshots').insert({
      application_id: inserted.id,
      wind_speed: weather.wind_speed,
      wind_direction: weather.wind_direction,
      temperature: weather.temperature,
      humidity: weather.humidity,
      conditions: weather.conditions,
    })
    if (wErr) {
      // Application is already in. Log and continue -- weather can be
      // backfilled later. Returning success keeps the contractor's UI
      // truthful: the application IS logged.
      console.error('[applications] weather_snapshot insert failed', wErr)
    }
  }

  // 10. Response
  return NextResponse.json(
    {
      applicationId: inserted.id,
      complianceStatus,
      flags: complianceFlags ?? [],
    },
    { status: 201 }
  )
}
