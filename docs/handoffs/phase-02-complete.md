# Phase 2 Handoff -- Contractor Flow Complete

**Date:** 2026-05-19
**Branch:** main
**Tag:** phase-02-complete (created at the commit named in "Last commit" below)
**Last commit on close:** see `git log -1 --oneline` after Phase 2 completion commit

---

## What got built

### Module 2.1 -- Weather + Compliance Libraries

- `src/lib/weather.ts` -- OpenWeatherMap Current Weather wrapper, server-only.
  Reads `OPENWEATHERMAP_API_KEY` at call time (so a missing key errors at
  runtime, not at module load). Defensive parse of the response shape.
  `cache: 'no-store'` -- never cached.
- `src/lib/compliance.ts` -- pure 4-rule engine (wind max, temp min/max,
  rate max). Collects ALL flags (no short-circuit). Skips a rule when the
  product threshold is null. Flag strings match `scripts/seed.ts` text
  byte-for-byte; re-running the engine on seeded inputs produces identical
  `compliance_flags`.

### Module 2.2 -- POST /api/applications

- `src/schemas/index.ts` -- `ApplicationSubmitSchema`. `lat`/`lng` are
  optional; the route marks compliance_status='pending' and skips weather
  + compliance when they're absent (offline / no-GPS path).
- `src/lib/ratelimit.ts` -- Upstash wrapper, typed per-route limit table.
  In dev with Upstash env vars missing: skips and logs a warning. In
  production: throws. Rate limiting is a security control; silent fallback
  in prod is a regression.
- `src/app/api/applications/route.ts` -- 147 lines, under the 150 route
  cap. Order: auth -> role -> rate limit -> Zod -> field ownership ->
  product fetch -> weather -> compliance -> insert application (user
  client) -> insert weather_snapshot (service-role client, ADR-002).
  Single `err(status, msg)` factory returns a fresh NextResponse per call
  (cached NextResponse bodies are one-shot streams).

### Module 2.3 -- Contractor Application Form

- `src/hooks/useFields.ts`, `src/hooks/useProducts.ts` -- browser-client
  queries with async/await + try/catch + finally; errors land in setError
  AND console.error (so the original rejection survives even if React
  swallows it during render).
- `src/components/contractor/ApplicationForm.tsx` (197 lines) -- 7 form
  fields + GPS button + submit. State stored as strings to match DOM
  inputs; coerced to numbers/ISO timestamps right before POST. fetch()
  only in the submit handler (not the body) -- phase doc explicitly
  permits one-off POSTs from event handlers.
- `src/components/contractor/GpsCapture.tsx` -- split out to stay under
  the 200-line cap on ApplicationForm.
- `src/components/contractor/ComplianceResult.tsx` -- compliant (green),
  flagged (red, lists flags), pending (gray, "no GPS captured") states.
  Refactored mid-phase to consume COMPLIANCE_PALETTE from constants.
- `src/components/contractor/OfflineBanner.tsx` -- listens to window
  online/offline events. Visual only; localStorage queueing of pending
  submits is a deferred enhancement.
- `src/app/contractor/page.tsx` -- server shell with OfflineBanner +
  header (title + History link + SignOutButton) + ApplicationForm.

### Module 2.4 -- Contractor History

- `src/hooks/useContractorApplications.ts` -- joined select on applications
  with fields(name) + products(name, epa_reg_number) +
  weather_snapshots(wind_speed, temperature). Filters by contractor_id =
  auth.uid(). Orders submitted_at DESC, limit 50. Same async/await +
  try/catch shape as the other hooks.
- `src/components/contractor/HistoryList.tsx` -- list + per-card render.
  Loading / empty / error fallthroughs. Click-to-expand flag reasons on
  FLAGGED cards.
- `src/components/ui/ComplianceBadge.tsx` -- new shared primitive.
  Lives in `components/ui/` rather than `contractor/` because Phase 3
  manager dashboard will reuse it.
