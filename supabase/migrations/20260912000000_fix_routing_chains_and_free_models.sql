-- Migration: 20260912000000_fix_routing_chains_and_free_models.sql
-- Purpose: make the free-tier routing chains reference models that actually exist,
-- and correct a column mismatch that made the previous seed unrunnable.
--
-- Two defects are addressed.
--
-- 1. Column mismatch. 20260911000000_vendor_quotas.sql inserts into
--    ai_free_models (model_id, provider, status). The table declared in
--    20260823000000_ai_free_models.sql has neither a model_id nor a status
--    column -- its columns are (id, name, provider, context_length,
--    pricing_prompt, pricing_completion, is_active, last_checked_at,
--    created_at). That INSERT therefore fails on a clean migration run, so the
--    rows it claims to seed were never guaranteed to exist.
--
-- 2. Dangling routing references. The same file seeds ai_routing_chains with 11
--    distinct model ids, only 3 of which exist in model-router.ts's escalation
--    tiers. Two chains (creative_copy, fast_triage) referenced no reachable
--    model at all. The router does not drop unknown ids, so a broken id was
--    returned as valid and failed later at gateway call time.
--
-- The authoritative free tier is getEscalationFreeTier() in
-- src/lib/audit/model-router.ts. Every id below is drawn from it, and
-- scripts/check-model-routing-consistency.mjs enforces that in CI from now on.

-- 1. Re-seed ai_free_models against the real schema.
INSERT INTO public.ai_free_models (id, name, provider, context_length, is_active)
VALUES
  ('opencode/deepseek-v4-flash-free', 'DeepSeek V4 Flash (free)', 'openrouter', 4096, TRUE),
  ('opencode/nemotron-3-ultra-free', 'Nemotron 3 Ultra (free)', 'openrouter', 4096, TRUE),
  ('gemini-2.0-flash', 'Gemini 2.0 Flash', 'google', 8192, TRUE),
  ('meta-llama/Llama-3.3-70B-Instruct', 'Llama 3.3 70B Instruct', 'huggingface', 8192, TRUE)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      provider = EXCLUDED.provider,
      context_length = EXCLUDED.context_length,
      is_active = TRUE,
      last_checked_at = NOW();

-- 2. Realign every routing chain onto reachable models.
INSERT INTO public.ai_routing_chains (domain_name, models)
VALUES
  ('math_logic', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 8192}]'::jsonb),
  ('creative_copy', '[{"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 8192}, {"id": "meta-llama/Llama-3.3-70B-Instruct", "provider": "huggingface", "tier": "free", "maxTokens": 8192}]'::jsonb),
  ('risk_audit', '[{"id": "opencode/nemotron-3-ultra-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "meta-llama/Llama-3.3-70B-Instruct", "provider": "huggingface", "tier": "free", "maxTokens": 8192}]'::jsonb),
  ('fast_triage', '[{"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 8192}, {"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('code_generation', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "opencode/nemotron-3-ultra-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('ethics_audit', '[{"id": "meta-llama/Llama-3.3-70B-Instruct", "provider": "huggingface", "tier": "free", "maxTokens": 8192}, {"id": "opencode/nemotron-3-ultra-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}]'::jsonb)
ON CONFLICT (domain_name) DO UPDATE
  SET models = EXCLUDED.models, updated_at = NOW();

-- ROLLBACK:
-- The previous chain values are in 20260911000000_vendor_quotas.sql; re-running
-- that file's ai_routing_chains INSERT restores them. Note that doing so
-- reinstates the 8 dangling references this migration exists to remove, and
-- will fail scripts/check-model-routing-consistency.mjs in CI.
