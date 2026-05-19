-- 005_create_applications.sql
-- IMMUTABLE after insert (ADR-001). Note: NO updated_at column.
-- NO UPDATE policy and NO DELETE policy -- the absence is load-bearing.

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

-- Contractors can INSERT only into their own operation, and only as themselves.
CREATE POLICY "contractors_insert_applications" ON applications
  FOR INSERT WITH CHECK (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
    AND contractor_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'contractor'
  );

-- All operation members (managers + contractors) can SELECT within their operation.
CREATE POLICY "operation_members_read_applications" ON applications
  FOR SELECT USING (
    operation_id = (SELECT operation_id FROM profiles WHERE id = auth.uid())
  );

-- NO UPDATE policy -- immutable after insert (ADR-001).
-- NO DELETE policy -- immutable after insert (ADR-001).

CREATE INDEX idx_applications_operation ON applications(operation_id, submitted_at DESC);
CREATE INDEX idx_applications_contractor ON applications(contractor_id);
CREATE INDEX idx_applications_field ON applications(field_id);
CREATE INDEX idx_applications_status ON applications(operation_id, compliance_status);
