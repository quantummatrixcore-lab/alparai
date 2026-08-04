-- Migration: Social Media Module - Tables & Policies
-- Timestamp: 2026-06-25 00:00:01

-- 1. Create social_posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform in ('linkedin', 'x', 'instagram', 'facebook', 'whatsapp')),
  status text NOT NULL DEFAULT 'draft' CHECK (status in ('draft', 'scheduled', 'published', 'archived')),
  content_type text NOT NULL CHECK (content_type in ('manifesto', 'case_study', 'weekly_report', 'incident_spotlight', 'thread', 'poll')),
  title text NOT NULL,
  body_text text NOT NULL,
  image_prompt text,
  image_url text,
  video_url text,
  hashtags text[] NOT NULL DEFAULT '{}',
  linked_incident_id uuid REFERENCES public.incidents(id) ON DELETE SET NULL,
  scheduled_at timestamptz,
  published_at timestamptz,
  external_url text,
  estimated_reach integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create social_assets table
CREATE TABLE IF NOT EXISTS public.social_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL CHECK (asset_type in ('image', 'video', 'carousel', 'reel', 'story')),
  title text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  linked_post_id uuid REFERENCES public.social_posts(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create social_templates table
CREATE TABLE IF NOT EXISTS public.social_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform text NOT NULL CHECK (platform in ('linkedin', 'x', 'instagram', 'all')),
  content_type text NOT NULL CHECK (content_type in ('manifesto', 'case_study', 'weekly_report', 'incident_spotlight', 'thread', 'poll')),
  template_body text NOT NULL,
  example_output text,
  psychology_hook text NOT NULL CHECK (psychology_hook in ('fear', 'authority', 'social_proof', 'urgency', 'scarcity', 'reciprocity', 'unity')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS on all social tables
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_templates ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies
-- social_posts: CEO and Admin can do everything. Other roles cannot read or modify.
CREATE POLICY "ceo_admin_posts_all" ON public.social_posts
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- social_assets: CEO and Admin can do everything. Other roles cannot read or modify.
CREATE POLICY "ceo_admin_assets_all" ON public.social_assets
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- social_templates: CEO and Admin can do everything. Other roles cannot read or modify.
CREATE POLICY "ceo_admin_templates_all" ON public.social_templates
  FOR ALL TO authenticated
  USING (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_ceo(auth.uid()) OR public.is_admin(auth.uid()));

-- 6. Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON public.social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_linked_incident ON public.social_posts(linked_incident_id);
CREATE INDEX IF NOT EXISTS idx_social_assets_linked_post ON public.social_assets(linked_post_id);
CREATE INDEX IF NOT EXISTS idx_social_templates_hook ON public.social_templates(psychology_hook);
