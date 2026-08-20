-- ============================================================================
-- Enforce moderator-only inserts for public_statement via RLS
-- ============================================================================

BEGIN;

CREATE POLICY "Public statements restricted to moderators"
  ON public.ai_provider_responses
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (
    response_type = 'official_reply' OR public.is_moderator(auth.uid())
  );

COMMIT;
