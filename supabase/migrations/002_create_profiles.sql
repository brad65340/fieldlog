-- 002_create_profiles.sql
-- 1:1 extension of auth.users. role gates UI and API access.

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
