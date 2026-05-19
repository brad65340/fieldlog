-- 004_create_products.sql
-- Pesticide product catalog. Public read; no API writes (seeded via service role).

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

-- No INSERT/UPDATE/DELETE policy -- seeded via service role only.
