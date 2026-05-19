# FieldLog — Master Blueprint

## What This Is

FieldLog is a mobile-first SaaS platform for mid-to-large agricultural operations
managing multiple spray contractors. Contractors log pesticide applications in the
field (offline-capable PWA). The manager sees all contractor logs in real time with
automatic EPA compliance checking and weather data captured at the moment of
application. Every log is immutable after submission — creating a tamper-proof audit
trail for EPA inspections. Built for Codefi Vibeathon 2026, Problem 2.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript (strict), Tailwind CSS |
| Database | Supabase (Postgres + Auth + RLS) |
| Backend | Next.js API Routes (App Router) |
| Hosting | Vercel |
| Weather | OpenWeatherMap API (current conditions at GPS coordinates) |
| PDF Export | react-pdf |
| Validation | Zod |
| Rate Limiting | Upstash Redis |

---

## Core Data Models

### operations
```
id            UUID PK
name          TEXT NOT NULL
owner_id      UUID FK auth.users
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### profiles (extends auth.users — 1:1)
```
id            UUID PK FK auth.users
operation_id  UUID FK operations
role          TEXT CHECK (role IN ('manager','contractor'))
first_name    TEXT NOT NULL
last_name     TEXT NOT NULL
email         TEXT NOT NULL
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### fields
```
id            UUID PK
operation_id  UUID FK operations
name          TEXT NOT NULL
acreage       DECIMAL(10,2)
lat           DECIMAL(10,6)
lng           DECIMAL(10,6)
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### products (seeded — no user writes via API)
```
id                        UUID PK
name                      TEXT NOT NULL
epa_reg_number            TEXT NOT NULL
active_ingredient         TEXT
restricted_use            BOOLEAN DEFAULT false
max_wind_speed            DECIMAL(5,2)   -- mph
min_temp                  DECIMAL(5,2)   -- fahrenheit
max_temp                  DECIMAL(5,2)   -- fahrenheit
re_entry_interval_hours   INTEGER
pre_harvest_interval_days INTEGER
max_rate_per_acre         DECIMAL(10,3)
rate_unit                 TEXT DEFAULT 'oz/acre'
created_at                TIMESTAMPTZ DEFAULT NOW()
```

### applications (IMMUTABLE after submit — NO updated_at)
```
id                UUID PK
operation_id      UUID FK operations
contractor_id     UUID FK profiles
field_id          UUID FK fields
product_id        UUID FK products
rate_applied      DECIMAL(10,3) NOT NULL
rate_unit         TEXT NOT NULL DEFAULT 'oz/acre'
acreage_treated   DECIMAL(10,2) NOT NULL
target_pest       TEXT
application_start TIMESTAMPTZ NOT NULL
application_end   TIMESTAMPTZ
lat               DECIMAL(10,6)      -- GPS at time of application
lng               DECIMAL(10,6)
compliance_status TEXT CHECK (compliance_status IN ('compliant','flagged','pending'))
compliance_flags  JSONB              -- array of string reasons
notes             TEXT
submitted_at      TIMESTAMPTZ DEFAULT NOW()
created_at        TIMESTAMPTZ DEFAULT NOW()
```

### weather_snapshots (server-inserted only — never from client)
```
id              UUID PK
application_id  UUID FK applications UNIQUE
wind_speed      DECIMAL(5,2)   -- mph
wind_direction  INTEGER        -- degrees 0-360
temperature     DECIMAL(5,2)   -- fahrenheit
humidity        INTEGER        -- percent
conditions      TEXT           -- "Clear", "Cloudy", etc.
captured_at     TIMESTAMPTZ DEFAULT NOW()
source          TEXT DEFAULT 'openweathermap'
```

---

## Compliance Engine Logic (lib/compliance.ts)

```
Input:  product label rules + weather snapshot + application rate
Output: { status: 'compliant' | 'flagged', flags: string[] }

Rules (check all — collect all failures):
- wind_speed > product.max_wind_speed
    flag: "Wind {actual} mph exceeded label limit of {max} mph"
- temperature < product.min_temp
    flag: "Temperature {actual}F below label minimum of {min}F"
- temperature > product.max_temp
    flag: "Temperature {actual}F exceeded label maximum of {max}F"
- rate_applied > product.max_rate_per_acre (when max is set)
    flag: "Application rate {actual} exceeded label maximum of {max} oz/acre"

