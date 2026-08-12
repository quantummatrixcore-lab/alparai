-- ============================================================================
-- 20260904000000_update_trust_score.sql
-- Update provider_leaderboard view to calculate dynamic trust_score based on incidents & responses
-- ============================================================================

DROP VIEW IF EXISTS public.provider_leaderboard CASCADE;

CREATE OR REPLACE VIEW public.provider_leaderboard
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  GREATEST(0, LEAST(100, 100 - (coalesce(count(distinct i.id), 0) * 2) + (coalesce(count(distinct r.id), 0) * 5)))::integer AS trust_score,
  p.is_verified_respondent,
  coalesce(count(distinct i.id), 0) AS incident_count,
  coalesce(count(distinct r.id), 0) AS response_count,
  CASE
    WHEN count(distinct i.id) > 0 THEN round((count(distinct r.id)::numeric / count(distinct i.id)::numeric) * 100, 2)
    ELSE 0
  END AS response_rate
FROM
  public.ai_providers p
LEFT JOIN
  public.incidents i ON i.ai_provider_id = p.id AND i.status = 'published'
LEFT JOIN
  public.ai_provider_responses r ON r.ai_provider_id = p.id AND r.is_published = true
WHERE
  p.slug <> 'alpar-autopilot'
GROUP BY
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.is_verified_respondent;

GRANT SELECT ON public.provider_leaderboard TO anon, authenticated, service_role;

-- ROLLBACK:
-- DROP VIEW IF EXISTS public.provider_leaderboard CASCADE;
-- CREATE OR REPLACE VIEW public.provider_leaderboard WITH (security_invoker = true) AS
-- SELECT p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score, p.is_verified_respondent, coalesce(count(distinct i.id), 0) AS incident_count, coalesce(count(distinct r.id), 0) AS response_count, CASE WHEN count(distinct i.id) > 0 THEN round((count(distinct r.id)::numeric / count(distinct i.id)::numeric) * 100, 2) ELSE 0 END AS response_rate FROM public.ai_providers p LEFT JOIN public.incidents i ON i.ai_provider_id = p.id AND i.status = 'published' LEFT JOIN public.ai_provider_responses r ON r.ai_provider_id = p.id AND r.is_published = true WHERE p.slug <> 'alpar-autopilot' GROUP BY p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score, p.is_verified_respondent;
