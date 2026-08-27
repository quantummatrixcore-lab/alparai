-- Migration for LB-4: Public Statements
-- Subsumes LB-5 by exposing the response types differently

ALTER TABLE ai_provider_responses
  ADD COLUMN response_type text not null default 'official_reply' CHECK (response_type IN ('official_reply', 'public_statement')),
  ALTER COLUMN responder_email DROP NOT NULL,
  ADD CONSTRAINT responder_email_required_for_official_reply CHECK (
    (response_type = 'official_reply' AND responder_email IS NOT NULL) OR
    (response_type = 'public_statement')
  ),
  ADD COLUMN source_url text,
  ADD CONSTRAINT source_url_required_for_public_statement CHECK (
    (response_type = 'public_statement' AND source_url IS NOT NULL) OR
    (response_type = 'official_reply')
  ),
  ADD COLUMN statement_date date,
  ADD COLUMN verified_by uuid REFERENCES auth.users(id);

-- Note: The existing RLS policy "Moderators can manage responses" allows moderators to INSERT/UPDATE/DELETE any row.
-- We want to ensure that public_statement rows can ONLY be inserted by moderators.
-- Since the existing "Moderators can manage responses" is the ONLY insert policy, we just need to ensure
-- we don't accidentally let vendors (if they had a policy) insert public statements.
-- Wait, vendors insert responses via the token flow in `provider-response.ts`, which uses service role!
-- The `src/actions/provider-response.ts` bypasses RLS using the admin client because it validates the token.
-- Let's make sure the token flow forces `response_type = 'official_reply'`.

DROP VIEW IF EXISTS provider_leaderboard;
CREATE OR REPLACE VIEW provider_leaderboard AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.logo_url,
  p.is_verified,
  p.website_url,
  p.is_verified_respondent,
  COALESCE(count(DISTINCT i.id), 0) AS incident_count,
  COALESCE(count(DISTINCT r_off.id), 0) AS official_response_count,
  COALESCE(count(DISTINCT r_pub.id), 0) AS public_statement_count,
  CASE
    WHEN count(DISTINCT i.id) > 0 THEN round((count(DISTINCT r_off.id)::numeric / count(DISTINCT i.id)::numeric) * 100, 2)
    ELSE 0
  END AS response_rate,
  CASE
    WHEN count(DISTINCT i.id) > 0 THEN round(((count(DISTINCT r_off.id) + count(DISTINCT r_pub.id))::numeric / count(DISTINCT i.id)::numeric) * 100, 2)
    ELSE 0
  END AS disclosure_rate
FROM public.ai_providers p
LEFT JOIN public.incidents i ON i.ai_provider_id = p.id AND i.status = 'published'
LEFT JOIN public.ai_provider_responses r_off ON r_off.ai_provider_id = p.id AND r_off.incident_id = i.id AND r_off.is_published = true AND r_off.response_type = 'official_reply'
LEFT JOIN public.ai_provider_responses r_pub ON r_pub.ai_provider_id = p.id AND r_pub.incident_id = i.id AND r_pub.is_published = true AND r_pub.response_type = 'public_statement'
WHERE
  p.slug <> 'alpar-autopilot'
GROUP BY
  p.id, p.slug, p.name, p.logo_url, p.is_verified, p.website_url, p.is_verified_respondent;


-- ROLLBACK:
-- -- Add rollback statements here
