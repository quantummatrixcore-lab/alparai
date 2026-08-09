-- Migration: Create Question Bank for Automated Batch Benchmark Pipeline
-- Target: Convert 1113 passive incidents to active benchmark questions

CREATE TYPE public.question_bank_status AS ENUM ('draft', 'approved', 'active', 'retired');

CREATE TABLE IF NOT EXISTS public.k_benchmark_question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  test_prompt TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  status public.question_bank_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.k_benchmark_question_bank ENABLE ROW LEVEL SECURITY;

-- Policies for Question Bank (Admin only for write, public for read if we want leaderboards)
CREATE POLICY "k_benchmark_question_bank_read_all"
  ON public.k_benchmark_question_bank
  FOR SELECT
  USING (true);

CREATE POLICY "k_benchmark_question_bank_admin_all"
  ON public.k_benchmark_question_bank
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

-- Evaluations Table
CREATE TABLE IF NOT EXISTS public.k_benchmark_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.k_benchmark_question_bank(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL REFERENCES public.ai_free_models(id) ON DELETE CASCADE,
  actual_response TEXT NOT NULL,
  pass_fail BOOLEAN DEFAULT FALSE,
  evaluation_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.k_benchmark_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "k_benchmark_evaluations_read_all"
  ON public.k_benchmark_evaluations
  FOR SELECT
  USING (true);

CREATE POLICY "k_benchmark_evaluations_admin_all"
  ON public.k_benchmark_evaluations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo')
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.k_benchmark_evaluations;
-- DROP TABLE IF EXISTS public.k_benchmark_question_bank;
-- DROP TYPE IF EXISTS public.question_bank_status;
