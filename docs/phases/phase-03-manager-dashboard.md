# Phase 3 — Manager Dashboard

**Goal:** Manager can see all contractor applications across the operation with compliance status badges, drill into individual applications, and manage contractor accounts. This is the demo centerpiece.

**Estimated time:** 4-5 hours

---

## Module 3.1 — Manager Applications Dashboard

This is the most important screen in the demo. The flagged applications must be visually obvious.

### Page: src/app/manager/page.tsx

Main dashboard. Server component. Passes data to client components.

### Hook: src/hooks/useManagerApplications.ts

```typescript
// Returns ALL applications in the operation
// Joins: profiles(first_name, last_name), fields(name), products(name, epa_reg_number),
//        weather_snapshots(wind_speed, temperature, conditions)
// Orders by submitted_at DESC
// Supports filters: contractor_id, field_id, compliance_status, date_range
// Limit 100 for dashboard, cursor paginate for history
// Returns: { applications: ApplicationWithRelations[], loading, error, refetch }
```

### Component: src/components/manager/ApplicationTable.tsx

**Mobile: Card layout. Desktop: Table layout.**

Each row/card shows:
- Contractor name (first + last)
- Field name
- Product name
- Application date/time
- ComplianceBadge (see below)
- Weather snapshot: wind speed + temperature (small text)
- Arrow/chevron to detail view

**FLAGGED rows must visually stand out.** Use:
- Red left border on card
- Red background tint on table row
- ComplianceBadge in red

### Component: src/components/manager/ComplianceBadge.tsx

```typescript
// Status: 'compliant' | 'flagged' | 'pending'

// COMPLIANT: green background, white text, checkmark icon, "COMPLIANT"
// FLAGGED: red background, white text, warning icon, "FLAGGED"
// PENDING: gray background, dark text, clock icon, "PENDING"

// Used in: ApplicationTable, ApplicationDetail, ContractorList summary
```

### Filter Bar (src/components/manager/FilterBar.tsx)

Filters on dashboard:
- Status filter: All / Compliant / Flagged / Pending (tab buttons)
- Contractor filter: dropdown (all contractors in operation)
- Date range: This Week / This Month / All Time (tab buttons)

Filters update the useManagerApplications hook query parameters.

### Stats Row (top of dashboard)

Show 4 stat cards:
1. Total Applications (this spray season)
2. Compliant (count + percentage)
3. Flagged (count -- RED if > 0)
4. Active Contractors

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

### Page: src/app/manager/applications/[id]/page.tsx

Server component. Fetches application by ID with full joins. Verifies application belongs to manager's operation (return 404 if not).

### Component: src/components/manager/ApplicationDetail.tsx

Layout (top to bottom):

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
// 5. Use service client to create Supabase auth user with email/password
//    (generate temp password: Math.random().toString(36).slice(-12))
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
