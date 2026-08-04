-- Migration: Create ai_free_models table for dynamic free-tier model discovery
-- Target: Item #29 (Free-Tier Discovery Engine)

CREATE TABLE IF NOT EXISTS public.ai_free_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  context_length INTEGER DEFAULT 0,
  pricing_prompt NUMERIC DEFAULT 0,
  pricing_completion NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enforcement
ALTER TABLE public.ai_free_models ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "ai_free_models_read_all"
  ON public.ai_free_models
  FOR SELECT
  USING (true);

CREATE POLICY "ai_free_models_admin_all"
  ON public.ai_free_models
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.ai_free_models;
