-- ============================================================================
-- 20260820120000_remove_fake_models.sql
-- Removes fabricated AI models and neutralizes their incidents
-- ============================================================================

BEGIN;

-- Delete fabricated incidents explicitly.
DELETE FROM public.incidents 
WHERE title ILIKE '%Claude Code Opus 4.7%' 
   OR description ILIKE '%Claude Code Opus 4.7%';

-- Delete any responses linked to those incidents.
-- (This happens automatically via CASCADE if FKs are set up, but let's be safe).

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
