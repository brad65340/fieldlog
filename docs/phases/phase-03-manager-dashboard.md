# Phase 3 — Manager Dashboard

**Goal:** Manager can see all contractor applications across the operation with compliance status badges, drill into individual applications, and manage contractor accounts. This is the demo centerpiece.

**Estimated time:** 4-5 hours

---

## Decisions Locked Before Implementation (2026-05-19)

Confirmed before any Phase 3 code lands. These supersede the original module specs where they conflict. Phase 5 must respect them.

**Layout / structure:**
- **A1.** Manager dashboard is a two-column layout. Left column ~60% (filter bar + application table). Right column ~40% with placeholder slots (rendered in Phase 5: compliance donut, WeatherPanel, ForecastStrip, FieldStatusCards). Full-width slot below both columns for the Leaflet map (Phase 5). Mobile collapses to single column, table-first.
- **A2.** Application detail is a two-column layout: details + product info on the left, weather + label requirements on the right. Single column on mobile.
- **A3.** `StatsRow` lives at `src/components/manager/StatsRow.tsx`. Compliant green is `#16A34A`, flagged red is `#DC2626`. No pulse animation in Phase 3 (Phase 5 adds it).
- **A4.** `ComplianceBadge` already exists at `src/components/ui/ComplianceBadge.tsx` (Phase 2.4). Reuse it. Do NOT build a duplicate in `src/components/manager/`. Phase 3 ships without status icons (text-only labels); Phase 5 can add icons if desired.

**Data shape:**
- **B1.** Application detail fetch joins `operations(name)` even though the detail UI doesn't display it -- Phase 4 PDF needs it and reuses the same fetch.
- **B2.** Product join includes `re_entry_interval_hours` and `pre_harvest_interval_days` -- Phase 5 Field Status Cards compute re-entry status from these.
- **B3.** `useManagerApplications` and the detail fetch both include `lat` and `lng` on applications, and `lat` and `lng` on fields (already in select). Phase 5 map needs these.
- **B4.** `useManagerApplications` implements `setInterval(refetch, 30000)` -- 30-second polling. Cleanup on unmount. Manual refresh button calls `refetch()` directly. (Decision was originally 5s; tightened to 30s to reduce request volume per open dashboard session.)
- **B5.** `useContractors` returns `ContractorWithStats`: per-contractor `total_applications`, `compliant_count`, `flagged_count`, `last_application_at`. Computed in the hook from a single joined query, not separate fetches.

**Definitions:**
- **C1.** "This season" = current calendar year (Jan 1 of current year through now).
- **C2.** "Active contractor" = distinct `contractor_id` with at least one application in the current calendar year.
- **C3.** Date range filter:
  - "This Week" = Monday 00:00 of current ISO week through now.
  - "This Month" = day 1 00:00 of current calendar month through now.
  - "All Time" = no date filter.

**Security:**
- **D3.** Temporary password generation in `POST /api/contractors` uses `crypto.randomUUID().replace(/-/g, '')` (32 hex chars, cryptographically secure). NOT `Math.random()`. The `tempPassword` is returned in the response body once; it must never be written to server logs.

**Architecture:**
- **F.** The joined application-by-id fetch lives at `src/lib/queries/getApplicationById.ts`. Both `src/app/manager/applications/[id]/page.tsx` (Phase 3) and `src/app/api/export/[id]/route.ts` (Phase 4) import from it. Single source of truth for the joined query shape.

---

## Module 3.1 — Manager Applications Dashboard

This is the most important screen in the demo. The flagged applications must be visually obvious.

### Page: src/app/manager/page.tsx

Main dashboard. Server component. Two-column layout per A1: left column (60%) holds FilterBar + ApplicationTable, right column (40%) holds placeholder slots for Phase 5 widgets (ComplianceChart, WeatherPanel, ForecastStrip, FieldStatusCards). Full-width slot below both columns for the Phase 5 ApplicationMap. Mobile collapses to single column, table-first.

### Hook: src/hooks/useManagerApplications.ts

```typescript
// Returns ALL applications in the operation visible to the current manager.
// Joins (B2, B3):
//   profiles(first_name, last_name)
//   fields(name, lat, lng)
//   products(name, epa_reg_number, re_entry_interval_hours, pre_harvest_interval_days)
//   weather_snapshots(wind_speed, temperature, conditions)
// Applications selected with lat + lng (B3).
// Orders by submitted_at DESC. Limit 100.
// Supports filters: contractor_id, compliance_status, date_range
//   (date_range bounded per C3: 'week' | 'month' | 'all').
// Polls via setInterval(refetch, 30000) (B4). Cleanup on unmount.
// Returns: { applications, loading, error, refetch, filters, setFilters }
```

