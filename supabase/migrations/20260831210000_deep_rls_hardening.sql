-- ============================================================================
-- Migration: 20260831210000_deep_rls_hardening.sql
-- Description: Deep RLS Enforcement & Database Security Policy Hardening
-- Author: ALPAR AI Security & Trust Infrastructure Team
-- ============================================================================

-- 1. GLOBAL SAFETY NET: Ensure EVERY table in public schema has RLS Enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END;
$$;

-- 2. HARDEN AI SCORING CONFIG (Prevent arbitrary parameter tampering by regular authenticated users)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_scoring_config') THEN
        DROP POLICY IF EXISTS "admin write access to ai_scoring_config" ON public.ai_scoring_config;
        DROP POLICY IF EXISTS "Admin write access to ai_scoring_config" ON public.ai_scoring_config;
        DROP POLICY IF EXISTS "Admins and service role manage ai_scoring_config" ON public.ai_scoring_config;
        
        CREATE POLICY "Admins and service role manage ai_scoring_config" ON public.ai_scoring_config
            FOR ALL TO authenticated, service_role
            USING (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            )
            WITH CHECK (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            );
    END IF;
END $$;

-- 3. HARDEN AI TRUST LEDGER (Prevent unauthorized trust score injection)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_trust_ledger') THEN
        DROP POLICY IF EXISTS "admin write access to ai_trust_ledger" ON public.ai_trust_ledger;
        DROP POLICY IF EXISTS "Admin write access to ai_trust_ledger" ON public.ai_trust_ledger;
        DROP POLICY IF EXISTS "Admins and service role insert ai_trust_ledger" ON public.ai_trust_ledger;
        
        CREATE POLICY "Admins and service role insert ai_trust_ledger" ON public.ai_trust_ledger
            FOR INSERT TO authenticated, service_role
            WITH CHECK (
                auth.role() = 'service_role' 
                OR public.is_admin(auth.uid()) 
                OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
            );
    END IF;
END $$;

-- 4. HARDEN WALL OF SHAME & AI RAP SHEET
-- (Close unauthorized INSERT hole on wall_of_shame_entries and ensure strictly moderated access)
DO $$
BEGIN
    -- If wall_of_shame_entries is a table (in legacy/standalone setups)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wall_of_shame_entries') THEN
        ALTER TABLE public.wall_of_shame_entries ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow auth insert" ON public.wall_of_shame_entries;
        DROP POLICY IF EXISTS "Allow public read" ON public.wall_of_shame_entries;
        DROP POLICY IF EXISTS "Public read wall_of_shame_entries" ON public.wall_of_shame_entries;
        DROP POLICY IF EXISTS "Moderator write wall_of_shame_entries" ON public.wall_of_shame_entries;
        
        CREATE POLICY "Public read wall_of_shame_entries" ON public.wall_of_shame_entries
            FOR SELECT TO anon, authenticated
            USING (is_active = true OR public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
            
        CREATE POLICY "Moderator write wall_of_shame_entries" ON public.wall_of_shame_entries
            FOR ALL TO authenticated, service_role
            USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;

    -- Harden ai_rap_sheet_entries
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_rap_sheet_entries') THEN
        ALTER TABLE public.ai_rap_sheet_entries ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries;
        DROP POLICY IF EXISTS "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries;
        
        CREATE POLICY "Public read ai_rap_sheet" ON public.ai_rap_sheet_entries
            FOR SELECT TO anon, authenticated
            USING (is_active = true OR public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
            
        CREATE POLICY "Moderators manage ai_rap_sheet" ON public.ai_rap_sheet_entries
            FOR ALL TO authenticated, service_role
            USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;
END $$;

-- 5. HARDEN AGORA-T JURY SYSTEM
-- Ensure only selected, verified jurors for a specific case can submit votes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jury_votes') THEN
        ALTER TABLE public.jury_votes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Jurors submit own vote" ON public.jury_votes;
        DROP POLICY IF EXISTS "Verified jurors submit own vote" ON public.jury_votes;
        
        CREATE POLICY "Verified jurors submit own vote" ON public.jury_votes
            FOR INSERT TO authenticated
            WITH CHECK (
                juror_id = auth.uid()
                AND (
                    EXISTS (
                        SELECT 1 FROM public.jurors j 
                        WHERE j.case_id = jury_votes.case_id 
                          AND j.juror_id = auth.uid()
                    )
                    OR public.is_admin(auth.uid())
                    OR auth.role() = 'service_role'
                )
            );
            
        DROP POLICY IF EXISTS "Admin and service role manage jury_votes" ON public.jury_votes;
        CREATE POLICY "Admin and service role manage jury_votes" ON public.jury_votes
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'jury_cases') THEN
        ALTER TABLE public.jury_cases ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admin & Moderator manage jury_cases" ON public.jury_cases;
        DROP POLICY IF EXISTS "Admin & Moderator update jury_cases" ON public.jury_cases;
        DROP POLICY IF EXISTS "Admin delete jury_cases" ON public.jury_cases;
        
        CREATE POLICY "Admin & Moderator update jury_cases" ON public.jury_cases
            FOR UPDATE TO authenticated, service_role
            USING (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_moderator(auth.uid()) OR public.is_admin(auth.uid()) OR auth.role() = 'service_role');
            
        CREATE POLICY "Admin delete jury_cases" ON public.jury_cases
            FOR DELETE TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;
END $$;

-- 6. HARDEN USER REPUTATION & ANTI-SYBIL SYSTEM
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_reputation') THEN
        ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admin write user_reputation" ON public.user_reputation;
        CREATE POLICY "Admin write user_reputation" ON public.user_reputation
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reputation_logs') THEN
        ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admin write reputation_logs" ON public.reputation_logs;
        CREATE POLICY "Admin write reputation_logs" ON public.reputation_logs
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sybil_detection_logs') THEN
        ALTER TABLE public.sybil_detection_logs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admin manage sybil_detection_logs" ON public.sybil_detection_logs;
        CREATE POLICY "Admin manage sybil_detection_logs" ON public.sybil_detection_logs
            FOR ALL TO authenticated, service_role
            USING (public.is_admin(auth.uid()) OR auth.role() = 'service_role')
            WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'service_role');
    END IF;
END $$;
