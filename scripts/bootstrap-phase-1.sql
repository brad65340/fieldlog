-- Phase 1 bootstrap: 1 operation + 2 profiles (manager + contractor).
-- One-shot, idempotent. Safe to re-run.
--
-- PREREQUISITE:
-- Create both auth users first in Supabase Dashboard -> Authentication -> Users:
--   manager@test.com    (any password, check "Auto Confirm User")
--   contractor@test.com (any password, check "Auto Confirm User")
-- Note the passwords -- you'll use them at /login.
--
-- THEN: paste this entire file into Dashboard -> SQL Editor -> New query -> Run.
--
-- This SQL is NOT a tracked migration. It is one-time seed for Phase 1 testing.
-- Phase 5 has the full demo seed (scripts/seed.ts). This file can be deleted
-- after Phase 5 seed runs successfully.

DO $$
DECLARE
  manager_uuid    uuid;
  contractor_uuid uuid;
  op_uuid         uuid;
BEGIN
  SELECT id INTO manager_uuid FROM auth.users WHERE email = 'manager@test.com';
  IF manager_uuid IS NULL THEN
    RAISE EXCEPTION
      'auth.users has no row for manager@test.com. Create it in Dashboard -> Authentication -> Users (check Auto Confirm User), then re-run this script.';
  END IF;

  SELECT id INTO contractor_uuid FROM auth.users WHERE email = 'contractor@test.com';
  IF contractor_uuid IS NULL THEN
    RAISE EXCEPTION
      'auth.users has no row for contractor@test.com. Create it in Dashboard -> Authentication -> Users (check Auto Confirm User), then re-run this script.';
  END IF;

  SELECT id INTO op_uuid
    FROM operations
    WHERE owner_id = manager_uuid AND name = 'Test Operation'
    LIMIT 1;

  IF op_uuid IS NULL THEN
    INSERT INTO operations (name, owner_id)
      VALUES ('Test Operation', manager_uuid)
      RETURNING id INTO op_uuid;
  END IF;

  INSERT INTO profiles (id, operation_id, role, first_name, last_name, email)
    VALUES (manager_uuid, op_uuid, 'manager', 'Test', 'Manager', 'manager@test.com')
    ON CONFLICT (id) DO UPDATE
      SET operation_id = EXCLUDED.operation_id,
          role         = EXCLUDED.role,
          first_name   = EXCLUDED.first_name,
          last_name    = EXCLUDED.last_name,
          email        = EXCLUDED.email,
          updated_at   = NOW();

  INSERT INTO profiles (id, operation_id, role, first_name, last_name, email)
    VALUES (contractor_uuid, op_uuid, 'contractor', 'Test', 'Contractor', 'contractor@test.com')
    ON CONFLICT (id) DO UPDATE
      SET operation_id = EXCLUDED.operation_id,
          role         = EXCLUDED.role,
          first_name   = EXCLUDED.first_name,
          last_name    = EXCLUDED.last_name,
          email        = EXCLUDED.email,
          updated_at   = NOW();

  RAISE NOTICE 'Bootstrap complete.';
  RAISE NOTICE '  operation_id    = %', op_uuid;
  RAISE NOTICE '  manager id      = %', manager_uuid;
  RAISE NOTICE '  contractor id   = %', contractor_uuid;
END $$;

-- Result confirmation: both profiles linked to the test operation.
SELECT
  o.name                                  AS operation,
  p.email,
  p.role,
  p.first_name || ' ' || p.last_name      AS name,
  p.id                                    AS user_id
FROM profiles p
JOIN operations o ON o.id = p.operation_id
WHERE p.email IN ('manager@test.com', 'contractor@test.com')
ORDER BY p.role DESC;
