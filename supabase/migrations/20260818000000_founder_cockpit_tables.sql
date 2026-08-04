CREATE TABLE IF NOT EXISTS public.linkedin_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  title text,
  company text,
  profile_url text,
  category text,
  status text NOT NULL DEFAULT 'to_add' CHECK (status IN ('to_add','added','messaged','responded')),
  priority integer NOT NULL DEFAULT 3,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Moderators can manage linkedin_contacts" ON public.linkedin_contacts
  FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
ALTER TABLE public.linkedin_contacts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.grant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name text NOT NULL,
  funding_amount text,
  apply_url text,
  category text,
  phase integer NOT NULL DEFAULT 1 CHECK (phase IN (1,2,3)),
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','drafting','submitted_pending_review','approved','rejected','accepted_by_program')),
  prepared_content_ref text,
  completed_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Moderators can manage grant_applications" ON public.grant_applications
  FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.platform_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL,
  url text,
  category text,
  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','account_created','profile_complete','active')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Moderators can manage platform_signups" ON public.platform_signups
  FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
ALTER TABLE public.platform_signups ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.outreach_queue ADD COLUMN IF NOT EXISTS company text;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.linkedin_contacts;
-- DROP TABLE IF EXISTS public.grant_applications;
-- DROP TABLE IF EXISTS public.platform_signups;
-- ALTER TABLE public.outreach_queue DROP COLUMN IF EXISTS company;
