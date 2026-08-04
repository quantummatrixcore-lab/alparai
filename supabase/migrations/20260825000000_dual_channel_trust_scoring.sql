-- Migration: 20260825000000_dual_channel_trust_scoring.sql
-- Description: Dual-channel trust scoring tables (ai_scoring_config, ai_trust_ledger)

CREATE TABLE IF NOT EXISTS public.ai_scoring_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  w_audit NUMERIC(3, 2) NOT NULL DEFAULT 0.50,
  w_incident NUMERIC(3, 2) NOT NULL DEFAULT 0.50,
  is_combined_active BOOLEAN NOT NULL DEFAULT false,
  min_audits_threshold INT NOT NULL DEFAULT 30,
  min_incidents_threshold INT NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_scoring_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read access to ai_scoring_config"
  ON public.ai_scoring_config FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin write access to ai_scoring_config"
  ON public.ai_scoring_config FOR ALL
  USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.ai_trust_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT NOT NULL,
  audit_score NUMERIC(5, 2) NOT NULL,
  incident_score NUMERIC(5, 2) NOT NULL,
  combined_score NUMERIC(5, 2) NOT NULL,
  hash_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_trust_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read access to ai_trust_ledger"
  ON public.ai_trust_ledger FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin write access to ai_trust_ledger"
  ON public.ai_trust_ledger FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.ai_trust_ledger;
-- DROP TABLE IF EXISTS public.ai_scoring_config;