If flags.length > 0 → status = 'flagged'
If flags.length === 0 → status = 'compliant'
```

---

## Seed Data Summary (executed in Phase 5)

**Operation:** Caspian Ag Services
**Manager:** Jake Caspian (jake@caspianag.com)
**Contractors:** Maria Santos, Tyler Reed

**Fields:** North Field (120ac, NE Missouri), South Creek Field (85ac), East Timber Field (60ac)

**Products:**
1. Roundup PowerMax 3 — EPA 524-549 — wind 10mph, 40-90F, RU: false
2. Engenia (Dicamba) — EPA 7969-345 — wind 10mph, 50-85F, RU: true
3. Atrazine 4L — EPA 100-497 — wind 10mph, 40-90F, RU: true
4. Liberty 280 SL — EPA 264-829 — wind 10mph, 50-85F, RU: false
5. Headline AMP — EPA 7969-326 — wind 10mph, 40-85F, RU: false

**Applications (8 total):**
- 5 COMPLIANT (good conditions, routine logs)
- 1 FLAGGED: wind violation — Maria, North Field, Roundup, wind_speed=14mph (max=10)
- 1 FLAGGED: temp violation — Tyler, South Creek, Engenia, temp=92F (max=85)
- 1 PENDING: submitted within last hour (Tyler, East Timber)

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENWEATHERMAP_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Project Structure

```
/
├── BLUEPRINT.md
├── DECISIONS.md
├── SECURITY.md
├── .claude/
│   └── CLAUDE.md
├── docs/
│   ├── phases/
│   │   ├── phase-01-foundation.md
│   │   ├── phase-02-contractor-flow.md
│   │   ├── phase-03-manager-dashboard.md
│   │   ├── phase-04-audit-export.md
│   │   ├── phase-05-polish-seed.md
│   │   └── phase-06-demo-submit.md
│   ├── handoffs/
│   └── contracts/
├── src/
│   ├── app/
│   │   ├── page.tsx                        -- Landing page
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── contractor/
│   │   │   ├── layout.tsx                  -- Auth guard (contractor only)
│   │   │   ├── page.tsx                    -- Log application form
│   │   │   └── history/
│   │   │       └── page.tsx               -- My past logs
│   │   ├── manager/
│   │   │   ├── layout.tsx                  -- Auth guard (manager only)
│   │   │   ├── page.tsx                    -- Dashboard (all applications)
│   │   │   ├── contractors/
│   │   │   │   └── page.tsx               -- Manage contractor accounts
│   │   │   └── applications/
│   │   │       └── [id]/
│   │   │           └── page.tsx           -- Application detail + export
│   │   └── api/
│   │       ├── applications/
│   │       │   └── route.ts               -- POST: submit application
│   │       ├── contractors/
│   │       │   └── route.ts               -- POST: create contractor account
│   │       └── export/
│   │           └── [id]/
│   │               └── route.ts           -- GET: generate PDF
│   ├── components/
│   │   ├── ui/                            -- Button, Badge, Card, Input (generic)
│   │   ├── contractor/                    -- ApplicationForm, OfflineBanner
│   │   └── manager/                       -- ApplicationTable, ComplianceBadge,
│   │                                      --   ContractorList, ApplicationDetail
│   ├── hooks/
│   │   ├── useApplications.ts
│   │   ├── useContractors.ts
│   │   ├── useFields.ts
│   │   └── useProducts.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                  -- Browser Supabase client
│   │   │   └── server.ts                  -- Server Supabase client (cookies)
│   │   ├── compliance.ts                  -- Compliance check engine
│   │   ├── weather.ts                     -- OpenWeatherMap wrapper
│   │   └── pdf.ts                         -- PDF generation
│   ├── middleware.ts                       -- Role-based route protection
│   ├── schemas/                           -- All Zod schemas
│   ├── types/                             -- All TypeScript interfaces
│   ├── constants/
│   │   └── index.ts                       -- Brand tokens, enums, routes
│   └── utils/
│       └── index.ts
├── supabase/
│   └── migrations/                        -- All schema changes (migration files only)
└── scripts/
    └── seed.ts                            -- Seed data script
```

---

## Hard Rules — Claude Must Never Break

1. Never modify completed phase code without explicit developer instruction
2. All DB changes go through migration files in supabase/migrations/ only
3. RLS enabled on every table — policies written before any data is inserted
4. No secrets in any committed file — all keys in .env.local only
5. No string interpolation in SQL — parameterized queries always
6. Every API endpoint order: auth > rate limit > input validation > ownership check > logic
7. Never return 403 for unauthorized resources — return 404
8. Never break Phase 1 API contracts once locked
9. TypeScript strict mode — no `any` without a comment explaining why
10. pnpm run build must pass 0 errors before any session ends
11. Search the codebase for existing utilities before writing a new one
12. No component over 200 lines — split before adding more
13. No fetch() calls inside components — all data fetching in src/hooks/
14. No magic strings in components — literals used 2+ times go in src/constants/
15. No console.log in committed code
16. No em dashes in any written output — use regular dashes or rewrite
17. Applications are IMMUTABLE after submit — no UPDATE or DELETE on applications via API ever
18. WeatherSnapshot is inserted by server (service role) only — never from client directly

---

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 1 | Foundation | Complete (2026-05-19) |
| 2 | Contractor Flow | Complete (2026-05-19) |
| 3 | Manager Dashboard | Pending |
| 4 | Audit Export | Pending |
| 5 | Polish + Seed Data | Pending |
| 6 | Demo + Submit | Pending |

---

## Session Start Protocol

Paste at the top of every new Claude Code session:

```
Read BLUEPRINT.md and docs/phases/phase-0[N]-[name].md before doing anything.
Also read the most recent file in docs/handoffs/ if one exists.

Confirm back to me:
- Current phase and module
- What was completed last session
- What we are building today
- Any security checks outstanding from last session

Then wait for my first task.
```

---

## Session End Protocol

Paste before closing every Claude Code session:

```
We are wrapping this session. Before the handoff:

1. Run: pnpm run build -- confirm 0 errors
2. Run: pnpm run lint -- confirm 0 errors

3. Security spot check on any new endpoints:
   - Auth check present?
   - Ownership check (.eq('operation_id', ...)) present?
   - No string interpolation in queries?
   - RLS on any new tables?

4. Code health check on new files:
   - Any function duplicated from an existing utility?
   - Any component over 200 lines?
   - Any :any or as any introduced?
   - Any console.log left in?
   - Any magic strings that should be in constants/?
   - Any fetch() called directly inside a component?

Then write handoff to docs/handoffs/phase-[N]-mod-[X.X]-session-[N].md
```
