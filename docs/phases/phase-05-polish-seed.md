# Phase 5 — UI Polish, Charts, Maps, Product Knowledge Base, and Deploy

**Goal:** FieldLog looks and feels like a real production SaaS. Charts, field maps, re-entry timelines, product knowledge base, full polish on every screen. Landing page live. Deployed to Vercel. Demo-ready.

**Estimated time:** 6-8 hours

---

## Dependencies to install before starting

```bash
pnpm add recharts leaflet react-leaflet @types/leaflet
```

---

## Module 5.1 — Seed Data Verification

Seed was run early (Phase 2). Verify everything is still correct before polish work starts.

Run in Supabase SQL Editor:

```sql
SELECT
  (SELECT COUNT(*) FROM applications) as applications,
  (SELECT COUNT(*) FROM applications WHERE compliance_status = 'flagged') as flagged,
  (SELECT COUNT(*) FROM applications WHERE compliance_status = 'compliant') as compliant,
  (SELECT COUNT(*) FROM fields) as fields,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM profiles WHERE role = 'contractor') as contractors;
```

Expected: 8 applications, 2 flagged, 5 compliant, 3 fields, 5 products, 2 contractors.

If counts are off, re-run scripts/seed.ts before continuing.

### Products table — add new columns before polish

Write a new migration: `supabase/migrations/009_add_product_detail_columns.sql`

```sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS signal_word TEXT,
  ADD COLUMN IF NOT EXISTS epa_label_url TEXT,
  ADD COLUMN IF NOT EXISTS sds_url TEXT,
  ADD COLUMN IF NOT EXISTS use_classification TEXT,
  ADD COLUMN IF NOT EXISTS application_method TEXT,
  ADD COLUMN IF NOT EXISTS target_pests TEXT[],
  ADD COLUMN IF NOT EXISTS compatible_crops TEXT[];
```

Then update seed data with real values:

| Product | signal_word | epa_label_url | use_classification |
|---|---|---|---|
| Roundup PowerMax 3 | Caution | https://www.cdms.net/ldat/ld8NC000.pdf | Non-restricted |
| Engenia (Dicamba) | Caution | https://www.cdms.net/ldat/ldABL000.pdf | Restricted Use |
| Atrazine 4L | Caution | https://www.cdms.net/ldat/ld3WF000.pdf | Restricted Use |
| Liberty 280 SL | Caution | https://www.cdms.net/ldat/ldBKN000.pdf | Non-restricted |
| Headline AMP | Caution | https://www.cdms.net/ldat/ldCMQ000.pdf | Non-restricted |

Push migration: `supabase db push`

### Checklist
- [ ] All 6 counts correct
- [ ] Migration 009 pushed
- [ ] Products have epa_label_url and signal_word populated

---

## Module 5.2 — Manager Dashboard Redesign

This is the most important screen. Judges spend the most time here.

### Layout (desktop)

```
[Header: FieldLog logo + nav + user menu]

[Stats Row: 4 cards]
  Total Applications | Compliant | Flagged (RED) | Active Contractors

[Two-column layout]
  Left col (60%): Application table with filters
  Right col (40%): Compliance donut chart + Field status cards

[Full-width below]: Application map (Leaflet)
```

### Stats Row Component: src/components/manager/StatsRow.tsx

