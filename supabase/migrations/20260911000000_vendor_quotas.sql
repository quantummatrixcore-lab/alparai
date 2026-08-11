-- Migration: 20260911000000_vendor_quotas.sql
-- Description: Expand vendor_quotas seed data (~30 providers) and populate ai_routing_chains and ai_free_models.

-- 1. Ensure vendor_quotas table exists with correct schema
CREATE TABLE IF NOT EXISTS public.vendor_quotas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor text NOT NULL,
    metric text NOT NULL,
    limit_value numeric,
    used_value numeric,
    unit text,
    period_start date,
    period_end date,
    plan_name text,
    source varchar NOT NULL CHECK (source IN ('api', 'manual')),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS for vendor_quotas if not enabled
ALTER TABLE public.vendor_quotas ENABLE ROW LEVEL SECURITY;

-- Select/Manage policy for vendor_quotas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'vendor_quotas' AND policyname = 'Admins and moderators can manage vendor_quotas'
    ) THEN
        CREATE POLICY "Admins and moderators can manage vendor_quotas"
        ON public.vendor_quotas FOR ALL TO authenticated
        USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
        WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
    END IF;
END $$;

-- 2. Insert ~30 vendor quota entries
INSERT INTO public.vendor_quotas 
    (vendor, metric, limit_value, used_value, unit, period_start, period_end, plan_name, source)
