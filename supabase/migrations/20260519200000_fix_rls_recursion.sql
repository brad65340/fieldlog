-- Break RLS recursion across the schema via SECURITY DEFINER helper functions.
--
-- The original policies on profiles, fields, applications, and weather_snapshots
-- all looked up the caller's operation_id (and sometimes role) via:
--   (SELECT operation_id FROM profiles WHERE id = auth.uid())
-- The subquery against profiles is itself subject to RLS. The profiles SELECT
-- policy contained the same shape, with no base case. Postgres detects the
-- recursion and throws SQLSTATE 42P17 ("infinite recursion detected in policy
-- for relation 'profiles'") at query time -- BEFORE the union of PERMISSIVE
-- policies is computed. That means adding a non-recursive own-profile policy
-- (20260519180000) was necessary but not sufficient: the recursive policy still
-- exists and still triggers 42P17.
--
-- Canonical Supabase fix: replace the subquery with a SECURITY DEFINER function.
-- The function runs as its owner (postgres), so its internal SELECT bypasses RLS
-- entirely. Callers get a plain scalar; no recursion.
--
-- Functions added (in public for now; can move to a dedicated schema later):
--   - public.current_user_operation_id()  returns uuid
--   - public.current_user_role()          returns text  ('manager' | 'contractor')
--
-- Policies recreated (DROP IF EXISTS + CREATE so re-running this migration after
-- partial application is safe):
--   profiles           : users_read_own_operation_profiles                  (SELECT)
--   fields             : operation_members_read_fields                       (SELECT)
--                        managers_manage_fields                              (INSERT)
--                        managers_update_fields                              (UPDATE)
--   applications       : contractors_insert_applications                     (INSERT)
--                        operation_members_read_applications                 (SELECT)
--   weather_snapshots  : operation_members_read_weather                      (SELECT)
--
-- Untouched (no profiles subquery, no recursion):
--   operations         : owners_manage_own_operation
--   products           : authenticated_read_products
--   profiles           : users_read_own_profile, users_insert_own_profile,
--                        users_update_own_profile
--
-- Future migrations that need the caller's operation_id or role MUST call these
-- functions rather than subquerying profiles directly. Anything else
-- reintroduces 42P17 for every operation-scoped read.

-- ---------- helper functions ----------

CREATE OR REPLACE FUNCTION public.current_user_operation_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT operation_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ---------- profiles ----------

DROP POLICY IF EXISTS "users_read_own_operation_profiles" ON public.profiles;
CREATE POLICY "users_read_own_operation_profiles" ON public.profiles
  FOR SELECT USING (operation_id = public.current_user_operation_id());

-- ---------- fields ----------

DROP POLICY IF EXISTS "operation_members_read_fields" ON public.fields;
CREATE POLICY "operation_members_read_fields" ON public.fields
  FOR SELECT USING (operation_id = public.current_user_operation_id());

DROP POLICY IF EXISTS "managers_manage_fields" ON public.fields;
CREATE POLICY "managers_manage_fields" ON public.fields
  FOR INSERT WITH CHECK (
    operation_id = public.current_user_operation_id()
    AND public.current_user_role() = 'manager'
  );

DROP POLICY IF EXISTS "managers_update_fields" ON public.fields;
CREATE POLICY "managers_update_fields" ON public.fields
  FOR UPDATE USING (
    operation_id = public.current_user_operation_id()
    AND public.current_user_role() = 'manager'
  );

-- ---------- applications ----------

DROP POLICY IF EXISTS "contractors_insert_applications" ON public.applications;
CREATE POLICY "contractors_insert_applications" ON public.applications
  FOR INSERT WITH CHECK (
    operation_id = public.current_user_operation_id()
    AND contractor_id = auth.uid()
    AND public.current_user_role() = 'contractor'
  );

DROP POLICY IF EXISTS "operation_members_read_applications" ON public.applications;
CREATE POLICY "operation_members_read_applications" ON public.applications
  FOR SELECT USING (operation_id = public.current_user_operation_id());

-- ---------- weather_snapshots ----------
-- Inner subquery on applications now uses applications' (recreated, non-recursive)
-- SELECT policy. If the caller can read the application (its operation_id matches
-- their operation_id), the inner returns that operation_id; otherwise NULL. The
-- outer comparison then resolves correctly with no recursion.

DROP POLICY IF EXISTS "operation_members_read_weather" ON public.weather_snapshots;
CREATE POLICY "operation_members_read_weather" ON public.weather_snapshots
  FOR SELECT USING (
    (SELECT operation_id FROM public.applications WHERE id = application_id)
      = public.current_user_operation_id()
  );
