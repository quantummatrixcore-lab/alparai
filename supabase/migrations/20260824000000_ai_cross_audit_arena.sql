-- Migration: Stealth Cross-Audit Arena & Dynamic Routing Chains
-- Target: Item #30 (Proposal 024)

CREATE TABLE IF NOT EXISTS public.ai_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  trust_score NUMERIC DEFAULT 85.0,
  hallucination_rate NUMERIC DEFAULT 0.05,
  ethical_compliance NUMERIC DEFAULT 90.0,
  total_audits INTEGER DEFAULT 0,
  last_audited_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_routing_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_domain TEXT NOT NULL UNIQUE,
  primary_model_id TEXT NOT NULL,
  secondary_model_id TEXT NOT NULL,
  tertiary_model_id TEXT NOT NULL,
  judge_model_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enforcement
ALTER TABLE public.ai_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_routing_chains ENABLE ROW LEVEL SECURITY;

-- Admin Only Policies
CREATE POLICY "ai_trust_scores_admin_policy"
  ON public.ai_trust_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

CREATE POLICY "ai_routing_chains_admin_policy"
  ON public.ai_routing_chains
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.ai_routing_chains;
-- DROP TABLE IF EXISTS public.ai_trust_scores;
