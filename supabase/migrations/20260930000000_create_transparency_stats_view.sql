-- Migration: Create transparency_stats_view
-- Description: Creates transparency_stats_view (and ensures transparency_stats compatibility) with security_invoker for public platform transparency metrics.

CREATE OR REPLACE VIEW public.transparency_stats_view
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'published') AS total_incidents,
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'published' AND created_at > now() - interval '7 days') AS verified_this_week,
  COALESCE(
    ROUND(
      (SELECT COUNT(DISTINCT incident_id) FROM public.ai_provider_responses WHERE is_published = true)::numeric /
      NULLIF((SELECT COUNT(*) FROM public.incidents WHERE status = 'published'), 0) * 100,
      1
    ),
    0
  ) AS provider_response_rate;

-- Also ensure transparency_stats is synced for backwards compatibility
CREATE OR REPLACE VIEW public.transparency_stats
WITH (security_invoker = true) AS
SELECT * FROM public.transparency_stats_view;

-- Grant permissions to public roles
GRANT SELECT ON public.transparency_stats_view TO anon, authenticated, service_role;
GRANT SELECT ON public.transparency_stats TO anon, authenticated, service_role;

-- ROLLBACK:
-- DROP VIEW IF EXISTS public.transparency_stats CASCADE;
-- DROP VIEW IF EXISTS public.transparency_stats_view CASCADE;
