-- Migration: Create email_sent_logs table, enable RLS, and add policy for admin/service access.
CREATE TABLE IF NOT EXISTS public.email_sent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL, -- SHA256 of lowercase recipient email to protect PII
  email_type text NOT NULL, -- e.g. 'provider_response', 'whistleblower_confirmation'
  sent_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying by hash and time range
CREATE INDEX IF NOT EXISTS idx_email_sent_logs_hash_date ON public.email_sent_logs(email_hash, sent_at);

-- Enable RLS
ALTER TABLE public.email_sent_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write only for administrators and system operations
CREATE POLICY "admins_manage_email_sent_logs"
  ON public.email_sent_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'ceo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'ceo')
    )
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.email_sent_logs CASCADE;
