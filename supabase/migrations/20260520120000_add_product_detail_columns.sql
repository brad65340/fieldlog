-- 009_add_product_detail_columns.sql
-- Phase 5.1 -- adds product knowledge-base columns consumed by /contractor/products
-- and the dashboard product quick-reference card. All nullable, idempotent.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS signal_word        TEXT,
  ADD COLUMN IF NOT EXISTS epa_label_url      TEXT,
  ADD COLUMN IF NOT EXISTS sds_url            TEXT,
  ADD COLUMN IF NOT EXISTS use_classification TEXT,
  ADD COLUMN IF NOT EXISTS application_method TEXT,
  ADD COLUMN IF NOT EXISTS target_pests       TEXT[],
  ADD COLUMN IF NOT EXISTS compatible_crops   TEXT[];
