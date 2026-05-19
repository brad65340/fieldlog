# Phase 1 — Foundation

**Goal:** Project scaffold, full Supabase schema with RLS, auth setup, role-based routing. No UI beyond login. Data layer complete and verified.

**Estimated time:** 2-3 hours

---

## Module 1.1 — Project Scaffold

### Tasks
1. Create Next.js 14 project:
```bash
pnpm create next-app@latest fieldlog --typescript --tailwind --app --src-dir --no-eslint
cd fieldlog
```

2. Install dependencies:
```bash
pnpm add @supabase/supabase-js @supabase/ssr zod react-pdf @upstash/ratelimit @upstash/redis
pnpm add -D @types/node
```

3. Create .env.local with all required keys (empty values):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENWEATHERMAP_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

4. Verify .env.local is in .gitignore -- if not, add it immediately before first commit.

5. Create full folder structure per BLUEPRINT.md:
```bash
mkdir -p src/components/ui src/components/contractor src/components/manager
mkdir -p src/hooks src/lib/supabase src/schemas src/types src/constants src/utils
mkdir -p supabase/migrations scripts
mkdir -p docs/phases docs/handoffs docs/contracts
touch docs/handoffs/.gitkeep docs/contracts/.gitkeep
```

6. Create src/constants/index.ts with brand tokens, routes, and enums (see CLAUDE.md)

7. Create src/types/index.ts with TypeScript interfaces for all tables:
```typescript
export interface Operation { id: string; name: string; owner_id: string; created_at: string; updated_at: string }
export interface Profile { id: string; operation_id: string; role: 'manager' | 'contractor'; first_name: string; last_name: string; email: string; created_at: string; updated_at: string }
export interface Field { id: string; operation_id: string; name: string; acreage: number | null; lat: number | null; lng: number | null; created_at: string; updated_at: string }
export interface Product { id: string; name: string; epa_reg_number: string; active_ingredient: string | null; restricted_use: boolean; max_wind_speed: number | null; min_temp: number | null; max_temp: number | null; re_entry_interval_hours: number | null; pre_harvest_interval_days: number | null; max_rate_per_acre: number | null; rate_unit: string; created_at: string }
export interface Application { id: string; operation_id: string; contractor_id: string; field_id: string; product_id: string; rate_applied: number; rate_unit: string; acreage_treated: number; target_pest: string | null; application_start: string; application_end: string | null; lat: number | null; lng: number | null; compliance_status: 'compliant' | 'flagged' | 'pending'; compliance_flags: string[] | null; notes: string | null; submitted_at: string; created_at: string }
export interface WeatherSnapshot { id: string; application_id: string; wind_speed: number | null; wind_direction: number | null; temperature: number | null; humidity: number | null; conditions: string | null; captured_at: string; source: string }
export interface ApplicationWithRelations extends Application { profiles: Profile; fields: Field; products: Product; weather_snapshots: WeatherSnapshot | null }
```

8. Git init and first commit:
```bash
git init
git add .
git commit -m "chore: project scaffold"
```

### Checklist
- [ ] pnpm run build passes 0 errors
- [ ] .env.local in .gitignore
- [ ] All folders created
- [ ] All TypeScript interfaces defined
- [ ] All constants defined
- [ ] First commit clean

---

## Module 1.2 — Supabase Schema + Migrations

Write migration files in supabase/migrations/ in this exact order. Apply each to Supabase dashboard SQL editor.

### 001_create_operations.sql
```sql
CREATE TABLE operations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_own_operation" ON operations
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_operations_owner ON operations(owner_id);
```

