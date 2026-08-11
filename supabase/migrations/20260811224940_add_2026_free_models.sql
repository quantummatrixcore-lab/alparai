-- Migration: Add 2026 free-tier models to ai_free_models
-- Target: Free-Tier Discovery Engine

INSERT INTO public.ai_free_models (id, name, provider, context_length, pricing_prompt, pricing_completion, is_active)
VALUES
  ('gemini-2.0-flash-lite', 'Gemini 2.0 Flash Lite', 'google', 1048576, 0, 0, true),
  ('deepseek-v4-flash', 'DeepSeek v4 Flash', 'deepseek', 128000, 0, 0, true),
  ('llama-3.3-70b', 'Llama 3.3', 'meta', 128000, 0, 0, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provider = EXCLUDED.provider,
  context_length = EXCLUDED.context_length,
  is_active = EXCLUDED.is_active,
  last_checked_at = NOW();

-- ROLLBACK:
-- DELETE FROM public.ai_free_models WHERE id IN ('gemini-2.0-flash-lite', 'deepseek-v4-flash', 'llama-3.3-70b');
