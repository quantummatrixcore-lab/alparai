-- Migration: Create transparency_reports table (Streisand transparency)
-- Timestamp: 20260727000023
-- ROLLBACK: DROP TABLE IF EXISTS public.transparency_reports;

CREATE TABLE IF NOT EXISTS public.transparency_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('cease_and_desist', 'dmca', 'legal_threat', 'other')),
  requested_by_category text NOT NULL CHECK (requested_by_category IN ('ai_firm', 'pr_firm', 'legal', 'individual', 'other')),
  summary_en text NOT NULL,
  summary_tr text NOT NULL,
  action_taken text NOT NULL CHECK (action_taken IN ('resisted', 'partial_compliance', 'complied', 'pending')),
  is_published boolean NOT NULL DEFAULT false,
  requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transparency_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transparency reports public read" ON public.transparency_reports
  FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Transparency reports admin all" ON public.transparency_reports
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_transparency_reports_published ON public.transparency_reports (requested_at DESC) WHERE is_published = true;