### 002_create_profiles.sql
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id  UUID REFERENCES operations(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('manager', 'contractor')),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_operation_profiles" ON profiles
  FOR SELECT USING (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE INDEX idx_profiles_operation ON profiles(operation_id);
CREATE INDEX idx_profiles_role ON profiles(operation_id, role);
```

### 003_create_fields.sql
```sql
CREATE TABLE fields (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id  UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  acreage       DECIMAL(10,2),
  lat           DECIMAL(10,6),
  lng           DECIMAL(10,6),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operation_members_read_fields" ON fields
  FOR SELECT USING (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "managers_manage_fields" ON fields
  FOR INSERT WITH CHECK (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
  );

CREATE POLICY "managers_update_fields" ON fields
  FOR UPDATE USING (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
  );

CREATE INDEX idx_fields_operation ON fields(operation_id);
```

### 004_create_products.sql
```sql
CREATE TABLE products (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  epa_reg_number            TEXT NOT NULL,
  active_ingredient         TEXT,
  restricted_use            BOOLEAN NOT NULL DEFAULT false,
  max_wind_speed            DECIMAL(5,2),
  min_temp                  DECIMAL(5,2),
  max_temp                  DECIMAL(5,2),
  re_entry_interval_hours   INTEGER,
  pre_harvest_interval_days INTEGER,
  max_rate_per_acre         DECIMAL(10,3),
  rate_unit                 TEXT NOT NULL DEFAULT 'oz/acre',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_products" ON products
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- No INSERT/UPDATE/DELETE policy -- seeded via service role only
```

### 005_create_applications.sql
```sql
-- IMPORTANT: No updated_at column -- applications are immutable after insert
CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id      UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  contractor_id     UUID NOT NULL REFERENCES profiles(id),
  field_id          UUID NOT NULL REFERENCES fields(id),
  product_id        UUID NOT NULL REFERENCES products(id),
  rate_applied      DECIMAL(10,3) NOT NULL,
  rate_unit         TEXT NOT NULL DEFAULT 'oz/acre',
  acreage_treated   DECIMAL(10,2) NOT NULL,
  target_pest       TEXT,
  application_start TIMESTAMPTZ NOT NULL,
  application_end   TIMESTAMPTZ,
  lat               DECIMAL(10,6),
  lng               DECIMAL(10,6),
  compliance_status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (compliance_status IN ('compliant', 'flagged', 'pending')),
  compliance_flags  JSONB,
  notes             TEXT,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Contractors can INSERT into their own operation
CREATE POLICY "contractors_insert_applications" ON applications
  FOR INSERT WITH CHECK (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
    AND contractor_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'contractor'
  );

-- All operation members can SELECT
CREATE POLICY "operation_members_read_applications" ON applications
  FOR SELECT USING (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
  );

-- NO UPDATE policy -- immutable
-- NO DELETE policy -- immutable

CREATE INDEX idx_applications_operation ON applications(operation_id, submitted_at DESC);
CREATE INDEX idx_applications_contractor ON applications(contractor_id);
CREATE INDEX idx_applications_field ON applications(field_id);
CREATE INDEX idx_applications_status ON applications(operation_id, compliance_status);
```

### 006_create_weather_snapshots.sql
```sql
CREATE TABLE weather_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  wind_speed      DECIMAL(5,2),
  wind_direction  INTEGER,
  temperature     DECIMAL(5,2),
  humidity        INTEGER,
  conditions      TEXT,
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL DEFAULT 'openweathermap'
);

ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;

-- Operation members can read weather snapshots for their applications
CREATE POLICY "operation_members_read_weather" ON weather_snapshots
  FOR SELECT USING (
    (SELECT operation_id FROM applications WHERE id = application_id)
    = (SELECT operation_id FROM profiles WHERE id = auth.uid())
  );

-- INSERT via service role only (no user-facing INSERT policy)

CREATE INDEX idx_weather_application ON weather_snapshots(application_id);
```

### Checklist
- [ ] All 5 tables created in Supabase
- [ ] RLS enabled on every table (verify in Supabase dashboard Authentication > Policies)
- [ ] All indexes applied
- [ ] Applications has NO UPDATE policy (verify -- critical)
- [ ] Weather_snapshots has NO user-facing INSERT policy (verify)
- [ ] Can read operations table as authenticated user
- [ ] Cannot read another user's operations data

---

## Module 1.3 — Auth + Role-Based Routing

### Supabase Client Setup

**src/lib/supabase/client.ts** (browser client):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**src/lib/supabase/server.ts** (server client):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createServiceClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**src/middleware.ts** (route protection):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Not logged in -- redirect to login for protected routes
  if (!user && (pathname.startsWith('/manager') || pathname.startsWith('/contractor'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname.startsWith('/manager') || pathname.startsWith('/contractor'))) {
    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Wrong role -- redirect
    if (pathname.startsWith('/manager') && profile.role !== 'manager') {
      return NextResponse.redirect(new URL('/contractor', request.url))
    }
    if (pathname.startsWith('/contractor') && profile.role !== 'contractor') {
      return NextResponse.redirect(new URL('/manager', request.url))
    }
  }

  // Logged in user hitting /login -- redirect to their dashboard
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'manager') return NextResponse.redirect(new URL('/manager', request.url))
    if (profile?.role === 'contractor') return NextResponse.redirect(new URL('/contractor', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

### Login Page (src/app/login/page.tsx)
Build a clean login form. Email + password. On submit, call supabase.auth.signInWithPassword(). On success, router.push() based on role. On error, show error message inline (no alert()).
Style with brand colors from constants.

### Layout Guards

**src/app/contractor/layout.tsx** -- server component, reads auth, shows contractor shell
**src/app/manager/layout.tsx** -- server component, reads auth, shows manager shell
Both redirect to /login if no valid session (belt-and-suspenders alongside middleware).

### Checklist
- [ ] Login page functional -- email + password
- [ ] Manager login redirects to /manager
- [ ] Contractor login redirects to /contractor
- [ ] Accessing /manager as contractor redirects to /contractor
- [ ] Accessing /contractor as manager redirects to /manager
- [ ] Accessing /manager with no session redirects to /login
- [ ] pnpm run build passes 0 errors

---

## Phase 1 Acceptance Criteria

Phase 1 is done when ALL are true:
- [ ] pnpm run build passes 0 errors
- [ ] pnpm run lint passes 0 errors
- [ ] All 5 tables in Supabase with RLS enabled and verified
- [ ] No UPDATE policy on applications table
- [ ] No user-facing INSERT policy on weather_snapshots table
- [ ] All indexes applied
- [ ] Auth flow tested: manager -> /manager, contractor -> /contractor
- [ ] Wrong-role redirect tested
- [ ] No-session redirect tested
- [ ] .env.local not in git
- [ ] All TypeScript types defined in src/types/index.ts
- [ ] All constants defined in src/constants/index.ts
- [ ] Handoff written to docs/handoffs/phase-01-mod-1.3-session-1.md
- [ ] Committed: "feat: Phase 1 complete - Foundation"
- [ ] Tagged: git tag phase-01-complete
