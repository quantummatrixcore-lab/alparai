-- Migration: Sybil Detection Fingerprints Table
-- Timestamp: 20260727000021
-- Rollback: DROP TABLE IF EXISTS public.submission_fingerprints;

CREATE TABLE IF NOT EXISTS public.submission_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on submission_fingerprints" ON public.submission_fingerprints
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow moderators full access on submission_fingerprints" ON public.submission_fingerprints
  FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_submission_fingerprints_fingerprint ON public.submission_fingerprints (fingerprint);
CREATE INDEX IF NOT EXISTS idx_submission_fingerprints_ip_hash ON public.submission_fingerprints (ip_hash);