Four cards using brand colors:
- Total Applications: navy background, white text, count
- Compliant: green (#16A34A) background, count + percentage
- Flagged: red (#DC2626) background, count — pulse animation if > 0
- Active Contractors: navy, count of contractors with applications this season

### Compliance Donut Chart: src/components/manager/ComplianceChart.tsx

Use Recharts `PieChart` + `Cell`.

```typescript
// Data shape:
const data = [
  { name: 'Compliant', value: compliantCount, color: '#16A34A' },
  { name: 'Flagged', value: flaggedCount, color: '#DC2626' },
  { name: 'Pending', value: pendingCount, color: '#6B7280' },
]
// Center label: compliance rate percentage
// Legend below chart
```

### Application Timeline Chart: src/components/manager/ActivityChart.tsx

Recharts `BarChart` — applications per day for the last 14 days.
Stacked bars: green = compliant, red = flagged, gray = pending.
X axis: date labels. Y axis: count.

```typescript
// One bar group per day
// Stack compliant/flagged/pending
// Tooltip shows counts on hover
```

### Field Status Cards: src/components/manager/FieldStatusCards.tsx

One card per field. Shows:

```
NORTH FIELD                           120 acres
Last Application: May 17 (Roundup PowerMax 3)
Sprayed by: Maria Santos

Re-entry Status:   [GREEN: CLEARED] or [RED: RESTRICTED until May 19 4:00 PM]
Pre-harvest:       Safe to harvest after May 31

Recent: [GREEN dot] [GREEN dot] [RED dot] [GREEN dot] [GREEN dot]
        (last 5 applications, colored by compliance)
```

Calculate re-entry status:
```typescript
const reEntryClears = new Date(lastApp.application_start)
reEntryClears.setHours(reEntryClears.getHours() + product.re_entry_interval_hours)
const isRestricted = new Date() < reEntryClears
```

### Application Map: src/components/manager/ApplicationMap.tsx

Use `react-leaflet`. Dynamic import (no SSR).

```typescript
// Map centered on mean lat/lng of all applications
// One marker per application
// Green marker: compliant
// Red marker: flagged
// Gray marker: pending
// Click marker: popup shows contractor name, product, date, compliance badge
// Clicking popup links to /manager/applications/[id]
```

```typescript
// Dynamic import to avoid SSR issues with Leaflet:
const ApplicationMap = dynamic(
  () => import('@/components/manager/ApplicationMap'),
  { ssr: false }
)
```

Add to global CSS (required for Leaflet):
```css
@import 'leaflet/dist/leaflet.css';
```

### Application Table — polish

- Full-width below map on mobile, right panel on desktop
- Sticky header
- Each row: contractor avatar (initials), field name, product, date, compliance badge, weather summary (wind + temp)
- FLAGGED rows: red left border + very light red background tint
- Hover state: slight elevation
- Click anywhere on row navigates to detail

### Checklist
- [ ] Stats row shows correct live counts
- [ ] Flagged count pulses red when > 0
- [ ] Compliance donut renders with correct data
- [ ] Activity bar chart shows 14-day history
- [ ] Field status cards show re-entry status correctly
- [ ] Map renders with colored markers
- [ ] Clicking a marker opens popup with link to detail
- [ ] FLAGGED rows visually distinct in table
- [ ] All data updates without page refresh

---

## Module 5.3 — Application Detail Redesign

### Layout

```
[Back arrow] Application FL-[8 chars]           [COMPLIANT / FLAGGED badge]

[If FLAGGED: full-width red alert box with flag reasons]

[Two-column grid]
  Left:                              Right:
  Application Details card           Weather at Application card
  Product Information card           Product Label Requirements card

[Full-width] Export PDF button
```

### Weather card — visual indicators

For each weather reading, show a colored indicator:
- Wind speed: green if under max, red if over
- Temperature: green if in range, red if out of range

```typescript
// Visual: reading vs limit side by side
// "14.2 mph" in red  |  "Limit: 10 mph"
// "76.8 F" in green  |  "Range: 50-85 F"
```

### Re-entry countdown

If re-entry interval hasn't cleared yet:
```
RE-ENTRY RESTRICTION ACTIVE
Field cannot be entered until May 19, 2026 at 5:30 PM
(4 hours after application)
```

If cleared:
```
Re-entry interval cleared May 19 at 5:30 PM
```

### Checklist
- [ ] Two-column layout on desktop, stacked on mobile
- [ ] Flagged alert box prominent at top
- [ ] Weather readings show red/green indicators
- [ ] Re-entry status calculated and displayed
- [ ] Export PDF button downloads correctly

---

## Module 5.4 — Contractor Experience Redesign

### Contractor Dashboard: src/app/contractor/page.tsx

Two-tab layout:
- **Log Application** (default tab) -- the form
- **My History** -- their past logs

### Application Form polish

- Card-based sections: Field & Product, Application Details, Location
- Product selected: show a quick-reference card below the dropdown:
  ```
  Max Rate: 51 oz/acre | Max Wind: 10 mph | Temp: 40-90F | Re-entry: 4 hrs
  [View Full Label] [View Safety Data]
  ```
- GPS button: styled prominently, shows green checkmark when captured
- Submit button: full-width, brand green, disabled during loading
- Result card: full-screen overlay on mobile

### History Tab polish

Card list. Each card:
- Field name + product name (bold)
- Date/time (formatted: "May 17, 2026 at 1:30 PM")
- Compliance badge
- If FLAGGED: expand to show flag reasons
- Weather summary: wind icon + speed, temp icon + degrees

### Checklist
- [ ] Two-tab layout works on mobile
- [ ] Product quick-reference card shows when product selected
- [ ] GPS button shows confirmation state
- [ ] History cards show compliance badges
- [ ] FLAGGED cards expandable to show reasons

---

## Module 5.5 — Product Knowledge Base

### New route: /contractor/products

Contractor-facing product library. Lists all 5 products.

### Product List: src/app/contractor/products/page.tsx

Grid of product cards. Each card shows:
- Product name (bold)
- EPA reg number
- Active ingredient
- Restricted Use badge (red if true)
- Key limits at a glance: wind, temp range, re-entry
- "View Details" button

### Product Detail: src/app/contractor/products/[id]/page.tsx

Full product page:

```
ROUNDUP POWERMAX 3
EPA Registration: 524-549
Active Ingredient: Glyphosate
Use Classification: Non-restricted
Signal Word: CAUTION

APPLICATION REQUIREMENTS
Max Application Rate:    51 oz/acre
Application Method:      Ground or aerial
Target Pests:            Broadleaf weeds, grasses

WEATHER REQUIREMENTS
Maximum Wind Speed:      10 mph
Temperature Range:       40F to 90F
[Visual wind gauge showing 0-20 mph with green/red zones]
[Visual temp gauge showing range]

SAFETY INTERVALS
Re-entry Interval:       4 hours after application
Pre-harvest Interval:    14 days before harvest

DOCUMENTATION
[Button: View EPA Label]  -> opens epa_label_url in new tab
[Button: View Safety Data Sheet] -> opens sds_url in new tab

RECENT USE ON THIS OPERATION
Last applied: May 17 on North Field by Maria Santos
Status: FLAGGED (wind violation)
```

### Add Products tab to contractor nav

```
Contractor nav: [Log Application] [My History] [Products]
```

### Checklist
- [ ] /contractor/products lists all 5 products
- [ ] Each product card shows key limits
- [ ] Product detail page shows all fields
- [ ] EPA Label and SDS buttons open correct URLs
- [ ] Recent use on operation shows last application
- [ ] Products tab in contractor nav

---

## Module 5.6 — Re-entry and Pre-harvest Timetable

### New route: /manager/timetable

Manager-facing field restriction calendar.

### Timetable page: src/app/manager/timetable/page.tsx

Two sections:

**Active Restrictions (top)**
Cards for any field currently under re-entry or pre-harvest restriction:

```
[RED] SOUTH CREEK FIELD — RE-ENTRY RESTRICTED
Engenia applied May 16 by Tyler Reed
Re-entry clears: May 18 at 2:00 PM
Pre-harvest clears: June 2

[GREEN] NORTH FIELD — CLEARED
All intervals cleared as of May 17 at 5:00 PM
Safe to harvest after May 31
```

**Upcoming Safe Windows (below)**
Timeline showing each field's next available application window.

Use Recharts `Timeline` or a custom horizontal bar showing:
- Each field as a row
- Red blocks = restricted period
- Green blocks = safe period
- Today marker as vertical line

### Add Timetable to manager nav

```
Manager nav: [Dashboard] [Applications] [Contractors] [Timetable]
```

### Checklist
- [ ] Active restrictions show correctly
- [ ] Cleared fields show correctly
- [ ] Timeline renders for all 3 fields
- [ ] Today marker visible
- [ ] Pre-harvest dates calculated correctly

---

## Module 5.7 — Global UI Polish

### Design system application

Apply brand tokens consistently across all screens:

```typescript
// Every page header: navy background, white text
// Every section card: white background, border #e8e7e5, shadow-sm
// Every primary action button: #52896F (forest green)
// Every destructive/flagged element: #DC2626 (red)
// Every success/compliant element: #16A34A (green)
// Page background: #F5F4F2 (warm off-white)
```

### Global nav (manager side)

Persistent left sidebar on desktop, bottom nav on mobile:

```
[FieldLog logo]

NAVIGATION
- Dashboard
- Applications
- Contractors
- Timetable

[User info at bottom]
[Sign out]
```

### Global nav (contractor side)

Top tab bar on mobile:

```
[Log Application] [History] [Products]
```

### Typography

- Page titles: Poppins 700, navy
- Section headers: Inter 600, navy
- Body: Inter 400, #1a1a2e
- Labels/captions: Inter 500, #4a4a68

### Loading states

Every data-fetching screen needs a skeleton loader, not a spinner:
- Dashboard: skeleton stat cards + skeleton table rows
- Application list: skeleton cards
- Product list: skeleton cards

### Empty states

Every list needs a designed empty state:
- No applications: illustration placeholder + "No applications logged yet. Contractors will appear here once they start logging."
- No flagged apps: green checkmark + "All applications are compliant."
- No contractors: + "Add your first contractor to get started."

### Error states

Every API error needs an inline message, not a crashed page:
- "Unable to load applications. Try refreshing."
- Retry button where appropriate

### Checklist
- [ ] Left sidebar nav on manager desktop
- [ ] Bottom/top tab nav on mobile
- [ ] Consistent brand colors on all screens
- [ ] Typography consistent across all screens
- [ ] Skeleton loaders on all data-fetching screens
- [ ] Empty states designed and working
- [ ] Error states designed and working
- [ ] Favicon set
- [ ] Page titles set on every route via metadata API

---

## Module 5.8 — Landing Page (Next.js)

Convert public/index.html to src/app/page.tsx as a proper React/Tailwind page.

Keep all sections from the HTML version. Update CTAs:
- "Get Started" button links to /login
- "Sign Up for Early Access" scrolls to CTA form

Add one new section between Features and How It Works:

**"See It In Action" section:**
Static screenshot or mockup of the manager dashboard showing:
- The red FLAGGED application row
- The compliance donut chart
- The field status card with red restriction

This is a 2-second visual that tells the whole story.

### Checklist
- [ ] Landing page at / matches HTML design
- [ ] All nav links work
- [ ] CTA form shows success state inline (no alert)
- [ ] Mobile responsive
- [ ] "See It In Action" section present

---

## Module 5.9 — Vercel Deploy

1. Verify final build: `pnpm run build` -- must pass 0 errors
2. Push all code to GitHub
3. Connect to Vercel, add all env vars:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENWEATHERMAP_API_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
4. Deploy and verify:
   - Landing page loads
   - Manager login: jake@caspianag.com / FieldlogDemo2026!
   - Dashboard shows charts, map, field cards
   - Flagged applications show in red
   - Contractor login: maria@caspianag.com / FieldlogDemo2026!
   - Product knowledge base accessible
   - PDF export works

### Checklist
- [ ] pnpm run build 0 errors
- [ ] Deployed to Vercel
- [ ] All env vars set in Vercel
- [ ] .env.local not in git history
- [ ] All demo flows verified on production URL
- [ ] Handoff written
- [ ] Committed: "feat: Phase 5 complete - Polish and Deploy"
- [ ] Tagged: git tag phase-05-complete

---

## Phase 5 Acceptance Criteria

- [ ] Manager dashboard has stats, donut chart, activity chart, field status cards, and map
- [ ] Flagged applications visually unmistakable (red border, red badge, red alert)
- [ ] Application detail has weather indicators, re-entry status
- [ ] Contractor form has product quick-reference panel
- [ ] Product knowledge base at /contractor/products with detail pages
- [ ] Timetable at /manager/timetable with active restrictions
- [ ] Global nav consistent on all screens
- [ ] Skeleton loaders, empty states, error states all designed
- [ ] Landing page live at /
- [ ] App deployed to Vercel and fully functional
- [ ] Demo credentials work on production URL:
    - Manager: jake@caspianag.com / FieldlogDemo2026!
    - Contractor: maria@caspianag.com / FieldlogDemo2026!
    - Contractor: tyler@caspianag.com / FieldlogDemo2026!
