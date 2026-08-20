-- ============================================================================
-- 20260820120000_remove_fake_models.sql
-- Removes fabricated AI models and neutralizes their incidents
-- ============================================================================

BEGIN;

-- Delete dependent responses explicitly for the fake incidents
DELETE FROM public.ai_provider_responses
WHERE incident_id IN (
  'a0000021-0000-4000-8000-000000000021',
  'a0000028-0000-4000-8000-000000000028'
);

-- Delete fabricated incidents explicitly.
DELETE FROM public.incidents 
WHERE id IN (
  'a0000021-0000-4000-8000-000000000021',
  'a0000028-0000-4000-8000-000000000028'
)
AND COALESCE(incident_source, '') != 'user_submitted';

-- Delete fabricated models
DELETE FROM public.ai_models
WHERE name IN (
  'Claude 3.5 Opus',
  'Claude 4.5 Opus',
  'Claude 4.6 Sonnet',
  'Claude 4.7 Opus',
  'Claude 4.8 Opus',
  'Claude 4.8 Sonnet'
);

COMMIT;
