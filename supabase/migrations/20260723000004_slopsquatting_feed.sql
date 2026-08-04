-- Migration: Slopsquatting reports table for I9 Slopsquatting Feed
-- Timestamp: 20260723000004

CREATE TABLE IF NOT EXISTS public.slopsquatting_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name  TEXT NOT NULL,
  ecosystem     TEXT NOT NULL CHECK (ecosystem IN ('npm', 'pypi', 'cargo', 'rubygems', 'crates')),
  hallucinated_by_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_real BOOLEAN NOT NULL DEFAULT FALSE,
  source_url    TEXT,
  reporter_ip_hash TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slopsquatting_ecosystem ON public.slopsquatting_reports(ecosystem);
CREATE INDEX IF NOT EXISTS idx_slopsquatting_confirmed ON public.slopsquatting_reports(confirmed_real);
CREATE INDEX IF NOT EXISTS idx_slopsquatting_package ON public.slopsquatting_reports(package_name);

ALTER TABLE public.slopsquatting_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read slopsquatting_reports"
  ON public.slopsquatting_reports FOR SELECT
  USING (true);

CREATE POLICY "Service role insert slopsquatting_reports"
  ON public.slopsquatting_reports FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

CREATE POLICY "Admin full access slopsquatting_reports"
  ON public.slopsquatting_reports FOR ALL
  USING (public.is_admin(auth.uid()));

-- ROLLBACK: DROP TABLE IF EXISTS public.slopsquatting_reports;
