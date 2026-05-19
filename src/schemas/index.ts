// Zod schemas. Single source of truth for runtime validation at API boundaries.
// All schemas live here so a Phase 6 security review can audit input validation
// in one place.

import { z } from 'zod'

// POST /api/applications request body.
// lat/lng are optional: when missing, the route marks compliance_status='pending'
// and skips weather + compliance entirely (offline-submit / no-GPS-permission
// fallback). When present, the route fetches weather and runs the compliance
// engine server-side.
export const ApplicationSubmitSchema = z.object({
  field_id: z.string().uuid(),
  product_id: z.string().uuid(),
  rate_applied: z.number().positive(),
  rate_unit: z.string().min(1).max(50),
  acreage_treated: z.number().positive(),
  target_pest: z.string().max(200).optional(),
  application_start: z.iso.datetime(),
  application_end: z.iso.datetime().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  notes: z.string().max(1000).optional(),
})

export type ApplicationSubmitInput = z.infer<typeof ApplicationSubmitSchema>
