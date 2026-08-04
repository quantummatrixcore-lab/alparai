-- Migration: Create ai_routing_chains table for dynamic capability-based routing
-- Target: Item #29 (Free-Tier Discovery Engine & Orchestrator)

CREATE TABLE IF NOT EXISTS public.ai_routing_chains (
  domain_name TEXT PRIMARY KEY,
  models JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enforcement
ALTER TABLE public.ai_routing_chains ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "ai_routing_chains_read_all"
  ON public.ai_routing_chains
  FOR SELECT
  USING (true);

CREATE POLICY "ai_routing_chains_admin_all"
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
