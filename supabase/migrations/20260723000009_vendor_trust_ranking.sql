-- Migration: AI Vendor Public Trust Ranking for I14
-- Timestamp: 20260723000009

CREATE TABLE IF NOT EXISTS public.vendor_trust_rankings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_slug       TEXT UNIQUE NOT NULL,
  provider_name       TEXT NOT NULL,
  composite_score     NUMERIC(5,2) NOT NULL DEFAULT 95.00,
  incident_penalty    NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  response_rate_bonus NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  ranking_tier        TEXT NOT NULL CHECK (ranking_tier IN ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC')),
  last_evaluated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_trust_score ON public.vendor_trust_rankings(composite_score DESC);

ALTER TABLE public.vendor_trust_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read vendor_trust_rankings"
  ON public.vendor_trust_rankings FOR SELECT
  USING (true);

CREATE POLICY "Admin full access vendor_trust_rankings"
  ON public.vendor_trust_rankings FOR ALL
  USING (public.is_admin(auth.uid()));

-- Seed initial vendor trust rankings
INSERT INTO public.vendor_trust_rankings (provider_slug, provider_name, composite_score, incident_penalty, response_rate_bonus, ranking_tier)
VALUES
  ('anthropic', 'Anthropic', 98.50, 1.00, 4.50, 'AAA'),
  ('google', 'Google', 97.20, 2.10, 4.30, 'AAA'),
  ('openai', 'OpenAI', 94.80, 4.50, 4.30, 'AA'),
  ('meta', 'Meta', 91.50, 6.00, 2.50, 'AA'),
  ('mistral', 'Mistral AI', 93.00, 3.20, 3.20, 'AA')
ON CONFLICT (provider_slug) DO UPDATE SET
  composite_score = EXCLUDED.composite_score,
  last_evaluated_at = NOW();

-- ROLLBACK: DROP TABLE IF EXISTS public.vendor_trust_rankings;
