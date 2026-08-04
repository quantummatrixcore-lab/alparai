-- Migration: Create methodology_versions table
-- Timestamp: 20260727000018
-- Rollback: DROP TABLE IF EXISTS public.methodology_versions;

CREATE TABLE IF NOT EXISTS public.methodology_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  summary_en text NOT NULL,
  summary_tr text NOT NULL,
  changes_en jsonb NOT NULL DEFAULT '[]',
  changes_tr jsonb NOT NULL DEFAULT '[]',
  is_retraction boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.methodology_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Methodology versions public read" ON public.methodology_versions
  FOR SELECT TO public USING (true);

CREATE POLICY "Methodology versions admin write" ON public.methodology_versions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_methodology_versions_published ON public.methodology_versions (published_at DESC);