### Component: src/components/manager/ApplicationTable.tsx

Lives in the left column of the dashboard layout (per A1). **Mobile: card layout. Desktop: table layout.**

Each row/card shows:
- Contractor name (first + last)
- Field name
- Product name
- Application date/time
- ComplianceBadge (reused from `src/components/ui/ComplianceBadge.tsx` per A4)
- Weather snapshot: wind speed + temperature (small text)
- Chevron / row-clickable to detail view

**FLAGGED rows must visually stand out.** Use:
- Red left border on card
- Light red background tint on table row
- ComplianceBadge already renders in red for flagged status

### ComplianceBadge

Reuse `src/components/ui/ComplianceBadge.tsx` from Phase 2.4 (per A4). Text-only labels (`COMPLIANT` / `FLAGGED` / `PENDING`) -- no icons in Phase 3. Phase 5 can add icons if desired.

### Filter Bar (src/components/manager/FilterBar.tsx)

Filters on dashboard:
- Status filter: All / Compliant / Flagged / Pending (tab buttons)
- Contractor filter: dropdown (all contractors in operation)
- Date range: This Week / This Month / All Time (tab buttons), bounded per C3:
  - "This Week" = Monday 00:00 of the current ISO week through now
  - "This Month" = day 1 00:00 of the current calendar month through now
  - "All Time" = no date filter

Filters update the `useManagerApplications` hook query parameters.

### Stats Row (src/components/manager/StatsRow.tsx, per A3)

Four stat cards. Computed from the same applications list the hook returns -- no separate fetch.

1. **Total Applications** (this season, per C1: current calendar year). Brand navy background, white text.
2. **Compliant** (count + percentage of total). Green `#16A34A` background, white text.
3. **Flagged** (count). Red `#DC2626` background, white text. No pulse animation in Phase 3 (Phase 5 adds it).
4. **Active Contractors** (per C2: distinct `contractor_id` with at least one application in the current calendar year). Brand navy background, white text.

### Checklist
- [ ] Dashboard loads all applications for operation
- [ ] FLAGGED applications visually distinct (red)
- [ ] Status filter works
- [ ] Contractor filter works
- [ ] Stats row shows correct counts
- [ ] Clicking a row navigates to /manager/applications/[id]

---

## Module 3.2 — Application Detail View

**The deep-dive view. Judges will click into a flagged application.**

### Shared fetch: src/lib/queries/getApplicationById.ts (per F)

Server-side helper. Imported by both the detail page (Phase 3) and the PDF export route (Phase 4). Joins (per B1, B2, B3):
- `profiles(first_name, last_name)`
- `fields(name, acreage, lat, lng)`
- `operations(name)` -- detail UI doesn't display it, but Phase 4 PDF does
- `products(name, epa_reg_number, active_ingredient, restricted_use, max_wind_speed, min_temp, max_temp, max_rate_per_acre, rate_unit, re_entry_interval_hours, pre_harvest_interval_days)`
- `weather_snapshots(*)`

Returns the joined row or `null` if the application doesn't exist OR doesn't belong to the caller's operation. The 404 vs 401 distinction is the caller's responsibility (per Hard Rule 7, return 404 for unauthorized resources).

### Page: src/app/manager/applications/[id]/page.tsx

Server component. Calls `getApplicationById(id, callerOperationId)`. Returns Next.js `notFound()` if null.

### Component: src/components/manager/ApplicationDetail.tsx

Two-column layout per A2. Single column on mobile.

```
Header (full width):
  Application ID (FL-[8]) + Submitted timestamp + ComplianceBadge (large)
  If FLAGGED: full-width red alert box with all flag reasons

Two columns below header (desktop) / stacked (mobile):
  Left column:                       Right column:
    Application Details card           Weather at Application card
    Product Information card           Product Label Requirements card

Full-width below: Export PDF button
```

**Header:**
- Application ID (short -- first 8 chars of UUID)
- Submitted timestamp
- ComplianceBadge (large)
- If FLAGGED: red alert box with all flag reasons listed, one per line

**Compliance Flags Section (if flagged):**
```
RED ALERT BOX:
"Compliance Issues Detected"
  - Wind speed 14.2 mph exceeded label limit of 10 mph
  - [other flags if any]
```

**Application Details:**
- Contractor: full name
- Field: name + acreage
- Product: name + EPA Registration No. + Restricted Use badge
- Application Rate: {rate} {unit}
- Acreage Treated: {acreage} acres
- Target Pest: {pest or "Not specified"}
- Application Start: formatted datetime
- Application End: formatted datetime or "Not recorded"
- GPS Coordinates: {lat}, {lng} (or "Not captured")
- Notes: {notes or "None"}

