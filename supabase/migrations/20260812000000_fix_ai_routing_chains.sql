-- Migration: Fix ai_routing_chains mismatch with active code
-- Target: Synchronize dynamic capability routes with the 2026 validated free tier gateway list

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ai_routing_chains' AND policyname = 'ai_routing_chains_read_all'
    ) THEN
        CREATE POLICY "ai_routing_chains_read_all"
          ON public.ai_routing_chains FOR SELECT USING (true);
    END IF;
END $$;

INSERT INTO public.ai_routing_chains (domain_name, models)
VALUES
  ('math_logic', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('creative_copy', '[{"id": "meta-llama/Llama-3.3-70B-Instruct", "provider": "huggingface", "tier": "free", "maxTokens": 4096}, {"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('risk_audit', '[{"id": "opencode/nemotron-3-ultra-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "gemini-2.0-pro", "provider": "google", "tier": "premium", "maxTokens": 4096}]'::jsonb),
  ('fast_triage', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('code_generation', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "gemini-2.0-flash", "provider": "google", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('ethics_audit', '[{"id": "meta-llama/Llama-3.3-70B-Instruct", "provider": "huggingface", "tier": "free", "maxTokens": 4096}, {"id": "opencode/nemotron-3-ultra-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}]'::jsonb)
ON CONFLICT (domain_name) DO UPDATE 
  SET models = EXCLUDED.models, updated_at = NOW();

-- ROLLBACK:
-- DELETE FROM public.ai_routing_chains WHERE domain_name IN ('math_logic', 'creative_copy', 'risk_audit', 'fast_triage', 'code_generation', 'ethics_audit');