- `src/app/contractor/history/page.tsx` -- server shell mirroring
  /contractor's header.

### Unplanned additions

These weren't in the phase doc but landed inside Phase 2 because they
were either blockers or one-line wins:

- **`scripts/seed.ts` + tsx + `pnpm seed` script** -- Phase 5 seed pulled
  forward at the user's request so Phase 2/3 could be exercised against
  real data without throwaway bootstrap rows. See seed commit for the
  full Caspian Ag dataset description.
- **`src/components/SignOutButton.tsx`** + wiring into both contractor
  and manager headers -- needed for any role-switch during testing
  (clearing cookies manually each time was untenable). Lives at
  `src/components/` top-level because it's app-coupled (auth + routes),
  not a generic ui primitive.
- **`COMPLIANCE_PALETTE` in `src/constants/index.ts`** -- single
  source of truth for status colors + labels; consumed by both
  `ComplianceResult` and `ComplianceBadge`.
- **`BRAND.error = '#991B1B'`** added to constants when the same error
  red showed up in two places (Hard Rule 14).
- **Diagnostic hardening pass on hooks + SignOutButton** -- `.then()`
  chains replaced with async/await + try/catch + console.error so a
  failure surfaces a readable error instead of an `[object Event]` in
  Next's dev overlay.

---

## Diverged from the phase doc

1. **`react-pdf` package name was wrong; we use `@react-pdf/renderer`**
   (already in ADR-010). Phase 2 didn't touch PDF, but the BLUEPRINT
   path table still names the package incorrectly. Phase 4 will use the
   correct one.
2. **`OfflineBanner`'s localStorage queueing was deferred.** Phase doc
   describes "store pending submissions in localStorage, retry on
   reconnect via window 'online' event". I shipped the visual banner only.
   Real offline-submit would need a service worker or careful retry
   handler; out of scope for Phase 2 minimum.
3. **`ComplianceBadge` lives in `src/components/ui/`** rather than
   `src/components/manager/` as the BLUEPRINT path table suggested. The
   badge is shared between contractor history and the upcoming manager
   dashboard; the `manager/` listing in BLUEPRINT was implicitly "what
   Phase 3 will need," not "owned by manager."
4. **Login page diagnostic UI from a32eeae is verbose for production.**
   "Profile lookup failed: <PostgREST message> [PGRST116]" was useful
   during the RLS recursion debug. Should be replaced with a generic
   message + structured server-side logging before Phase 6 deploy.

---

## Load-bearing things future sessions must respect

1. **`COMPLIANCE_PALETTE` is the single source of truth for status
   colors + labels.** Phase 3 manager dashboard MUST consume it (don't
   re-introduce a parallel palette in `components/manager/`). If you
   need to add a new compliance state, add it to `COMPLIANCE_STATUS`
   AND `COMPLIANCE_PALETTE` together -- they're a paired API.

2. **The Phase 2 API contract is locked.** Any change to the response
   shape of `POST /api/applications` will break the contractor form's
   submit handler. The contract is documented in
   `docs/phases/phase-02-contractor-flow.md` at the bottom; Phase 3
   doesn't touch this route.

3. **Service-role insert is mandatory for `weather_snapshots`.** The
   POST route uses `createServiceClient()` for that single insert
   because RLS has no user-facing INSERT policy (ADR-002). Any future
   route or seed that inserts into `weather_snapshots` must use the
   service-role client -- the anon client will be silently rejected.

4. **Rate limiting is dev-skipped when Upstash env vars are absent.**
   `src/lib/ratelimit.ts` returns `true` (allowed) in dev with no
   Upstash configured, so the route is wide open locally. In production
   the same function throws. Wire `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` before deploying to Vercel.