**Weather at Time of Application:**
- Wind Speed: {speed} mph -- with colored indicator (red if over label limit)
- Wind Direction: {degrees} degrees
- Temperature: {temp}F -- with colored indicator (red if outside label range)
- Humidity: {humidity}%
- Conditions: {conditions}
- Data Source: OpenWeatherMap
- Captured: {timestamp}

**Product Label Requirements:**
- Max Wind Speed: {max} mph
- Temp Range: {min}F - {max}F
- Re-entry Interval: {hours} hours
- Restricted Use: Yes/No

**Export Button:**
- "Download Audit PDF" -- calls GET /api/export/[id]
- Opens PDF in new tab or triggers download

### Checklist
- [ ] Application detail loads correctly with all joins
- [ ] Flagged application shows red alert box with flag reasons
- [ ] Weather data displays with colored indicators for violations
- [ ] Product label requirements shown for comparison
- [ ] Export PDF button present (wired to Phase 4 API)
- [ ] Manager cannot view applications from other operations (404 if wrong operation)

---

## Module 3.3 — Contractor Management

**Manager can create contractor accounts and see contractor activity.**

### Page: src/app/manager/contractors/page.tsx

### API Route: src/app/api/contractors/route.ts

**POST /api/contractors**

```typescript
// Auth: manager role required
// Rate limit: 20 requests per hour per user
// Input schema:
export const CreateContractorSchema = z.object({
  email:      z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name:  z.string().min(1).max(100),
})

// Steps:
// 1. Auth check (manager role)
// 2. Rate limit
// 3. Zod validation
// 4. Get manager's operation_id from their profile
// 5. Use service client to create Supabase auth user with email/password.
//    Temp password (per D3) MUST use crypto.randomUUID().replace(/-/g, '')
//    -- 32 hex chars, cryptographically secure. Do NOT use Math.random().
//    Do NOT log the password server-side.
// 6. Use service client to insert profile:
//    { id: newUser.id, operation_id, role: 'contractor', first_name, last_name, email }
// 7. Return { contractorId, tempPassword }
//    (manager must share temp password with contractor manually -- for demo this is fine)

// Returns 201: { contractorId: string, tempPassword: string }
// Returns 400: { error: 'Invalid input' }
// Returns 401: { error: 'Unauthorized' }
// Returns 409: { error: 'Email already in use' }
```

### Hook: src/hooks/useContractors.ts

```typescript
// Returns all profiles with role='contractor' in manager's operation
// Joins: applications count (total, compliant, flagged) per contractor this season
// Returns: { contractors: ContractorWithStats[], loading, error }

interface ContractorWithStats extends Profile {
  total_applications: number
  compliant_count: number
  flagged_count: number
  last_application_at: string | null
}
```

### Component: src/components/manager/ContractorList.tsx

List of contractor cards. Each card shows:
- Name (first + last)
- Email
- Total applications this season
- Flagged count (red if > 0)
- Last application date
- Status dots for recent applications (green/red dots for last 5 logs)

**Create Contractor Form (inline or modal):**
- First name, last name, email
- Submit creates contractor via POST /api/contractors
- Show temp password after creation: "Share this password with {name}: [password]"
- Clear password from UI after 30 seconds

### Checklist
- [ ] Contractor list shows all contractors in operation
- [ ] Flagged count shows in red when > 0
- [ ] Create contractor form works end-to-end
- [ ] Temp password shown after creation
- [ ] POST /api/contractors requires manager role
- [ ] New contractor can log in with temp password
- [ ] New contractor can submit an application

---

## Phase 3 Acceptance Criteria

- [ ] Manager dashboard loads all applications for operation
- [ ] FLAGGED applications are visually distinct
- [ ] Filters work (status, contractor, date)
- [ ] Application detail shows full data including weather
- [ ] Flagged detail shows flag reasons in red alert
- [ ] Contractor management page lists all contractors
- [ ] Create contractor works end-to-end
- [ ] Manager cannot access other operations' data (verified)
- [ ] pnpm run build passes 0 errors
- [ ] Handoff written to docs/handoffs/phase-03-complete.md
- [ ] Committed: "feat: Phase 3 complete - Manager Dashboard"
- [ ] Tagged: git tag phase-03-complete

---

## Phase 3 API Contract (Locked After Phase Complete)

### POST /api/contractors
- Auth: required (manager)
- Body: CreateContractorSchema
- Returns 201: { contractorId: string, tempPassword: string }
- Returns 400, 401, 409

### GET /manager (page)
- Auth: required (manager role)
- Shows all applications, stats, filter bar

### GET /manager/applications/[id] (page)
- Auth: required (manager role)
- Shows full application detail
- Returns 404 if not in operation

### GET /manager/contractors (page)
- Auth: required (manager role)
- Shows contractor list + create form
