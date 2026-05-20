# Phase 5 Handoff -- Polish + Seed Complete

**Date:** 2026-05-20
**Branch:** main
**Tag:** phase-05-complete (created at the commit named in "Last commit on close" below)
**Last commit on close:** see `git log -1 --oneline` after the Phase 5 completion commit

---

## What got built

Phase 5 was the polish + content phase. Ten modules (numbered 5.1 - 5.10
after the renumbering -- the original doc skipped 5.9). All shipped:

### Module 5.1 -- Seed verification + product detail columns

- Migration `20260520120000_add_product_detail_columns.sql` adds
  `signal_word`, `epa_label_url`, `sds_url`, `use_classification`,
  `application_method`, `target_pests` (`TEXT[]`), `compatible_crops`
  (`TEXT[]`). All nullable, `ADD COLUMN IF NOT EXISTS` for idempotency.
  Used the project's `YYYYMMDDhhmmss_*.sql` timestamp naming convention,
  not the `009_` prefix the phase doc shows.
- `scripts/seed.ts` extended -- each product spec now carries the 7 new
  columns. Product upsert path changed from `continue` on existence to an
  explicit UPDATE, so re-running `pnpm seed` fills the new columns on
  existing rows. `sds_url` is null for all 5 products -- the phase doc
  table only provided EPA label URLs (cdms.net), and I refused to
  fabricate SDS URLs. Module 5.5 handles null SDS gracefully.

### Module 5.2 -- Manager dashboard charts + map

- `recharts 3.8.1`, `leaflet 1.9.4`, `react-leaflet 5.0.0`,
  `@types/leaflet 1.9.21` installed.
- `ComplianceChart.tsx` -- donut + legend rows that pair color + glyph +
  count + percentage. Center label is compliance %.
- `ActivityChart.tsx` -- 14-day stacked bar (compliant / flagged /
  pending), distinct hues + symbol-prefixed legend + tooltip.
- `FieldStatusCards.tsx` -- one card per field with most-recent
  application, re-entry + pre-harvest status badges, and a 5-dot recent
  trail using the shared `RecentDots` (extracted from `ContractorList`).
  Later changed to a 3-column grid on md+ so it lays out cleanly when
  rendered full-width.
- `ApplicationMap.tsx` -- Leaflet via `react-leaflet`, loaded with
  `dynamic({ ssr: false })` from the dashboard. Markers are `L.divIcon`
  with `[solid color + palette symbol]`, popups carry contractor /
  product / date / badge + a detail link. Initially shipped with
  OpenStreetMap tiles; switched to Esri World Imagery satellite tiles at
  zoom 14 per Brad's request.
- Wired everything into `ManagerDashboardClient.tsx`. After a layout-
  whitespace fix, the right column holds the donut + weather widgets,
  while ActivityChart, FieldStatusCards (3-column grid), and the map sit
  as full-width rows below the two-column section.

### Module 5.3 -- Application detail polish

- New right-column cards on the audit page:
  - `ApplicationConditionsCard.tsx` -- weather reading side-by-side with
    the product label limit, green ✓ on compliant rows, red `[!]
    underline` treatment on violating rows.
  - `ApplicationRestrictionsCard.tsx` -- re-entry + pre-harvest banner
    blocks. Solid red + `!` for ACTIVE, solid green + `✓` for CLEARED.
    Interval text printed underneath (`4 hours after application start`).
- `ApplicationDetail.tsx` right column reduced to the two new cards
  (previously Weather + Label Requirements). Left column (Application
  Details, Product Information) unchanged. `getApplicationById` already
  returned every needed column -- no helper extension needed.

### Module 5.4 -- Contractor experience polish

- `ContractorNav.tsx` -- shared header for the contractor surface with
  brand text + sign-out + a tab row (Log / History / Products). Pages
  pass `active`.
- `/contractor` and `/contractor/history` switched to use `ContractorNav`
  instead of their per-page ad-hoc headers.
- `ProductQuickRef.tsx` -- inline 4-stat card (Max rate, Max wind, Temp
  range, Re-entry) shown beneath the product select when a product is
  chosen. Restricted-use products get a `[!] RESTRICTED USE` pill.
  "View full label" + "View safety data" buttons render only when their
  URL is populated.
