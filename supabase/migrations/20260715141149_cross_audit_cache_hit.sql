-- Migration: Add cache_hit column to cross_audit_runs for Redis caching telemetry.

ALTER TABLE public.cross_audit_runs
  ADD COLUMN IF NOT EXISTS cache_hit BOOLEAN NOT NULL DEFAULT false;

-- ROLLBACK:
-- ALTER TABLE public.cross_audit_runs DROP COLUMN IF EXISTS cache_hit;
