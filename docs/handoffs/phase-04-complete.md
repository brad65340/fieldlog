# Phase 4 Handoff -- Audit Export Complete

**Date:** 2026-05-19
**Branch:** main
**Tag:** phase-04-complete (created at the commit named in "Last commit" below)
**Last commit on close:** see `git log -1 --oneline` after Phase 4 completion commit

---

## What got built

### Module 4.1 -- PDF generation library + export route

- `src/lib/pdf/styles.ts` (113 lines) -- react-pdf StyleSheet. Helvetica
  and Helvetica-Bold only (built-in fonts, no `Font.register`). Colors
  pulled from BRAND + COMPLIANCE_PALETTE so the PDF stays in lockstep
  with the in-app pages. The flag box and violation rows use the
  colorblind-safe variant of the palette (solid bg + white text, `[!]`
  glyph + underline -- see a11y note below).
- `src/lib/pdf/AuditPDF.tsx` (115 lines, under the 200-line component
  cap) -- the react-pdf Document. Per phase doc spec: A4, 40pt margins,
  page header with FieldLog title + subtitle + Generated timestamp,
  record ID bar (FL-{8 chars uppercase} + submitted timestamp + status
  badge using COMPLIANCE_PALETTE.solid), optional `[!] COMPLIANCE FLAGS
  DETECTED` box at the top for flagged applications (white on solid red,
  each item prefixed with `[!]`), then four data sections: Application
  Details, Product Information, Weather Conditions, Product Label
  Requirements. Violating weather and rate values render with four
  independent signals (color + bold + underline + `[!] ` glyph prefix).
  Fixed footer with the immutability statement + generated timestamp
  appears on every page.

### Module 4.2 -- Export button wiring

- `src/app/api/export/[id]/route.tsx` (75 lines, under the 150-line
  route cap) -- standard order: auth -> manager role -> rate limit
  (`export:pdf` 30/hr already wired in Phase 2) -> `getApplicationById(id,
  callerOperationId)` (the shared helper built Phase 3.2) -> 404 if null
  -> `renderToBuffer(<AuditPDF .../>)` -> binary response with
  `Content-Type: application/pdf` + `Content-Disposition: attachment;
  filename="FieldLog-Audit-XXXXXXXX.pdf"`. Forces `runtime = 'nodejs'`
  because @react-pdf/renderer depends on pdfkit (Node-only). Sets
  `dynamic = 'force-dynamic'` because PDFs are freshly generated.
- `src/components/manager/ExportButton.tsx` was already wired in Phase 3.2;
  no changes needed in Phase 4. The button stopped showing its
  "PDF export is not available yet (Phase 4)" placeholder the moment
  the route shipped.

### Unplanned additions: colorblind a11y passes (PDF + in-app)

Mid-Phase-4 testing surfaced the same colorblind issue first identified
in Module 3.3: red text on red/pink backgrounds is unreadable to Brad.
Two fixes:

**Commit `dfb7dc6` -- PDF a11y:**
- Flag box inverted from red-text-on-pink-bg to white text on solid red.
- Title and items prefixed with `[!]` (Latin-only ASCII; Helvetica won't
  render Unicode warning glyphs).
- valueViolation style now includes `textDecoration: 'underline'` and
  the Row helper prepends `[!] ` to violating values -- four independent
  signals on every violation row (color + weight + decoration + glyph).

**Commit `910aea4` -- in-app a11y (cascade):**
- `ComplianceBadge` switched from soft pastel-bg/dark-fg to solid-bg/
  white-text + symbol prefix (`✓ COMPLIANT`, `! FLAGGED`, `· PENDING`).
  Renders cleanly on any row tint, including the FLAGGED row's pink
  background where the old badge boundary disappeared.
- `ApplicationDetail` flag alert: same white-on-solid-red + `[!]` as
  the PDF. Row helper now adds `underline` + `[!] ` prefix on
  violations.