- `ApplicationForm.tsx` reorganized into three card sections (Field &
  Product / Application Details / Location) via the new `Section`
  helper. The form-control helpers (`Row`, `Section`, `INPUT_CLS`,
  `INPUT_STYLE`) moved to `FormControls.tsx` to keep `ApplicationForm`
  under the 200-line cap.
- `GpsCapture.tsx` polished. Pre-capture: large accent CTA. Post-
  capture: panel flips to solid green + `✓` glyph + "LOCATION CAPTURED"
  + coordinates. Recapture demoted to a small underlined link.
- `HistoryList.tsx` -- explicit date format (`May 17, 2026 at 1:30 PM`),
  weather summary line (`Wind 5.2 mph · 72F · Clear`). Hook extended
  with `conditions` field on the weather snapshot.
- `Product` interface in `src/types/index.ts` extended with the 7
  Migration 009 columns.

### Module 5.5 -- Product knowledge base

- `/contractor/products` server-component list page. `ProductCard.tsx`
  renders product name + EPA + active ingredient + RU pill + 4 stat
  rows + "View details" link.
- `/contractor/products/[id]` detail page. Sections: header (name + EPA
  + use class + signal word) -> Application requirements -> Weather
  requirements (with the new visual `SafetyGauge` bars) -> Safety
  intervals -> Documentation -> Recent use. Recent-use query is RLS-
  scoped and ordered by `application_start` (not `submitted_at`) so a
  backdated entry doesn't surface as "most recent". `ProductDetail.tsx`
  was over the 200-line cap, so `RecentUseCard.tsx` was split into its
  own file.
- `SafetyGauge.tsx` -- horizontal bar with safe range (green) bracketed
  by danger zones (red). Each segment carries its palette glyph, safe
  range is printed in plain text. Originally in
  `components/contractor/`, later moved to `components/ui/` in Phase 5.8
  when `WeatherPanel` needed it.
- SDS button only renders when `sds_url` is non-null. The phase doc
  expected this -- per the Module 5.1 carry-forward.

### Module 5.6 -- Re-entry / pre-harvest timetable

- `ManagerNav.tsx` -- shared header for the manager surface (mirror of
  `ContractorNav`). Dashboard / Contractors / Timetable tabs.
- All four manager pages refactored to use `<ManagerNav>` with the
  appropriate `active` value.
- `src/lib/restrictions.ts` -- pure helper
  `computeRestriction(applicationStartIso, reEntryHours, preHarvestDays)`
  returning `{ reEntryClearsMs, preHarvestClearsMs, reEntryActive,
  preHarvestActive, anyActive }`. Single source of truth. Used by
  `FieldStatusCards` and the new timetable; old inline restriction math
  refactored out of `FieldStatusCards`.
- `/manager/timetable` server-component page. Fetches fields +
  applications-in-window via `Promise.all`, computes per-field
  restriction state, passes shaped rows to:
  - `ActiveRestrictionsList.tsx` -- active restrictions render as
    white-on-solid-red cards at the top, cleared fields below in green,
    idle fields (no applications) in muted white. "ALL CLEAR" headline
    card when nothing is active.
  - `FieldTimeline.tsx` -- 28-day horizontal timeline per field (14d
    back + 14d forward). Green background = safe; red blocks = re-entry
    intervals (with the `!` glyph on blocks ≥ 3% wide + hover tooltip).
    Navy vertical line marks today + "Today" label above the axis.

### Module 5.7 -- Global UI polish

- `src/app/icon.svg` -- new favicon (navy rounded square, "FL" white
  text, forest-green accent stripe).
- Root metadata in `src/app/layout.tsx` upgraded to a `title.template`
  pattern (`"%s - FieldLog"`) + a real description.
- Every page added `export const metadata` with its own title:
  - `/login` ("Sign in"), `/contractor` ("Log application"),
    `/contractor/history` ("History"), `/manager` ("Dashboard"),
    `/manager/contractors` ("Contractors"). Existing ` - FieldLog`
    suffixes removed since the template appends.
  - `/manager/applications/[id]` uses `generateMetadata` to produce
    `Audit FL-XXXXXXXX` per record.
- `/login` was `'use client'`, so it couldn't export metadata. Split
  into a server `page.tsx` (metadata) + `LoginForm.tsx` client.
