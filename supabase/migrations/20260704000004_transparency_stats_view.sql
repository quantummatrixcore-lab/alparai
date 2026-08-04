-- Migration: Create transparency_stats view (2026-07-04)

CREATE OR REPLACE VIEW public.transparency_stats
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
