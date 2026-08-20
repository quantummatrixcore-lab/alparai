-- FUND-1: Add tracking columns to grant_applications
ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS date_applied date,
  ADD COLUMN IF NOT EXISTS amount_requested text,
  ADD COLUMN IF NOT EXISTS decision text,
  ADD COLUMN IF NOT EXISTS date_decided date,
  ADD COLUMN IF NOT EXISTS expiry_date date;

-- ROLLBACK:
-- ALTER TABLE public.grant_applications
--   DROP COLUMN IF EXISTS date_applied,
--   DROP COLUMN IF EXISTS amount_requested,
--   DROP COLUMN IF EXISTS decision,
--   DROP COLUMN IF EXISTS date_decided,
--   DROP COLUMN IF EXISTS expiry_date;
