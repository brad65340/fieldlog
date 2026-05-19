# FieldLog — Claude Code Session Rules

## Project Identity
Vibeathon 2026, Problem 2. Solo build. Submission deadline May 22.
Agricultural pesticide compliance SaaS. Contractors log spray events. Managers verify.
Stack: Next.js 14 App Router + TypeScript strict + Tailwind + Supabase + Vercel.

Judging weights: Impact 40%, Demo Quality 20%, Feasibility 15%, Innovation 15%, UX 10%.
The demo money moment: a FLAGGED application caught by wind speed violation in the manager dashboard.

---

## Every Session Starts Here

1. Read BLUEPRINT.md in full
2. Read docs/phases/phase-0[N]-[name].md for the current phase
3. Read the most recent file in docs/handoffs/ if one exists
4. Confirm back: current phase, last session work, today's goal, outstanding security checks
5. Wait for first task

---

## Non-Negotiables

- Applications are IMMUTABLE after submit — no UPDATE or DELETE on the applications table via any API route, ever
- WeatherSnapshot is inserted by the server using service role only — never from the client
- RLS on every table before any data is written — no exceptions
- No secrets in any committed file — .env.local only
- pnpm run build must pass 0 errors before any session ends
- No em dashes in any written output — use regular dashes or rewrite the sentence
- No console.log in committed code
- TypeScript strict mode — no `any` without a justification comment

---

## File Placement Rules

| What | Where |
|---|---|
| All Zod schemas | src/schemas/ |
| All TypeScript interfaces | src/types/ |
| All data fetching | src/hooks/ only — never fetch() inside a component |
| All magic strings / brand tokens | src/constants/index.ts |
| Supabase browser client | src/lib/supabase/client.ts |
| Supabase server client | src/lib/supabase/server.ts |
| Compliance engine | src/lib/compliance.ts |
| Weather API wrapper | src/lib/weather.ts |
| PDF generation | src/lib/pdf.ts |
| Route protection | src/middleware.ts |
| DB changes | supabase/migrations/ only — never edit schema manually |
| Seed data | scripts/seed.ts |

---

## API Endpoint Template (Every Route Must Follow This Order)

```typescript
// 1. Auth
const user = await getAuthUser(req)
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 2. Rate limit
const allowed = await rateLimit(user.id, 'route:name')
if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

// 3. Input validation
const result = Schema.safeParse(await req.json())
if (!result.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

// 4. Ownership check
const resource = await supabase
  .from('table')
  .select('id')
  .eq('id', params.id)
  .eq('operation_id', user.profile.operation_id)
  .single()
if (!resource.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

// 5. Business logic
```

---

## Compliance Engine Reference (src/lib/compliance.ts)

```typescript
// Checks product label rules against captured weather
// Returns: { status: 'compliant' | 'flagged', flags: string[] }

Rules:
- wind_speed > product.max_wind_speed
    -> "Wind {actual} mph exceeded label limit of {max} mph"
- temperature < product.min_temp
    -> "Temperature {actual}F below label minimum of {min}F"
- temperature > product.max_temp
    -> "Temperature {actual}F exceeded label maximum of {max}F"
- rate_applied > product.max_rate_per_acre (when max_rate is not null)
    -> "Application rate {actual} exceeded label maximum of {max} oz/acre"

Collect ALL failures — do not short-circuit on first flag.
If flags.length > 0: status = 'flagged'
If flags.length === 0: status = 'compliant'
```

---

## Supabase RLS Rules (Enforced at DB Level)

```sql
-- operations: owner reads their own
-- profiles: users in same operation can read, manager can insert
-- fields: operation members read, manager inserts/updates
-- products: public read, no writes via API
-- applications:
--   contractors: INSERT only (no SELECT own records via anon — use service role for reads)
--   managers: SELECT all in their operation, no INSERT/UPDATE/DELETE
-- weather_snapshots: service role inserts, managers SELECT
```

---

## Brand Tokens (src/constants/index.ts)

```typescript
export const BRAND = {
  primary: '#2C3E50',
  accent: '#52896F',
  background: '#F5F4F2',
  text: '#1a1a2e',
  textLight: '#4a4a68',
  border: '#e8e7e5',
} as const

export const TAGLINE = 'Contractors logged. You verify. Compliant operations.'

export const ROUTES = {
  home: '/',
  login: '/login',
  contractor: '/contractor',
  contractorHistory: '/contractor/history',
  manager: '/manager',
  managerContractors: '/manager/contractors',
  managerApplication: (id: string) => `/manager/applications/${id}`,
} as const

export const COMPLIANCE_STATUS = {
  compliant: 'compliant',
  flagged: 'flagged',
  pending: 'pending',
} as const

export const USER_ROLES = {
  manager: 'manager',
  contractor: 'contractor',
} as const
```

---

## Code Health Limits

- Max 200 lines per component — split before adding more
- Max 150 lines per API route
- Max 100 lines per hook
- Grep before writing any utility — one implementation only
- No :any without a comment
- No console.log in committed code

---

## Seed Data (executed in Phase 5 via scripts/seed.ts)

Operation: Caspian Ag Services
Manager: Jake Caspian (manager role)
Contractors: Maria Santos, Tyler Reed

Fields:
- North Field, 120ac, lat/lng in NE Missouri area
- South Creek Field, 85ac
- East Timber Field, 60ac

Products (with real EPA reg numbers):
- Roundup PowerMax 3: EPA 524-549, wind 10mph max, 40-90F, RU false
- Engenia (Dicamba): EPA 7969-345, wind 10mph max, 50-85F, RU true
- Atrazine 4L: EPA 100-497, wind 10mph max, 40-90F, RU true
- Liberty 280 SL: EPA 264-829, wind 10mph max, 50-85F, RU false
- Headline AMP: EPA 7969-326, wind 10mph max, 40-85F, RU false

Applications (8 total):
- 5 COMPLIANT (routine, various fields/products/contractors)
- 1 FLAGGED: Maria Santos, North Field, Roundup, wind_speed=14.2mph (max=10)
- 1 FLAGGED: Tyler Reed, South Creek, Engenia, temp=92F (max=85F)
- 1 PENDING: Tyler Reed, East Timber, Liberty, submitted 30 min ago

---

## Git Conventions

```bash
feat: Phase N complete - [name]
feat(mod-X.X): [what was built]
fix([scope]): [what was fixed]
security: [security fix]
chore: [housekeeping]

# Tag every completed phase
git tag phase-0N-complete
git push --tags
```

---

## Session End Checklist (Run Every Time)

```bash
pnpm run build                          # must pass 0 errors
pnpm run lint                           # must pass 0 errors
grep -r ": any\|as any" src/           # must be empty or justified
grep -r "console\.log" src/            # must be empty
find src -name "*.tsx" | xargs wc -l | sort -rn | head -10  # flag >200 lines
```

Then write handoff: docs/handoffs/phase-[N]-mod-[X.X]-session-[N].md
