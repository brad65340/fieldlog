-- Base-case fix for profiles SELECT RLS.
--
-- The existing `users_read_own_operation_profiles` policy is recursive:
--   FOR SELECT USING (operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid()))
-- The subquery is itself a SELECT on profiles subject to the same policy, with
-- no base case. A freshly-signed-in user cannot read any row of profiles -- not
-- even their own -- which broke /login at the profile lookup step.
--
-- Postgres OR's policies for the same command. Adding a non-recursive base case
-- gives the existing policy something resolvable to subquery against:
--   - own row    : matches via auth.uid() = id (this policy)
--   - coworkers  : matches via the existing operation_id policy, whose subquery
--                  against profiles now succeeds via this policy
--
-- Knock-on: policies on fields, applications, and weather_snapshots all subquery
-- profiles to look up the caller's operation_id. Those subqueries were failing
-- silently in the same way; they start working once this base case exists.

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