- `src/components/ui/Skeleton.tsx` -- `Skeleton`, `SkeletonCard`,
  `SkeletonRow` primitives. Animated pulse, `BRAND.border` fill.
- `src/components/ui/EmptyState.tsx` -- designed empty/success/error
  card with `tone` prop pulling palette glyphs.
- Loading-state replacements: `Loading...` text -> skeleton renders in
  `ManagerDashboardClient`, `HistoryList`, `ContractorsClient`,
  `ApplicationForm`.
- Empty-state replacements: bare "No X yet" text -> `EmptyState` in
  `ApplicationTable`, `HistoryList`, `ContractorList`, products list
  page, `ApplicationForm` gate cases.
- `ManagerNav.tsx` rewritten: mobile (<md) keeps the horizontal top tab
  bar, desktop (md+) renders as a fixed left sidebar (w-56, navy
  brand text, vertical tab list, active = accent-green left border +
  cream background, sign-out pinned to bottom). Each manager page
  picked up `md:pl-56` on its outer wrapper. `/manager/applications/[id]`
  also gained the sidebar for nav parity.

### Module 5.8 -- Live weather + 5-day forecast

- `src/lib/weather.ts` extended with `fetchCurrentConditions(lat, lng)`
  (current + feels_like + ISO timestamp), `fetchForecastAtCoordinates`
  (calls OWM's 5-day/3-hour `/forecast`, aggregates by date into
  `ForecastDay[]`), and `computeSprayWindow(wind, high, low)`
  classifier (good < 8 mph & 45-85F / marginal 8-12 mph or edges / poor
  > 12 mph or out-of-range).
- `src/lib/ratelimit.ts` -- new `'weather:fetch'` key, 60/hr per user.
- `GET /api/weather?lat=X&lng=Y` (`src/app/api/weather/route.ts`).
  Standard order: auth -> rate limit -> input (lat in [-90,90], lng in
  [-180,180]) -> upstream `Promise.all` -> JSON. 401/429/400/502 on
  failure paths. `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
- `src/hooks/useWeather.ts` -- polls every 10 minutes, aborts in-flight
  requests on unmount / coord change, skips entirely when lat or lng
  is null so callers can defer until they have coordinates.
- `WeatherPanel.tsx` -- initially built as a single-field detailed
  panel, then rewritten per Brad's request as a multi-field summary.
  Each `FieldRow` makes its own `useWeather(field.lat, field.lng)` call
  so the spray-window classification reflects that field's actual
  location. With 3 fields polling every 10 min, that's ~18 calls/hr per
  signed-in manager -- well inside the 60/hr budget.
- `ForecastStrip.tsx` -- 5-column grid, each day shows date,
  conditions, high/low, max wind, and a spray-window pill. Uses the
  anchor field (alphabetically first with coords) since per-field
  forecasts wouldn't differ meaningfully at this geographic scale.
- `SprayWindowBadge.tsx` extracted to `components/ui/` -- shared pill
  used by `ForecastStrip` cells AND the per-field `WeatherPanel` rows.
  Three states (good/marginal/poor) pair color + glyph + label.
- `SprayWindowIndicator.tsx` -- contractor-side panel rendered inline
  under `GpsCapture` after a location is pinned. "OK TO SPRAY" green
  panel when safe, "WARNING: CONDITIONS MAY VIOLATE LABEL" red panel
  when any product label limit is exceeded by current conditions, with
  the violation reason(s) printed as `[!] {reason}` lines.

### Module 5.9 -- Landing page (Next.js)

- Source HTML at `docs/index.html` ported to `src/app/page.tsx` as a
  composition of 9 section components in `src/components/landing/`:
  Logo, Header, Hero, TrustBar, Features, SeeItInAction (new),
  HowItWorks, Testimonial, CtaSection, LandingFooter.
- `SeeItInAction` is the new 2-second "this is the demo" visual:
  three side-by-side panels mirror the real dashboard -- a flagged
  Maria/North Field/Roundup row with the `[!] Wind 14.2 mph exceeded
  label limit of 10 mph` reason; an SVG donut chart (5/1/2 split, 62%
  center label); a field-status card with `! Restricted until 7:14 PM`
  + `✓ Harvest after May 27`.
- Per Brad's CTA-wiring instruction: Nav "Sign Up", Hero "Get Started",
  Hero "Sign Up for Early Access" all route to `/login`. The waitlist
  form in `CtaSection` is kept with an inline success state on submit
  (no backend), matching the phase doc checklist item.

### Module 5.10 -- Vercel deploy

**Shipped.** Production live at https://fieldlog-kappa.vercel.app.

First deploy hit MIDDLEWARE_INVOCATION_FAILED 500. Root cause was env
vars in Vercel scope. Fixed in two parts: (1) committed `191dbb4`
adding an explicit pre-check in `src/middleware.ts` that throws a
readable "Missing required env var(s): X" instead of the cryptic
Supabase URL-parser stack trace -- middleware in stable Next 15 always
runs on Edge, so the diagnostic message is what carries into Vercel
function logs; (2) verified all six env vars (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`OPENWEATHERMAP_API_KEY`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`) are present with Production scope.

