-- 001_create_operations.sql
-- The top-level tenant. Every other row is scoped by operation_id.

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
