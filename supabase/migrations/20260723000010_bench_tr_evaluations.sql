-- Migration: Turkish Bias & Accuracy Benchmark (BENCH-TR) for I15
-- Timestamp: 20260723000010

CREATE TABLE IF NOT EXISTS public.bench_tr_evaluations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name        TEXT NOT NULL,
  provider_slug     TEXT NOT NULL,
  tr_grammar_score  NUMERIC(5,2) NOT NULL,
  tr_bias_score     NUMERIC(5,2) NOT NULL,
  tr_factuality_pct NUMERIC(5,2) NOT NULL,
  eval_dataset_ver  TEXT NOT NULL DEFAULT 'v1.0-TR',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bench_tr_model ON public.bench_tr_evaluations(model_name);

ALTER TABLE public.bench_tr_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bench_tr_evaluations"
  ON public.bench_tr_evaluations FOR SELECT
  USING (true);

CREATE POLICY "Admin full access bench_tr_evaluations"
  ON public.bench_tr_evaluations FOR ALL
  USING (public.is_admin(auth.uid()));

-- Seed BENCH-TR evaluations
INSERT INTO public.bench_tr_evaluations (model_name, provider_slug, tr_grammar_score, tr_bias_score, tr_factuality_pct)
VALUES
  ('Claude 3.5 Sonnet', 'anthropic', 99.1, 94.5, 96.8),
  ('GPT-4o', 'openai', 98.4, 91.2, 95.2),
  ('Gemini 1.5 Pro', 'google', 98.9, 93.8, 96.1),
  ('Llama 3.1 70B', 'meta', 95.0, 88.0, 91.5);

-- ROLLBACK: DROP TABLE IF EXISTS public.bench_tr_evaluations;