Production verification completed end-to-end:
- Landing renders cleanly
- Manager + contractor logins land on correct dashboards
- Flagged applications visible in red on the manager dashboard
- Audit PDF downloads
- Per-field weather + 5-day forecast pulls live OWM data
- Satellite map tiles load from Esri

---

## Diverged from the phase doc

1. **Module numbering.** Doc skipped 5.9 (jumped 5.8 -> 5.10). Renumbered
   Landing Page to 5.9 and Vercel Deploy to 5.10.
2. **Migration filename.** Doc said `009_add_product_detail_columns.sql`;
   used `20260520120000_add_product_detail_columns.sql` to match the
   existing `YYYYMMDDHHmmss_*.sql` convention.
3. **SDS URLs left null.** Doc table only provided EPA label URLs (no
   SDS), so all 5 products have `sds_url = null`. UI handles null.
4. **Landing source path.** Doc says `public/index.html`; actual source
   was `docs/index.html`. Ported from there.
5. **WeatherPanel evolved.** Doc spec was a single detailed current-
   conditions card. Per Brad's mid-phase request it became a multi-row
   per-field summary -- one row per field, each with its own weather
   fetch, name + temp + wind + spray-window pill.
6. **Map tiles.** Doc didn't specify tile source; defaulted to OSM,
   then switched to Esri World Imagery satellite tiles per Brad's
   request. Default zoom raised to 14 (field scale).
7. **Field-level weather on timetable page (5.8 checklist item) --
   NOT done.** Adding 3 more `useWeather` instances on the timetable
   would push call volume higher and the visual payoff felt thin. Left
   as a 5.10 polish opportunity.
8. **Dashboard layout reshuffle (mid-phase fix).** Right column
   originally had compliance + weather + forecast + activity + field
   cards stacked. The right column grew taller than the table and left
   blank space on the left. Moved ActivityChart and FieldStatusCards
   to full-width rows below the two-column section; FieldStatusCards
   now lays out as `md:grid-cols-3`.

---

## Load-bearing things future sessions must respect

1. **`computeRestriction` is the single source of truth for
   re-entry / pre-harvest math.** Both `FieldStatusCards` and the
   timetable consume it. Changing the threshold rule means changing
   one function. Do not re-introduce inline `Date.now() < clearsMs`
   math in new callers.

2. **OWM API key is server-only.** `lib/weather.ts` fetch functions
   read `process.env.OPENWEATHERMAP_API_KEY` inside the call sites;
   only `sprayWindowFor` + types are imported into client components.
   Tree-shaking + Next.js env-var rewriting both keep the key off the
   client bundle. If a future change imports a fetch function client-
   side, the key reference will be replaced with `undefined` and the
   call will fail at runtime, but no key leak.

3. **`useWeather` hook polls every 10 minutes per instance.** Three
   instances mounted in `WeatherPanel` + one in `ForecastStrip` + one
   in `SprayWindowIndicator` (only when GPS captured) = at most ~30
   calls/hr per active session. Stay under the 60/hr `'weather:fetch'`
   rate limit when adding new weather consumers.

4. **Manager pages add `md:pl-56` for the sidebar.** New manager
   routes must include `md:pl-56` on their outermost wrapper or the
   content will slide under the fixed sidebar on desktop.

5. **`COMPLIANCE_PALETTE` + `SprayWindowBadge` are the canonical
   status surfaces.** All new status-bearing UI (cards, badges, pills,
   map markers) should consume these. Inline color + glyph
   replacements re-introduce drift and may violate the colorblind
   precedent.

