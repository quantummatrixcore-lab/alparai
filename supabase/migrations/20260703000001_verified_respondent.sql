-- ============================================================================
-- 20260703000001_verified_respondent.sql
-- Add Verified Respondent fields to ai_providers and update leaderboard view.
-- ============================================================================

-- 1) Add columns to ai_providers table
ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS is_verified_respondent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_respondent_at timestamptz,
  ADD COLUMN IF NOT EXISTS respondent_contact_email text,
  ADD COLUMN IF NOT EXISTS respondent_verified_by uuid REFERENCES auth.users(id);

-- 2) Recreate provider_leaderboard view to include is_verified_respondent
DROP VIEW IF EXISTS public.provider_leaderboard CASCADE;

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
  p.is_verified_respondent,
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
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.trust_score, p.is_verified_respondent;
