-- PRODUCTION SEED\n-- ============================================================================
-- Neutralize 20260620000003_seed_2026_modern_models.sql
-- Removes the remaining fabricated future models so db reset stays clean
-- ============================================================================

BEGIN;

DELETE FROM public.ai_models
WHERE name IN (
  'GPT-5', 'GPT-5 mini', 'o4', 'o5',
  'Claude 4.5 Sonnet', 'Claude 4.5 Opus', 'Claude 4.6 Sonnet', 'Claude 4.7 Opus', 'Claude 4.8 Sonnet', 'Claude 4.8 Opus',
  'Gemini 3.0 Flash', 'Gemini 3.5 Pro', 'Gemini 3.5 Flash',
  'Llama 4.5 405B', 'Llama 4.5 70B', 'Llama 5 Scout',
  'Grok 4', 'Grok 4.5',
  'DeepSeek-V3', 'DeepSeek-V4',
  'Qwen 2.5', 'Qwen 3.0'
);

COMMIT;


-- ROLLBACK:
-- -- Add rollback statements here
