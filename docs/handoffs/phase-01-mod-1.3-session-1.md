# Phase 1 Handoff -- Foundation Complete

**Date:** 2026-05-19
**Branch:** main
**Tag:** phase-01-complete (created at the commit named in "Last commit" below)
**Last commit on close:** see `git log -1 --oneline` after Phase 1 completion commit

---

## What got built

### Module 1.1 -- Scaffold

- Next.js 15.5.18 + React 19.2.6 + TypeScript 5.9 strict + Tailwind v4 (App Router, `src/` layout, no ESLint per phase-doc flags).
- Deps: `@supabase/supabase-js@2.106`, `@supabase/ssr@0.10`, `zod@4`, `@react-pdf/renderer@4.5`, `@upstash/ratelimit@2`, `@upstash/redis@1.38`.
- Folder structure per BLUEPRINT: `src/{components/{ui,contractor,manager},hooks,lib/supabase,schemas,types,constants,utils}`, `supabase/migrations`, `scripts`, `docs/{phases,handoffs,contracts}`.
- `src/constants/index.ts`: `BRAND`, `TAGLINE`, `ROUTES`, `COMPLIANCE_STATUS`, `USER_ROLES` + derived `ComplianceStatus` / `UserRole` types.
- `src/types/index.ts`: all 7 interfaces (Operation, Profile, Field, Product, Application, WeatherSnapshot, ApplicationWithRelations).
- `.env.local` placeholder (gitignored, verified).

### Module 1.2 -- Supabase schema + migrations

Seven migrations applied via `supabase db push` (CLI route, not dashboard):

- `20260519120001_create_operations.sql`
- `20260519120002_create_profiles.sql`
- `20260519120003_create_fields.sql`
- `20260519120004_create_products.sql`
- `20260519120005_create_applications.sql` -- IMMUTABLE: no `updated_at` column, no UPDATE/DELETE policy (ADR-001)
- `20260519120006_create_weather_snapshots.sql` -- no user-facing INSERT policy (ADR-002)
- `20260519180000_profiles_read_own_base_case.sql` -- non-recursive own-profile SELECT policy (necessary but not sufficient on its own; see Module 1.x notes below)
- `20260519200000_fix_rls_recursion.sql` -- SECURITY DEFINER helpers + policy recreation (THE actual fix)

RLS enabled on all 6 tables; verified by `scripts/verify-rls.sql`. Applications has SELECT + INSERT only; no UPDATE/DELETE. Weather_snapshots has SELECT only.

### Module 1.3 -- Auth + role-based routing

- `src/lib/supabase/client.ts` -- browser client (`createBrowserClient`).
- `src/lib/supabase/server.ts` -- server client (`createServerClient` + async `cookies`) and service-role client (plain `@supabase/supabase-js` with `persistSession: false`).
- `src/middleware.ts` -- HTTP-verified `auth.getUser()`, ROUTES + USER_ROLES constants, redirects for unauth/wrong-role/already-authed-at-login.
- `src/app/login/page.tsx` -- client component, email + password, inline error display with specific PostgREST error surfacing (left in from debugging).
- `src/app/contractor/layout.tsx`, `src/app/manager/layout.tsx` -- server-component auth guards, belt-and-suspenders with middleware.
- `src/app/contractor/page.tsx`, `src/app/manager/page.tsx` -- placeholder dashboards.

---

## Diverged from the phase doc

These are deliberate; all logged in DECISIONS.md or this handoff.

1. **Next 15 pinned, not @latest.** Phase doc command uses `create-next-app@latest`, which installed Next 16. Reverted via package.json `"next": "^15.0.0"`. See ADR-009.
2. **`@react-pdf/renderer`, not `react-pdf`.** Phase doc had wrong package name; the latter is a viewer. See ADR-010. (PDF code lands Phase 4; the dep is just installed.)
3. **Zod 4 (not 3).** `zod@latest` resolved to v4; minor API differences may surface in Phase 2 schemas.
4. **Service-role Supabase client uses plain `@supabase/supabase-js`, not `@supabase/ssr`.** Phase doc wrapped service-role in `createServerClient` with a cookie adapter. Cleaner pattern: no cookies needed for service-role flows.
5. **Migrations renamed to Supabase CLI timestamp format.** Phase doc named them `001..006_*.sql`; the CLI silently ignores those. `git mv` to `<YYYYMMDDHHMMSS>_*.sql`.
6. **Supabase CLI workflow adopted over dashboard SQL editor.** All schema changes flow through `supabase/migrations/` + `supabase db push`. Dashboard SQL editor only used for one-off bootstrap (`scripts/bootstrap-phase-1.sql`) and verification queries.
7. **Docs reorganized to match BLUEPRINT structure** -- root `BLUEPRINT.md`/`DECISIONS.md`/`SECURITY.md`, `.claude/CLAUDE.md`, `docs/phases/phase-0[1-6]-*.md`. Files originally landed in flat `docs/`.

