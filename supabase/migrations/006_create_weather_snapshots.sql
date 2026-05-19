-- 006_create_weather_snapshots.sql
-- One-to-one with applications. UNIQUE(application_id) enforces it at the DB.
-- INSERT happens via service role only (ADR-002). No user-facing INSERT policy.

CREATE TABLE weather_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  wind_speed      DECIMAL(5,2),
  wind_direction  INTEGER,
  temperature     DECIMAL(5,2),
  humidity        INTEGER,
  conditions      TEXT,
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL DEFAULT 'openweathermap'
);

ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;

-- Operation members can read weather snapshots for their operation's applications.
CREATE POLICY "operation_members_read_weather" ON weather_snapshots
  FOR SELECT USING (
    (SELECT operation_id FROM applications WHERE id = application_id)
    = (SELECT operation_id FROM profiles WHERE id = auth.uid())
  );

-- INSERT via service role only. No user-facing policy (ADR-002).
-- NO UPDATE policy -- snapshots are immutable.
-- NO DELETE policy -- snapshots are immutable.

CREATE INDEX idx_weather_application ON weather_snapshots(application_id);