- `ComplianceResult` (contractor's submit panel): solid bg + white text
  in all three states (not just flagged). Buttons inverted to white bg
  with status-colored text so they stay readable on any panel.
- `HistoryList` (contractor flag expansion): items prefixed `[!]`,
  font-medium.
- `ContractorList` Flagged stat: value prefixed `[!] ` when count > 0.

The memory entry `user-colorblind` was extended with these precedents
plus an explicit anti-pattern call-out: never red text on a pink or
red-tinted background. White-on-solid is the canonical form.

---

## Diverged from the phase doc

1. **PDF split into two files** (`AuditPDF.tsx` + `styles.ts`) rather
   than the doc's single `src/lib/pdf.ts`. The styles block was ~95
   lines on its own; splitting kept the component file under the
   200-line cap and follows the same pattern we used in Module 2.3
   (extracting GpsCapture out of ApplicationForm).
2. **`Math.random()` was never used** for tempPassword -- that was
   already replaced with `crypto.randomUUID()` in Phase 3.3 per
   decision D3.
3. **Phase 4 doc's spec text** said red text on light red bg for the
   flag box; the a11y pass switched it to white-on-solid-red. The
   visual character changed mid-phase based on user feedback.

---

## Load-bearing things future sessions must respect

1. **Audit PDF rendering depends on Node runtime.** The route declares
   `export const runtime = 'nodejs'` because @react-pdf/renderer needs
   pdfkit's Node APIs. Do NOT switch to Edge runtime or middleware
   transformation of this route.

2. **PDF and in-app status surfaces share `COMPLIANCE_PALETTE.solid` +
   `.symbol`.** Phase 5 charts, maps, and field cards must use the same
   tokens. A single source of truth keeps a11y + visual consistency
   intact.

3. **`getApplicationById` is now consumed by two callers** (detail page
   + PDF route). Adding a column to the PDF means adding it to the
   helper's select string. Removing a column means checking both
   callers first.

4. **`[!] ` is the canonical violation prefix** across web AND PDF.
   Keep using it for any new status-bearing surface. Memory entry
   `user-colorblind` has the full precedent list.

5. **Service-role client only used inside POST /api/applications (for
   weather_snapshots) and POST /api/contractors (for auth admin).** The
   PDF route does NOT need service-role -- it uses the user-client via
   `createClient()` and `getApplicationById` already runs through RLS.

---

## Phase 4 acceptance checklist

- [x] PDF generates correctly for compliant application (live verified)
- [x] PDF generates correctly for flagged application (wind-flagged
  Maria/North Field/Roundup -- red flag section visible at top with the
  wind violation in plain ASCII bullets; Wind Speed row in weather
  section shows `[!] 14.2 mph` bold + underlined; Max Wind Speed row in
  label requirements shows `[!] 10 mph` same treatment) (live verified)
- [x] PDF generates correctly for temp-flagged application
  (Tyler/South Creek/Engenia -- Temperature row shows `[!] 92F`; Temp
  Range row shows `[!] 50F to 85F`) (live verified)
- [x] All four PDF sections populated with real data (live verified)
- [x] File downloads with correct filename `FieldLog-Audit-<UPPER8>.pdf`
- [x] Auth enforced: manager only (401 for contractor or anon -- live
  verified, no-auth incognito returns 401)
- [x] Wrong-operation application returns 404 (live verified)
- [x] `ExportButton` shows loading state during generation and triggers
  download on success
- [x] Inline error if generation fails
- [x] pnpm run build passes 0 errors
- [x] No `: any`, no `console.log`, no file over its size cap
- [x] Handoff written (this file)
- [x] Committed and tagged `phase-04-complete`

---

## Things to maybe do (not blockers)

- **PDF font polish.** Helvetica is utilitarian (which was the call); a
  Phase 5 polish could explore a registered font if a more designed
  feel becomes desirable. The current font choice is locked in until
  someone consciously revisits it.
- **PDF could include the GPS coordinates on a small map snapshot.**
  Phase 5 introduces leaflet for the dashboard; if there's bandwidth,
  embedding a static map image in the PDF would round out the audit
  document. Out of scope for Phase 4.
- **Re-entry / pre-harvest computed values in the PDF.** Currently
  shows the raw `re_entry_interval_hours` / `pre_harvest_interval_days`
  fields. Could compute the cleared-by datetime from
  `application_start + interval` and show that too. Phase 5 field
  status cards do this for the dashboard; the same logic could feed
  the PDF.
- **`docs/phases/phase-05-polish-seed.md`** still has unstaged edits
  from earlier in the session; commit whenever appropriate.

---

## Outstanding for next session (Phase 5 -- UI Polish, Charts, Maps, Deploy)

- Read `BLUEPRINT.md`, `.claude/CLAUDE.md`, `DECISIONS.md`, `SECURITY.md`,
  `docs/phases/phase-05-polish-seed.md` (large -- the doc grew with
  charts, maps, product knowledge base, timetable, live weather widget),
  this handoff.

Phase 5 modules in the order the phase doc lays them out:

- 5.1 Seed verification + Migration 009 (product detail columns:
  `signal_word`, `epa_label_url`, `sds_url`, `use_classification`,
  `application_method`, `target_pests`, `compatible_crops`). Existing
  seed needs an update pass for the new columns.
- 5.2 Manager dashboard redesign -- fill the placeholder slots already
  framed by `ManagerDashboardClient.tsx`. Stats row already exists; need
  to add: compliance donut (Recharts), activity bar chart (Recharts),
  field status cards (re-entry computed from product intervals), and
  the Leaflet map. Charts and map markers MUST follow the colorblind
  precedents (color + shape, never color alone).
- 5.3 Application detail polish -- the two-column layout is already in
  place. Add re-entry countdown, side-by-side reading-vs-limit displays.
- 5.4 Contractor experience polish -- two-tab layout (Log / History
  / Products), product quick-reference card on form, etc.
- 5.5 Product knowledge base (/contractor/products + /contractor/products/[id]).
- 5.6 Re-entry / pre-harvest timetable (/manager/timetable).
- 5.7 Global UI polish -- consistent nav, skeleton loaders, empty
  states, error states, page metadata.
- 5.8 Live weather + 5-day forecast widget. New API route GET
  /api/weather; new components WeatherPanel + ForecastStrip. Plus a
  spray-window indicator on the contractor form.
- 5.10 Landing page (convert docs/index.html to src/app/page.tsx).
- 5.11 Vercel deploy.

### Phase 5 starting state (clean)

- Tech: Next 15.5 + React 19 + Tailwind v4 + Supabase + Helvetica PDF.
- Data: full Caspian Ag seed in DB (3 fields, 5 products, 8 apps with
  5 compliant / 2 flagged / 1 pending) + any live test apps Brad has
  submitted during testing.
- A11y: colorblind-safe patterns established for status colors, dots,
  badges, alert boxes, violation rows, and PDF. Phase 5 needs to extend
  the same discipline to Recharts (data labels / patterns, not just
  color sectors) and Leaflet (marker shape or letter, not just color).
- Rate limiting: dev-skipped without Upstash creds. Phase 5 may want
  to wire Upstash before/during deploy so production rate limiting
  works. Or Phase 6 can defer.

### Open question parked for Phase 5

- **Migration 009 + seed re-run order.** The new product detail columns
  are NOT NULL-less optional adds, so existing seed rows are fine after
  migration. But Phase 5 wants real values for `signal_word`,
  `epa_label_url`, `sds_url`, etc. Decide whether to:
  - (a) update `scripts/seed.ts` to write the new columns and re-run
    `pnpm seed` (clean -- the seed is idempotent on the Caspian op),
  - (b) write a one-off SQL update script that fills the new columns
    on existing rows, or
  - (c) leave them null for the demo and let UI render "Not specified"
    placeholders.
- I'd recommend (a) for cleanliness, but it's a Phase 5 call.
