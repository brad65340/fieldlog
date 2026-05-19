# Security Decisions and Threat Model

---

## Auth Model

Supabase Auth (email + password). JWT stored in httpOnly cookie via @supabase/ssr.
Session validated server-side on every protected request via middleware.
No client-side auth state used for access control decisions.

---

## Authorization Model

Role-based. Every user has a role stored in profiles.role ('manager' | 'contractor').
All role checks happen server-side in middleware.ts and in API routes.
Client UI reflects role but never enforces it.

```
/contractor/* - contractor role only (middleware enforces)
/manager/*    - manager role only (middleware enforces)
/api/*        - each route verifies auth + role + operation ownership
```

---

## Row Level Security (RLS) — All Tables

RLS is enabled on every table before any data is written.

### operations
- SELECT: owner_id = auth.uid()
- INSERT: auth.uid() is not null (creates own operation on signup)
- UPDATE: owner_id = auth.uid()
- DELETE: disabled

### profiles
- SELECT: operation_id matches caller's operation_id
- INSERT: auth.uid() = id (own profile only, on signup)
- UPDATE: auth.uid() = id (own profile) OR caller is manager in same operation
- DELETE: disabled

### fields
- SELECT: operation_id matches caller's operation_id
- INSERT: caller is manager in same operation
- UPDATE: caller is manager in same operation
- DELETE: disabled

### products
- SELECT: public (all authenticated users)
- INSERT/UPDATE/DELETE: disabled via API (seeded only via service role)

### applications
- SELECT: operation_id matches caller's operation_id (managers and contractors both)
- INSERT: caller is authenticated contractor in same operation
- UPDATE: DISABLED -- immutable after submit
- DELETE: DISABLED -- immutable after submit

### weather_snapshots
- SELECT: application's operation_id matches caller's operation_id
- INSERT: service role only (via API route using SUPABASE_SERVICE_ROLE_KEY)
- UPDATE: disabled
- DELETE: disabled

---

## Secrets Inventory

| Secret Name | Where it Lives | Used For |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | .env.local | Supabase client init |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | .env.local | Supabase anon client |
| SUPABASE_SERVICE_ROLE_KEY | .env.local (server only) | Service role inserts (weather_snapshots) |
| OPENWEATHERMAP_API_KEY | .env.local (server only) | Weather fetch in API routes |
| UPSTASH_REDIS_REST_URL | .env.local (server only) | Rate limiting |
| UPSTASH_REDIS_REST_TOKEN | .env.local (server only) | Rate limiting |

NEXT_PUBLIC_ prefix = safe to expose in client bundle.
All others = server-side only. Never reference in any client component.

---

## Known Risks and Mitigations

### Risk: GPS spoofing by contractor
A contractor could submit fake GPS coordinates to capture fraudulent weather data.
**Mitigation:** Weather is fetched server-side from submitted GPS. The submitted GPS is logged immutably alongside the weather. Managers can cross-reference field GPS coordinates vs. application GPS. Full mitigation requires geofencing (post-vibeathon).

### Risk: Contractor submits application from a field they don't work
**Mitigation:** Field belongs to operation. Contractor belongs to operation. Operation membership is validated at API route level. A contractor cannot submit for a field outside their operation.

### Risk: Rate limit bypass via multiple accounts
**Mitigation:** Rate limiting applied per user ID (from JWT), not per IP. Creating multiple accounts to bypass limits requires separate verification.

### Risk: Service role key exposure
**Mitigation:** SUPABASE_SERVICE_ROLE_KEY is server-side only. Never referenced in src/lib/supabase/client.ts or any component. Only used in src/lib/supabase/server.ts when explicitly needed for service-role operations.

---

## API Security Per Route

### POST /api/applications
- Auth: required (contractor role)
- Rate limit: 10 requests per minute per user
- Input: ApplicationSchema (Zod) -- field_id, product_id, rate_applied, acreage_treated, target_pest, application_start, lat, lng, notes
- Ownership: field_id must belong to caller's operation_id
- Product: product_id must exist in products table
- Side effects: fetches weather (server), runs compliance check (server), inserts application + weather_snapshot
- Returns: { applicationId, complianceStatus, flags }

### POST /api/contractors
- Auth: required (manager role)
- Rate limit: 20 requests per hour per user
- Input: ContractorSchema -- email, first_name, last_name
- Ownership: caller's operation_id is set on new profile
- Creates Supabase auth user + profile with contractor role
- Returns: { contractorId }

### GET /api/export/[id]
- Auth: required (manager role)
- Rate limit: 30 requests per hour per user
- Ownership: application's operation_id must match caller's operation_id
- Returns: PDF binary (Content-Type: application/pdf)

---

## Pre-Deploy Security Checklist

- [ ] .env.local is in .gitignore
- [ ] git log -p | grep -iE "key|secret|password" returns nothing sensitive
- [ ] pnpm audit shows no critical vulnerabilities
- [ ] RLS verified: logged in as contractor A, cannot read contractor B's applications
- [ ] RLS verified: manager in operation A cannot read operation B's applications
- [ ] No NEXT_PUBLIC_ prefix on SUPABASE_SERVICE_ROLE_KEY
- [ ] No API key hardcoded in any file
- [ ] All protected routes redirect to /login when accessed without valid session
- [ ] /manager/* returns redirect for contractor role (not 200)
- [ ] /contractor/* returns redirect for manager role (not 200)
