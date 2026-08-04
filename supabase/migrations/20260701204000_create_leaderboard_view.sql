-- ============================================================================
-- 20260701204000_create_leaderboard_view.sql
--
-- Creates the provider_leaderboard view with security_invoker enabled.
-- ============================================================================

create or replace view public.provider_leaderboard
with (security_invoker = true) as
select
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  p.trust_score,
  coalesce(count(distinct i.id), 0) as incident_count,
  coalesce(count(distinct r.id), 0) as response_count
from
  public.ai_providers p
left join
  public.incidents i on i.ai_provider_id = p.id and i.status = 'published'
left join
  public.ai_provider_responses r on r.ai_provider_id = p.id and r.is_published = true
where
  p.slug <> 'alpar-autopilot'
group by
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score;
