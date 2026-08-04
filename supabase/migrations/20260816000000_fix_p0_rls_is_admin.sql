-- Fix P0 RLS Policy logic errors:
-- Replace non-existent `users.is_admin = true` column checks with `public.is_admin(auth.uid())` helper function across 5 tables:
-- 1. geo_citations
-- 2. geo_scores
-- 3. sla_alarms
-- 4. incident_translations
-- 5. feature_flags
-- 6. dora_metrics

-- 1. Fix geo_citations & geo_scores
DROP POLICY IF EXISTS "Admin full access geo_citations" ON public.geo_citations;
CREATE POLICY "Admin full access geo_citations"
    ON public.geo_citations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin full access geo_scores" ON public.geo_scores;
CREATE POLICY "Admin full access geo_scores"
    ON public.geo_scores FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 2. Fix sla_alarms
DROP POLICY IF EXISTS "Admin full access sla_alarms" ON public.sla_alarms;
CREATE POLICY "Admin full access sla_alarms"
    ON public.sla_alarms FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 3. Fix incident_translations
DROP POLICY IF EXISTS "Admin full access incident_translations" ON public.incident_translations;
CREATE POLICY "Admin full access incident_translations"
    ON public.incident_translations FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 4. Fix feature_flags
DROP POLICY IF EXISTS "Admin full access feature_flags" ON public.feature_flags;
CREATE POLICY "Admin full access feature_flags"
    ON public.feature_flags FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 5. Fix dora_metrics
DROP POLICY IF EXISTS "Admin full access dora_metrics" ON public.dora_metrics;
CREATE POLICY "Admin full access dora_metrics"
    ON public.dora_metrics FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ROLLBACK:
-- DROP POLICY IF EXISTS "Admin full access geo_citations" ON public.geo_citations;
-- DROP POLICY IF EXISTS "Admin full access geo_scores" ON public.geo_scores;
-- DROP POLICY IF EXISTS "Admin full access sla_alarms" ON public.sla_alarms;
-- DROP POLICY IF EXISTS "Admin full access incident_translations" ON public.incident_translations;
-- DROP POLICY IF EXISTS "Admin full access feature_flags" ON public.feature_flags;
-- DROP POLICY IF EXISTS "Admin full access dora_metrics" ON public.dora_metrics;
