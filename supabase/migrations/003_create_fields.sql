-- 003_create_fields.sql
-- Physical field/plot within an operation. Manager-managed.

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
