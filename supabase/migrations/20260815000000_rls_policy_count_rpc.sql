-- Migration: RLS Policy Count RPC
-- Exposes a SECURITY DEFINER function so the admin client can read pg_policies count
-- without requiring superuser access.

CREATE OR REPLACE FUNCTION public.get_rls_policy_count()
RETURNS integer AS $$
  SELECT COUNT(*)::integer FROM pg_policies WHERE schemaname = 'public';
$$ LANGUAGE sql SECURITY DEFINER;

-- ROLLBACK:
-- DROP FUNCTION IF EXISTS public.get_rls_policy_count();
