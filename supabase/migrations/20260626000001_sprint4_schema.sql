-- Migration: Sprint 4 Schema Upgrades (Watches & Dynamic Feed Score View)
-- Timestamp: 2026-06-26 00:00:01

-- 1. Create watches table
CREATE TABLE IF NOT EXISTS public.user_provider_watches (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, provider_id)
);

-- 2. Enable RLS on watches table
ALTER TABLE public.user_provider_watches ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS policies
CREATE POLICY "Users can manage their own watches" ON public.user_provider_watches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create feed_incidents view for dynamic feed score calculation
CREATE OR REPLACE VIEW public.feed_incidents AS
SELECT 
  i.*,
  (
    ((i.upvotes_count * 3 + i.comments_count * 2 + i.affected_users_count * 4 + i.views_count / 50.0) * 
    (CASE 
      WHEN i.severity = 'critical' THEN 3.0
      WHEN i.severity = 'high' THEN 2.0
      WHEN i.severity = 'medium' THEN 1.5
      ELSE 1.0
     END)) * 
    (1.0 / (EXTRACT(EPOCH FROM (now() - i.published_at)) / 3600.0 + 1.0))
  ) AS feed_score
FROM public.incidents i
WHERE i.status = 'published';