---

## Load-bearing things future sessions must respect

1. **`public.current_user_operation_id()` and `public.current_user_role()` are SECURITY DEFINER helpers.** Every operation-scoped RLS policy in the schema calls these instead of subquerying profiles directly. Dropping or modifying them silently breaks every operation-scoped read across the schema (causes Postgres 42P17). If a future migration needs the caller's operation_id or role inside a policy USING/WITH CHECK clause, USE THESE -- do not subquery profiles. See migration `20260519200000_fix_rls_recursion.sql` and the head comment for the full rationale.

2. **Applications table is IMMUTABLE (ADR-001).** No `updated_at` column, no UPDATE/DELETE policy. Phase 2 must NOT add an "edit submitted application" feature; the demo value proposition is the immutability.

3. **Weather snapshots are server-inserted only (ADR-002).** Phase 2's POST /api/applications must use the service-role client (`createServiceClient()` from `src/lib/supabase/server.ts`) for the weather_snapshots INSERT. The anon client has no INSERT policy and will be rejected.

---

## Phase 1 acceptance checklist

- [x] `pnpm run build` 0 errors (Next 15.5.18, 5 routes, middleware 90.1 KB)
- [x] `pnpm run lint` -- N/A, scaffolded with `--no-eslint` per phase doc command
- [x] All 6 tables in Supabase, RLS enabled, indexes applied
- [x] Applications has no UPDATE/DELETE policy (verified via `scripts/verify-rls.sql`)
- [x] Weather_snapshots has no user-facing INSERT policy (verified)
- [x] Auth flow tested: manager -> /manager, contractor -> /contractor, wrong-role redirects, no-session redirect (verified by Brad in-browser 2026-05-19)
- [x] `.env.local` gitignored (verified with `git check-ignore`)
- [x] TS interfaces in `src/types/index.ts`
- [x] Constants in `src/constants/index.ts`
- [x] No `: any` or `as any` in `src/`
- [x] No `console.log` in committed code
- [x] No file over 200 lines (largest: `src/app/login/page.tsx` at 117)
- [x] Handoff written (this file)
- [x] Committed and tagged `phase-01-complete`

---

## Bootstrap state on the linked Supabase project

- Project URL: in `.env.local` (gitignored)
- Test auth users created in Dashboard -> Authentication: `manager@test.com`, `contractor@test.com`
- Bootstrap SQL applied via Dashboard SQL Editor: `scripts/bootstrap-phase-1.sql`
- Resulting rows:
  - 1 operation: "Test Operation" (owner = manager@test.com)
  - 2 profiles: Test Manager (manager role), Test Contractor (contractor role), both linked to that operation
- No fields, no products, no applications yet. Phase 5 seed will replace this minimal bootstrap with the full demo dataset (Caspian Ag Services + 3 fields + 5 products + 8 apps).

---

## Outstanding for next session

Nothing blocking. Phase 2 (Contractor Flow) begins clean:

- Read `BLUEPRINT.md`, `.claude/CLAUDE.md`, `DECISIONS.md`, `SECURITY.md`, `docs/phases/phase-02-contractor-flow.md`, this handoff.
- Phase 2 builds: contractor application form, fields + products dropdowns, GPS capture, the POST /api/applications endpoint (auth + rate limit + Zod + ownership + weather fetch + compliance + immutable insert + weather_snapshot via service role), offline-capable PWA shell.
- The contractor will need at least one Field row and one Product row to submit an application -- decide early in Phase 2 whether to (a) extend the bootstrap, (b) have the manager create fields via the dashboard, or (c) build the minimal manager-side field-add UI first. The phase doc's order assumes (c) -- read it before deciding.

## Things to maybe do (not blockers)

- Tighten the login page's diagnostic error UI. The "Profile lookup failed: ... [code]" branch is helpful for development but is too revealing for production. Replace with a generic message + structured logging once we have logging in place.
- The login page is 117 lines and uses inline styles for brand colors. Once Phase 5 polish defines proper Tailwind brand tokens in `globals.css @theme`, refactor.
- The orphan `supabase_migrations` row at `20260519144910` has been reverted (`supabase migration repair --status reverted`); local + remote match. No action needed.
