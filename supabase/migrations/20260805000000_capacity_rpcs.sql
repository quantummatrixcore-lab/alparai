-- Migration: Capacity RPCs
-- Description: RPC functions to query database size, storage size, and AI gateway costs safely.

CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS bigint AS $$
  SELECT pg_database_size(current_database());
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_storage_size()
RETURNS bigint AS $$
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint FROM storage.objects;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_ai_gateway_costs(time_interval interval)
RETURNS numeric AS $$
  SELECT COALESCE(SUM(cost_usd), 0.0)::numeric FROM public.cross_audit_runs WHERE created_at >= (now() - time_interval);
$$ LANGUAGE sql SECURITY DEFINER;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.get_database_size();
-- DROP FUNCTION IF EXISTS public.get_storage_size();
-- DROP FUNCTION IF EXISTS public.get_ai_gateway_costs(interval);
