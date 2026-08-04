-- Migration: Expert Applications Table (2026-06-29)
CREATE TABLE IF NOT EXISTS public.expert_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title_institution text NOT NULL,
  expertise text NOT NULL,
  linkedin_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: anyone can insert, only moderator/admin can read/update
ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expert_apps_insert_anon" ON public.expert_applications;
CREATE POLICY "expert_apps_insert_anon" ON public.expert_applications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "expert_apps_mod_select" ON public.expert_applications;
CREATE POLICY "expert_apps_mod_select" ON public.expert_applications
  FOR SELECT USING (public.is_moderator(auth.uid()));

DROP POLICY IF EXISTS "expert_apps_mod_update" ON public.expert_applications;
CREATE POLICY "expert_apps_mod_update" ON public.expert_applications
  FOR UPDATE USING (public.is_moderator(auth.uid()));

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_expert_apps_status ON public.expert_applications(status, created_at desc);
