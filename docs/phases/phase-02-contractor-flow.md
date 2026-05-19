# Phase 2 — Contractor Flow

**Goal:** Contractor can open the app on mobile, log a complete pesticide application, have weather auto-captured from GPS, compliance check run server-side, and receive immediate feedback. The core product loop is complete and working.

**Estimated time:** 4-5 hours

---

## Module 2.1 — Weather + Compliance Libraries

Build these two libraries before any UI. They are the engine of the product.

### src/lib/weather.ts

```typescript
interface WeatherData {
  wind_speed: number      // mph
  wind_direction: number  // degrees
  temperature: number     // fahrenheit
  humidity: number        // percent
  conditions: string      // "Clear", "Clouds", etc.
}

export async function fetchWeatherAtCoordinates(
  lat: number,
  lng: number
): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=imperial`

  const res = await fetch(url, { next: { revalidate: 0 } })

  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`)
  }

  const data = await res.json()

  return {
    wind_speed: Math.round(data.wind.speed * 10) / 10,
    wind_direction: data.wind.deg ?? 0,
    temperature: Math.round(data.main.temp * 10) / 10,
    humidity: data.main.humidity,
    conditions: data.weather[0]?.main ?? 'Unknown',
  }
}
```

### src/lib/compliance.ts

```typescript
import type { Product } from '@/types'

interface WeatherInput {
  wind_speed: number
  temperature: number
}

interface ApplicationInput {
  rate_applied: number
}

interface ComplianceResult {
  status: 'compliant' | 'flagged'
  flags: string[]
}

export function checkCompliance(
  product: Product,
  weather: WeatherInput,
  application: ApplicationInput
): ComplianceResult {
  const flags: string[] = []

  if (product.max_wind_speed !== null && weather.wind_speed > product.max_wind_speed) {
    flags.push(
      `Wind speed ${weather.wind_speed} mph exceeded label limit of ${product.max_wind_speed} mph`
    )
  }

  if (product.min_temp !== null && weather.temperature < product.min_temp) {
    flags.push(
      `Temperature ${weather.temperature}F below label minimum of ${product.min_temp}F`
    )
  }

  if (product.max_temp !== null && weather.temperature > product.max_temp) {
    flags.push(
      `Temperature ${weather.temperature}F exceeded label maximum of ${product.max_temp}F`
    )
  }

  if (
    product.max_rate_per_acre !== null &&
    application.rate_applied > product.max_rate_per_acre
  ) {
    flags.push(
      `Application rate ${application.rate_applied} exceeded label maximum of ${product.max_rate_per_acre} oz/acre`
    )
  }

  return {
    status: flags.length > 0 ? 'flagged' : 'compliant',
    flags,
  }
}
```

### Checklist
- [ ] fetchWeatherAtCoordinates returns correct shape from real API call
- [ ] checkCompliance returns 'flagged' when wind_speed > max_wind_speed
- [ ] checkCompliance returns 'compliant' when all conditions pass
- [ ] checkCompliance collects ALL flags (does not short-circuit on first failure)
- [ ] No API key exposed in client-side code

---

## Module 2.2 — Application Submit API Route

**src/app/api/applications/route.ts**

This is the most important API route in the app. It does everything server-side.

### Zod Schema (src/schemas/index.ts)

```typescript
import { z } from 'zod'

export const ApplicationSubmitSchema = z.object({
  field_id:          z.string().uuid(),
  product_id:        z.string().uuid(),
  rate_applied:      z.number().positive(),
  rate_unit:         z.string().min(1).max(50),
  acreage_treated:   z.number().positive(),
  target_pest:       z.string().max(200).optional(),
  application_start: z.string().datetime(),
  application_end:   z.string().datetime().optional(),
  lat:               z.number().min(-90).max(90).optional(),
  lng:               z.number().min(-180).max(180).optional(),
  notes:             z.string().max(1000).optional(),
})

export type ApplicationSubmitInput = z.infer<typeof ApplicationSubmitSchema>
```

### Route Logic

```typescript
// POST /api/applications
// Auth: contractor role required
// Steps:
// 1. Auth check -- return 401 if not authed
// 2. Role check -- return 403 if not contractor (use 401 message)
// 3. Rate limit -- 10 requests per minute per user
// 4. Input validation -- Zod ApplicationSubmitSchema
// 5. Ownership check -- field_id must belong to caller's operation_id
// 6. Product fetch -- get product label rules
// 7. Weather fetch (server-side) -- lat/lng from request body
// 8. Compliance check -- run checkCompliance()
// 9. Insert application + weather_snapshot (use service client for weather_snapshot)
// 10. Return { applicationId, complianceStatus, flags }

// CRITICAL: Use supabase service client for weather_snapshot insert
// because RLS has no user-facing INSERT policy on weather_snapshots
// Regular anon client insert will fail silently or throw
```

### Return Shape

```typescript
// Success 201:
{
  applicationId: string
  complianceStatus: 'compliant' | 'flagged'
  flags: string[]
}

// Error 400: { error: 'Invalid input' }
// Error 401: { error: 'Unauthorized' }
// Error 404: { error: 'Not found' } (field not in operation)
// Error 429: { error: 'Too many requests' }
// Error 500: { error: 'Internal server error' } (never expose internals)
```

