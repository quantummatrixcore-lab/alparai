-- 0007_20260919141500_enforce_missing_rls_policies.sql
-- ==============================================================================
-- MİMAR SİNAN — DEEP ARCHITECTURE & SECURITY GUARDIAN
-- RLS Sovereign Enforcement & Unprotected Tables Hardening
-- ==============================================================================
-- 1. Enforces Row Level Security (ENABLE & FORCE RLS) on all remaining unshielded tables.
-- 2. Implements granular, role-aware policies (SELECT, INSERT, UPDATE, DELETE) for:
--    - feed_incidents
--    - moderation_sla
--    - k_model_scores_history
--    - platform_stats_cache
--    - ai_polls_seed_yedek
--    - news_seed_yedek
-- 3. Grants explicit write/management access to admin & service_role on:
--    - user_badges
--    - admin_login_events
--    - cron_job_logs
--    - platform_statistics
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN TABLES: ENABLE & FORCE ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.feed_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_incidents FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.moderation_sla ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.moderation_sla FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.k_model_scores_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.k_model_scores_history FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.platform_stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_stats_cache FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.ai_polls_seed_yedek ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_polls_seed_yedek FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.news_seed_yedek ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_seed_yedek FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.admin_login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_login_events FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.cron_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cron_job_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.platform_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_statistics FORCE ROW LEVEL SECURITY;

-- Dynamic safety seal for any table in public schema
DO $$ 
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t_name);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 2. POLICIES: feed_incidents
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Feed incidents are viewable by everyone for published or moderators" ON public.feed_incidents;
CREATE POLICY "Feed incidents are viewable by everyone for published or moderators"
  ON public.feed_incidents
  FOR SELECT
  USING (
    status = 'published'
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
    OR public.is_moderator(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Users or service role can insert feed incidents" ON public.feed_incidents;
CREATE POLICY "Users or service role can insert feed incidents"
  ON public.feed_incidents
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()::text))
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Moderators or service role can update feed incidents" ON public.feed_incidents;
CREATE POLICY "Moderators or service role can update feed incidents"
  ON public.feed_incidents
  FOR UPDATE
  USING (
    public.is_moderator(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins or service role can delete feed incidents" ON public.feed_incidents;
CREATE POLICY "Admins or service role can delete feed incidents"
  ON public.feed_incidents
  FOR DELETE
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

-- ------------------------------------------------------------------------------
-- 3. POLICIES: moderation_sla
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Moderators and service role can view moderation SLA" ON public.moderation_sla;
CREATE POLICY "Moderators and service role can view moderation SLA"
  ON public.moderation_sla
  FOR SELECT
  USING (
    public.is_moderator(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Service role and admins can manage moderation SLA" ON public.moderation_sla;
CREATE POLICY "Service role and admins can manage moderation SLA"
  ON public.moderation_sla
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

-- ------------------------------------------------------------------------------
-- 4. POLICIES: k_model_scores_history
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Model score history is viewable by everyone" ON public.k_model_scores_history;
CREATE POLICY "Model score history is viewable by everyone"
  ON public.k_model_scores_history
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and service role can manage model score history" ON public.k_model_scores_history;
CREATE POLICY "Admins and service role can manage model score history"
  ON public.k_model_scores_history
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

-- ------------------------------------------------------------------------------
-- 5. POLICIES: platform_stats_cache
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Platform stats cache is viewable by everyone" ON public.platform_stats_cache;
CREATE POLICY "Platform stats cache is viewable by everyone"
  ON public.platform_stats_cache
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role and admins can manage platform stats cache" ON public.platform_stats_cache;
CREATE POLICY "Service role and admins can manage platform stats cache"
  ON public.platform_stats_cache
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

-- ------------------------------------------------------------------------------
-- 6. POLICIES: ai_polls_seed_yedek & news_seed_yedek
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and service role only for ai_polls_seed_yedek" ON public.ai_polls_seed_yedek;
CREATE POLICY "Admins and service role only for ai_polls_seed_yedek"
  ON public.ai_polls_seed_yedek
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins and service role only for news_seed_yedek" ON public.news_seed_yedek;
CREATE POLICY "Admins and service role only for news_seed_yedek"
  ON public.news_seed_yedek
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

-- ------------------------------------------------------------------------------
-- 7. WRITE/MANAGEMENT POLICIES FOR AUDIT & OPERATIONAL TABLES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and service role can manage user badges" ON public.user_badges;
CREATE POLICY "Admins and service role can manage user badges"
  ON public.user_badges
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Service role and admins can insert and manage admin login events" ON public.admin_login_events;
CREATE POLICY "Service role and admins can insert and manage admin login events"
  ON public.admin_login_events
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Service role and admins can insert and manage cron logs" ON public.cron_job_logs;
CREATE POLICY "Service role and admins can insert and manage cron logs"
  ON public.cron_job_logs
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Service role and admins can manage platform statistics" ON public.platform_statistics;
CREATE POLICY "Service role and admins can manage platform statistics"
  ON public.platform_statistics
  FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR (auth.role() = 'service_role')
  );

-- ------------------------------------------------------------------------------
-- ROLLBACK:
-- ------------------------------------------------------------------------------
-- DROP POLICY IF EXISTS "Feed incidents are viewable by everyone for published or moderators" ON public.feed_incidents;
-- DROP POLICY IF EXISTS "Users or service role can insert feed incidents" ON public.feed_incidents;
-- DROP POLICY IF EXISTS "Moderators or service role can update feed incidents" ON public.feed_incidents;
-- DROP POLICY IF EXISTS "Admins or service role can delete feed incidents" ON public.feed_incidents;
-- DROP POLICY IF EXISTS "Moderators and service role can view moderation SLA" ON public.moderation_sla;
-- DROP POLICY IF EXISTS "Service role and admins can manage moderation SLA" ON public.moderation_sla;
-- DROP POLICY IF EXISTS "Model score history is viewable by everyone" ON public.k_model_scores_history;
-- DROP POLICY IF EXISTS "Admins and service role can manage model score history" ON public.k_model_scores_history;
-- DROP POLICY IF EXISTS "Platform stats cache is viewable by everyone" ON public.platform_stats_cache;
-- DROP POLICY IF EXISTS "Service role and admins can manage platform stats cache" ON public.platform_stats_cache;
-- DROP POLICY IF EXISTS "Admins and service role only for ai_polls_seed_yedek" ON public.ai_polls_seed_yedek;
-- DROP POLICY IF EXISTS "Admins and service role only for news_seed_yedek" ON public.news_seed_yedek;
-- DROP POLICY IF EXISTS "Admins and service role can manage user badges" ON public.user_badges;
-- DROP POLICY IF EXISTS "Service role and admins can insert and manage admin login events" ON public.admin_login_events;
-- DROP POLICY IF EXISTS "Service role and admins can insert and manage cron logs" ON public.cron_job_logs;
-- DROP POLICY IF EXISTS "Service role and admins can manage platform statistics" ON public.platform_statistics;