VALUES 
    ('github_actions', 'minutes', NULL, 120, 'minutes', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('vercel', 'bandwidth_gb', NULL, 15, 'GB', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('supabase', 'db_size_gb', NULL, 1.5, 'GB', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('claude_pro', 'messages', NULL, 450, 'messages', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('resend', 'emails', NULL, 1500, 'emails', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('upstash', 'requests', NULL, 50000, 'requests', '2026-08-01', '2026-08-31', 'Pay-as-you-go', 'manual'),
    ('google_ultra', 'tokens', NULL, 1000000, 'tokens', '2026-08-01', '2026-08-31', 'Ultra', 'manual'),
    ('openrouter', 'usd_credits', NULL, 50, 'USD', '2026-08-01', '2026-08-31', 'Pay-as-you-go', 'manual'),
    ('nvidia_nim', 'requests', NULL, 10000, 'requests', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('huggingface', 'inference_calls', NULL, 30000, 'calls', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('cohere', 'api_calls', NULL, 10000, 'calls', '2026-08-01', '2026-08-31', 'Trial', 'manual'),
    ('blackbox', 'queries', NULL, 5000, 'queries', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('jules', 'task_runs', NULL, 200, 'runs', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('sentry', 'events', NULL, 5000, 'events', '2026-08-01', '2026-08-31', 'Developer', 'manual'),
    ('posthog', 'events', NULL, 1000000, 'events', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('stripe', 'transactions', NULL, 0, 'transactions', '2026-08-01', '2026-08-31', 'Standard', 'manual'),
    ('cloudflare', 'requests', NULL, 100000, 'requests', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('plausible', 'pageviews', NULL, 10000, 'views', '2026-08-01', '2026-08-31', 'Starter', 'manual'),
    ('openai', 'tokens', NULL, 500000, 'tokens', '2026-08-01', '2026-08-31', 'Pay-as-you-go', 'manual'),
    ('vertex_ai', 'requests', NULL, 20000, 'requests', '2026-08-01', '2026-08-31', 'Pay-as-you-go', 'manual'),
    ('deepseek', 'tokens', NULL, 2000000, 'tokens', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('meta_llama', 'tokens', NULL, 1500000, 'tokens', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('mistral_ai', 'tokens', NULL, 800000, 'tokens', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('groq', 'tokens', NULL, 5000000, 'tokens', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('replicate', 'predictions', NULL, 1000, 'runs', '2026-08-01', '2026-08-31', 'Pay-as-you-go', 'manual'),
    ('claude_code', 'tokens', NULL, 100000, 'tokens', '2026-08-01', '2026-08-31', 'Pro', 'manual'),
    ('opencode', 'runs', NULL, 500, 'runs', '2026-08-01', '2026-08-31', 'Free Tier', 'manual'),
    ('antigravity', 'sessions', NULL, 100, 'sessions', '2026-08-01', '2026-08-31', 'Lab', 'manual'),
    ('datadog', 'metrics', NULL, 1000, 'metrics', '2026-08-01', '2026-08-31', 'Free', 'manual'),
    ('aws_s3', 'storage_gb', NULL, 5, 'GB', '2026-08-01', '2026-08-31', 'Free Tier', 'manual');

-- 3. Ensure ai_routing_chains exists and seed domain routes
CREATE TABLE IF NOT EXISTS public.ai_routing_chains (
  domain_name TEXT PRIMARY KEY,
  models JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_routing_chains ENABLE ROW LEVEL SECURITY;

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
  ('math_logic', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "deepseek/deepseek-r1-0528:free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('creative_copy', '[{"id": "google/gemma-3-27b-it:free", "provider": "google", "tier": "free", "maxTokens": 4096}, {"id": "meta-llama/llama-4-maverick:free", "provider": "meta", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('risk_audit', '[{"id": "opencode/nemotron-3-ultra-free", "provider": "nvidia", "tier": "free", "maxTokens": 4096}, {"id": "microsoft/phi-4:free", "provider": "microsoft", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('fast_triage', '[{"id": "gemini-1.5-flash", "provider": "google", "tier": "free", "maxTokens": 4096}, {"id": "blackboxai", "provider": "blackbox", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('code_generation', '[{"id": "opencode/deepseek-v4-flash-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}, {"id": "opencode/north-mini-code-free", "provider": "openrouter", "tier": "free", "maxTokens": 4096}]'::jsonb),
  ('ethics_audit', '[{"id": "meta-llama/Llama-3.3-70B-Instruct", "provider": "huggingface", "tier": "free", "maxTokens": 4096}, {"id": "cohere/command-r", "provider": "cohere", "tier": "free", "maxTokens": 4096}]'::jsonb)
ON CONFLICT (domain_name) DO UPDATE 
  SET models = EXCLUDED.models, updated_at = NOW();

-- 4. Seed initial data for ai_free_models if missing
INSERT INTO public.ai_free_models (model_id, provider, status)
VALUES 
  ('opencode/deepseek-v4-flash-free', 'deepseek', 'operational'),
  ('nemotron-ultra-free', 'nvidia', 'operational'),
  ('google/gemma-3-27b-it:free', 'google', 'operational'),
  ('meta-llama/llama-4-maverick:free', 'meta', 'operational'),
  ('microsoft/phi-4:free', 'microsoft', 'operational')
ON CONFLICT (model_id) DO NOTHING;

-- ROLLBACK:
-- DELETE FROM public.vendor_quotas WHERE vendor IN ('github_actions', 'vercel', 'supabase', 'claude_pro', 'resend', 'upstash', 'google_ultra', 'openrouter', 'nvidia_nim', 'huggingface', 'cohere', 'blackbox', 'jules', 'sentry', 'posthog', 'stripe', 'cloudflare', 'plausible', 'openai', 'vertex_ai', 'deepseek', 'meta_llama', 'mistral_ai', 'groq', 'replicate', 'claude_code', 'opencode', 'antigravity', 'datadog', 'aws_s3');
-- DELETE FROM public.ai_routing_chains WHERE domain_name IN ('math_logic', 'creative_copy', 'risk_audit', 'fast_triage', 'code_generation', 'ethics_audit');
-- DELETE FROM public.ai_free_models WHERE model_id IN ('opencode/deepseek-v4-flash-free', 'nemotron-ultra-free', 'google/gemma-3-27b-it:free', 'meta-llama/llama-4-maverick:free', 'microsoft/phi-4:free');
