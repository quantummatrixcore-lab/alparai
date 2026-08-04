-- Add audit_tier column for K3/K4 verification
-- ROLLBACK: ALTER TABLE public.incidents DROP COLUMN IF EXISTS audit_tier;

ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS audit_tier text CHECK (audit_tier IN ('basic', 'deep', 'none')) DEFAULT 'basic';