5. **Caspian Ag seed already ran.** The DB has 1 op (Caspian) + 3
   profiles + 3 fields + 5 products + 8 applications (5 compliant, 1
   wind-flagged, 1 temp-flagged, 1 pending) + 8 weather snapshots. AND
   it also has the Phase 1 Test Operation with 2 profiles + 0 fields.
   `pnpm seed` is idempotent on the Caspian operation but does NOT
   touch Test Operation.

6. **The `[object Event]` shape from the user's runtime error on
   2026-05-19 is now defended against by try/catch in
   `useFields`/`useProducts`/`SignOutButton`.** The actual root cause
   was never definitively identified -- the defensive fixes made it
   stop reproducing. If it returns, look at @supabase/ssr's
   BroadcastChannel cross-tab auth sync.

---

## Phase 2 acceptance checklist

- [x] POST /api/applications submits successfully with real weather data
  (verified live 2026-05-19, real OWM call)
- [x] Compliant submission shows green ComplianceResult (verified live)
- [x] Flagged submission (wind violation) shows red ComplianceResult with
  reason (verified live -- a real wind > 10 mph reading at submit time)
- [x] Pending submission (no GPS captured) shows gray ComplianceResult
  (verified live)
- [x] Contractor history shows correct records (verified -- Maria sees
  her own seeded + live-test applications; flag-expand works)
- [x] Compliance check engine handles wind/temp/rate violations and
  collects all flags
- [x] No secrets in client-side code (only `NEXT_PUBLIC_` env vars on
  client; OWM key + service-role key are server-only)
- [x] pnpm run build passes 0 errors
- [x] No `: any` or `as any`; no `console.log`; no component over 200
  lines
- [x] Handoff written (this file)
- [x] Committed and tagged `phase-02-complete`

---

## Things to maybe do (not blockers)

- **Login diagnostic UI.** "Profile lookup failed: <msg> [code]" reveals
  internal failure modes; tighten to generic + log server-side.
- **OfflineBanner localStorage queueing.** Currently visual only.
- **Tighten the verbose error display in `useFields`/`useProducts`.**
  Currently surfaces raw Postgres error messages; could be friendlier.
- **Tailwind v4 brand tokens.** Still inline-styled via the BRAND const.
  Phase 5 polish can move these into `globals.css @theme`.
- **`scripts/bootstrap-phase-1.sql`** is now strictly redundant given the
  full seed exists -- can be deleted in cleanup.
- **`docs/phases/phase-05-polish-seed.md`** has unstaged edits from the
  current session; commit those separately whenever appropriate.

---

## Outstanding for next session (Phase 3 -- Manager Dashboard)

- Read `BLUEPRINT.md`, `.claude/CLAUDE.md`, `DECISIONS.md`, `SECURITY.md`,
  `docs/phases/phase-03-manager-dashboard.md`, this handoff.
- Phase 3 builds: /manager landing (ApplicationTable across the
  operation), /manager/contractors (create contractor accounts via
  POST /api/contractors), /manager/applications/[id] (detail page).
- New API route: `POST /api/contractors` -- create-user via auth admin
  API + insert profile. Order: auth -> manager role check -> rate limit
  -> Zod -> ownership (operation_id set on new profile) -> create auth
  user (admin) -> insert profile. Returns { contractorId }. Rate limit
  20/hour per manager (already in `src/lib/ratelimit.ts`).
- Reuse `ComplianceBadge` from `src/components/ui/`. Phase 3 builds
  `ApplicationTable`, `ContractorList`, `ApplicationDetail` (per
  BLUEPRINT) in `src/components/manager/`.
- Demo money moment lands here: the wind-flagged Maria/North Field/
  Roundup application from seed should be the FIRST thing Jake sees
  on /manager, with a clear red badge and one-tap path to the detail
  page where the flag reason is the headline.

### Open question Phase 3 should answer

- **Realtime updates?** When a contractor submits an application, should
  the manager dashboard auto-refresh? Supabase realtime is possible but
  out of phase scope unless the demo absolutely needs it. Static refresh
  on focus or a manual refresh button is the simpler path.
