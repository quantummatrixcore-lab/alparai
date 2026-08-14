-- Migration: 20260915000000_storage_and_pii_rls_hardening.sql
-- Security, RLS & Storage Hardening for ALPAR AI
-- 1. Create and secure 'invoices' bucket in Supabase storage
-- 2. Define RLS policies on storage.objects for invoices
-- 3. Comprehensive RLS check on all public tables

-- 1. Create 'invoices' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. RLS policies on storage.objects for 'invoices'
DROP POLICY IF EXISTS "Users can read own invoices or admins all" ON storage.objects;
CREATE POLICY "Users can read own invoices or admins all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_moderator(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can insert invoices" ON storage.objects;
CREATE POLICY "Admins can insert invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices' AND (
      public.is_moderator(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update invoices" ON storage.objects;
CREATE POLICY "Admins can update invoices"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'invoices' AND (
      public.is_moderator(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete invoices" ON storage.objects;
CREATE POLICY "Admins can delete invoices"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'invoices' AND (
      public.is_moderator(auth.uid())
    )
  );

-- 3. Ensure all public tables have RLS enabled
ALTER TABLE IF EXISTS public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.external_incidents_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_innovations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.provider_response_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.autopilot_worker_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_sent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategic_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_swot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategy_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.k_benchmark_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.k_benchmark_evaluations ENABLE ROW LEVEL SECURITY;

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Admins can delete invoices" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can update invoices" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can insert invoices" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can read own invoices or admins all" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'invoices';
