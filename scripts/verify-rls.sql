-- Phase 1 RLS verification. Re-runnable.
-- Paste into Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Returns one row per public-schema FieldLog table with RLS status, policy list,
-- and an automatic pass/fail check for the load-bearing invariants:
--   - all 6 tables must have RLS enabled
--   - applications must have NO UPDATE or DELETE policy (ADR-001)
--   - weather_snapshots must have NO INSERT policy (ADR-002 -- service role only)

WITH rls AS (
  SELECT tablename, rowsecurity AS rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('operations','profiles','fields','products','applications','weather_snapshots')
),
pols AS (
  SELECT
    tablename,
    string_agg(policyname || ' [' || cmd || ']', ', ' ORDER BY cmd, policyname) AS policies,
    bool_or(cmd = 'UPDATE') AS has_update,
    bool_or(cmd = 'DELETE') AS has_delete,
    bool_or(cmd = 'INSERT') AS has_insert
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('operations','profiles','fields','products','applications','weather_snapshots')
  GROUP BY tablename
)
SELECT
  r.tablename,
  r.rls_enabled,
  COALESCE(p.policies, '(no policies)') AS policies,
  CASE
    WHEN r.tablename = 'applications' AND (p.has_update OR p.has_delete)
      THEN '*** FAIL: applications has UPDATE/DELETE policy (must be empty) ***'
    WHEN r.tablename = 'weather_snapshots' AND p.has_insert
      THEN '*** FAIL: weather_snapshots has INSERT policy (service role only, must be empty) ***'
    WHEN NOT r.rls_enabled
      THEN '*** FAIL: RLS not enabled ***'
    ELSE 'ok'
  END AS check_result
FROM rls r
LEFT JOIN pols p USING (tablename)
ORDER BY r.tablename;