### Checklist
- [ ] Auth check present (step 1)
- [ ] Rate limiting present (step 3)
- [ ] Zod validation present (step 4)
- [ ] Field ownership verified (step 5)
- [ ] Weather fetched server-side (step 7)
- [ ] Compliance check runs (step 8)
- [ ] Application inserted with compliance_status and compliance_flags
- [ ] WeatherSnapshot inserted using service client
- [ ] Returns 201 with complianceStatus and flags
- [ ] No stack traces in error responses

---

## Module 2.3 — Contractor Application Form (UI)

**Target: works well on mobile (375px wide). This is the core contractor experience.**

### Page: src/app/contractor/page.tsx

Shell page. Fetches fields and products via hooks. Renders ApplicationForm component.

### Hook: src/hooks/useFields.ts

```typescript
// Returns fields for the current user's operation
// Uses supabase client (browser)
// Returns: { fields: Field[], loading: boolean, error: string | null }
```

### Hook: src/hooks/useProducts.ts

```typescript
// Returns all products (public read)
// Returns: { products: Product[], loading: boolean, error: string | null }
```

### Component: src/components/contractor/ApplicationForm.tsx

Form fields (in order on mobile):
1. Field selection -- dropdown with field names
2. Product selection -- dropdown showing name + EPA reg number + restricted_use badge
3. Rate Applied -- number input with unit selector (oz/acre default)
4. Acreage Treated -- number input
5. Target Pest -- text input (optional)
6. Application Start -- datetime-local input
7. Notes -- textarea (optional)
8. GPS capture -- "Use My Location" button (calls navigator.geolocation.getCurrentPosition)
   - Show coordinates when captured
   - Show "Location not captured" if denied

On submit:
- Show loading state (disable button, show spinner)
- POST to /api/applications
- On success: show ComplianceResult component (green = compliant, red = flagged with reasons)
- On error: show inline error message
- After showing result, offer "Log Another Application" to reset form

### Component: src/components/contractor/ComplianceResult.tsx

```
COMPLIANT state:
  Green background, checkmark icon
  "Application logged. All label requirements met."
  Timestamp

FLAGGED state:
  Red background, warning icon
  "Application logged with compliance flags."
  List of flag reasons (one per line)
  "This application has been flagged for manager review."
  Timestamp
```

### Offline Banner: src/components/contractor/OfflineBanner.tsx

```typescript
// Uses navigator.onLine and window event listeners
// Shows banner when offline: "You are offline. Application will submit when connection is restored."
// Hide when back online
// For vibeathon: store pending submissions in localStorage
// Retry on reconnect via window 'online' event listener
```

### Checklist
- [ ] Form renders correctly on 375px width (mobile)
- [ ] GPS capture works via browser geolocation API
- [ ] Form submits to POST /api/applications
- [ ] Compliant result shows green result card
- [ ] Flagged result shows red result card with flag reasons listed
- [ ] Form resets after result is shown
- [ ] Loading state prevents double-submit
- [ ] Offline banner shows/hides correctly
- [ ] No fetch() called inside the form component (use hook or submit handler calling fetch directly in the handler is acceptable for one-off POSTs)

---

## Module 2.4 — Contractor History Page

**src/app/contractor/history/page.tsx**

Simple list of the contractor's own past applications.

### Hook: src/hooks/useContractorApplications.ts

```typescript
// Returns applications WHERE contractor_id = auth.uid()
// Joins: fields(name), products(name, epa_reg_number), weather_snapshots(wind_speed, temperature)
// Orders by submitted_at DESC
// Limit 50
// Returns: { applications: ApplicationWithRelations[], loading, error }
```

### UI

Table/card list (cards on mobile). Each card shows:
- Field name
- Product name
- Date/time submitted
- Compliance badge (green COMPLIANT, red FLAGGED, gray PENDING)
- If FLAGGED: show flag reasons on expand

### Checklist
- [ ] Contractor sees only their own applications
- [ ] Compliance badge renders correctly for all three statuses
- [ ] FLAGGED cards show flag reasons
- [ ] Empty state: "No applications logged yet."

---

## Phase 2 Acceptance Criteria

- [ ] POST /api/applications submits successfully with real weather data
- [ ] Compliant submission shows green result
- [ ] Flagged submission (wind violation test data) shows red result with reason
- [ ] Contractor history shows correct records
- [ ] Compliance check engine tested with wind/temp violations
- [ ] No secrets in client-side code
- [ ] pnpm run build passes 0 errors
- [ ] Handoff written to docs/handoffs/phase-02-complete.md
- [ ] Committed: "feat: Phase 2 complete - Contractor Flow"
- [ ] Tagged: git tag phase-02-complete

---

## Phase 2 API Contract (Locked After Phase Complete)

### POST /api/applications
- Auth: required (contractor)
- Body: ApplicationSubmitSchema
- Returns 201: { applicationId: string, complianceStatus: string, flags: string[] }
- Returns 400: { error: string }
- Returns 401: { error: 'Unauthorized' }
- Returns 404: { error: 'Not found' }
- Returns 429: { error: 'Too many requests' }

### GET /contractor (page)
- Auth: required (contractor role)
- Renders ApplicationForm

### GET /contractor/history (page)
- Auth: required (contractor role)
- Renders contractor's past applications
