// Shared server-side query for a single application by id.
//
// Imported by:
//   - src/app/manager/applications/[id]/page.tsx  (Phase 3 detail page)
//   - src/app/api/export/[id]/route.ts            (Phase 4 PDF route)
//
// Joins per Phase 3 locked decisions:
//   - B1: operations(name) -- detail UI doesn't show it, Phase 4 PDF does
//   - B2: products include re_entry_interval_hours + pre_harvest_interval_days
//   - B3: lat/lng on applications + fields
//
// Returns null when:
//   - the row does not exist, OR
//   - the row exists but belongs to a different operation than the caller.
// Caller (page or API route) should map null -> 404 (Hard Rule 7: never 403).
//
// The .eq('operation_id', callerOperationId) filter is belt-and-suspenders --
// RLS already scopes SELECT on applications to current_user_operation_id(),
// so a wrong-op id would return null via RLS too. Explicit filter makes the
// ownership intent legible in the helper.

import { createClient } from '@/lib/supabase/server'
import type { Application, Field, Operation, Product, Profile, WeatherSnapshot } from '@/types'

export type ApplicationDetailRow = Application & {
  profiles: Pick<Profile, 'first_name' | 'last_name'> | null
  fields: Pick<Field, 'name' | 'acreage' | 'lat' | 'lng'> | null
  operations: Pick<Operation, 'name'> | null
  products: Pick<
    Product,
    | 'name'
    | 'epa_reg_number'
    | 'active_ingredient'
    | 'restricted_use'
    | 'max_wind_speed'
    | 'min_temp'
    | 'max_temp'
    | 'max_rate_per_acre'
    | 'rate_unit'
    | 're_entry_interval_hours'
    | 'pre_harvest_interval_days'
  > | null
  weather_snapshots: WeatherSnapshot | null
}

export async function getApplicationById(
  id: string,
  callerOperationId: string
): Promise<ApplicationDetailRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select(
      '*, profiles(first_name, last_name), fields(name, acreage, lat, lng), operations(name), products(name, epa_reg_number, active_ingredient, restricted_use, max_wind_speed, min_temp, max_temp, max_rate_per_acre, rate_unit, re_entry_interval_hours, pre_harvest_interval_days), weather_snapshots(*)'
    )
    .eq('id', id)
    .eq('operation_id', callerOperationId)
    .maybeSingle()

  if (error) {
    console.error('[getApplicationById] query failed', error)
    return null
  }
  return data as ApplicationDetailRow | null
}