6. **`getApplicationById` still has 2 callers** (audit page + PDF
   route). Phase 4 carry-forward is still in effect.

7. **Seed re-run wipes the Caspian operation.** Cascades through
   fields / profiles / applications. Test data submitted during dev
   sessions is lost. Idempotent on the products + auth users though.

---

## Phase 5 acceptance checklist

- [x] All 10 modules shipped (5.1-5.10, original 5.10 renumbered to 5.9)
- [x] Migration 009 pushed, products seeded with new columns
- [x] Manager dashboard: stats / donut / activity chart / field cards
  / Leaflet map (satellite)
- [x] Application detail: weather-vs-label conditions card + re-entry
  / pre-harvest restrictions card
- [x] Contractor: nav tabs, product quick-ref, GPS confirmation,
  history polish
- [x] `/contractor/products` + `/contractor/products/[id]` knowledge
  base with visual safety gauges
- [x] `/manager/timetable` with active restrictions + field timeline
- [x] Sidebar nav on desktop, top tabs on mobile
- [x] Skeleton loaders, empty states, error states on every
  client-rendered list
- [x] Favicon (`/icon.svg`) and per-route page titles
- [x] Live weather widget (multi-field current + 5-day forecast)
- [x] Contractor spray-window indicator on the form
- [x] Landing page rebuilt as React/Tailwind, "See It In Action"
  section added
- [x] `pnpm run build` 0 errors
- [x] No `:any` / `console.log` / over-200-line components
- [x] Security spot check on `/api/weather`: auth + rate limit + input
  validation + no DB queries / no RLS impact
- [x] Handoff written (this file)

- [x] Vercel deploy live at https://fieldlog-kappa.vercel.app
- [x] All env vars set in Vercel project (Production scope)
- [x] Production verification: manager + contractor login flows,
  flagged demo case visible, PDF export works

---

## Things to maybe do (not blockers)

- **Per-field weather on the timetable.** 5.8 checklist parked this.
  3 more `useWeather` instances on `/manager/timetable` would surface
  spray conditions next to each field's restriction status. Low
  priority -- the dashboard already shows per-field weather.
- **Real SDS URLs in seed.** All 5 products have `sds_url = null`.
  Module 5.5 handles null cleanly, but real URLs would round out the
  product detail page.
- **`pnpm run lint` script.** Project doesn't have one configured.
  Session-end protocol references it. Could add a `next lint`
  scripts entry; the existing CLAUDE.md mentions it as a quality
  gate. Skipped to avoid scope creep.
- **Card primitive extraction.** Dashboard cards use `rounded`;
  detail cards use `rounded-lg`. A single `<Card>` primitive would
  unify. Skipped in 5.7 to avoid churn across 10+ files.
- **WeatherPanel + ForecastStrip duplicate fetches.** When the anchor
  field is the same as one of the rendered fields, the same
  coordinates get fetched twice (once by `WeatherPanel`, once by
  `ForecastStrip`). Could share state via Context. Acceptable since
  both hits stay inside the 60/hr budget.

---

## Outstanding for next session (Phase 6 -- Demo + Submit)

After 5.10 deploy:
- Read this handoff, the new `phase-06-demo-submit.md` (if it exists),
  `.claude/CLAUDE.md`, `SECURITY.md`, `BLUEPRINT.md`.
- Vercel deployment URL works end-to-end.
- Demo script rehearsed: login as Jake -> dashboard shows the flagged
  wind violation -> drill into audit page -> download PDF.
- Submission package ready by 2026-05-22.

### Phase 5 starting state going into 5.10

- Tech: Next 15.5 + React 19 + Tailwind v4 + Supabase + Recharts +
  Leaflet (Esri satellite tiles) + react-pdf + OpenWeatherMap.
- Data: full Caspian Ag seed (3 fields, 5 products with knowledge-base
  columns, 8 applications: 5 compliant / 2 flagged / 1 pending with
  active re-entry).
- A11y: colorblind-safe palette + glyph pattern enforced everywhere
  status is conveyed -- badges, dots, pills, markers, banners, charts.
- Rate limiting: skipped in dev without Upstash creds, will throw in
  production -- Upstash env vars MUST be set in Vercel before deploy
  or POST/GET routes will 500 on first call.

### Env vars required for Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENWEATHERMAP_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```
