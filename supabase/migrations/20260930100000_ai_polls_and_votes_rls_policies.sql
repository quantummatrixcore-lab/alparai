-- =============================================================================
-- Migration: AI Polls and Poll Votes RLS Policies
-- Description: Enforces Row Level Security (RLS) on public.ai_polls and
--              public.ai_poll_votes tables. Adds public read access for active
--              polls, anonymous/authenticated voting permissions, and admin
--              management policies.
-- =============================================================================

BEGIN;

-- 1. Ensure RLS is enabled on both tables
ALTER TABLE public.ai_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_poll_votes ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing conflicting policies
DROP POLICY IF EXISTS "AI polls are viewable by everyone" ON public.ai_polls;
DROP POLICY IF EXISTS "Active AI polls are viewable by everyone" ON public.ai_polls;
DROP POLICY IF EXISTS "Admins can manage ai_polls" ON public.ai_polls;
DROP POLICY IF EXISTS "Poll votes are viewable by everyone" ON public.ai_poll_votes;
DROP POLICY IF EXISTS "Anyone can cast a poll vote" ON public.ai_poll_votes;
DROP POLICY IF EXISTS "Admins can manage poll votes" ON public.ai_poll_votes;

-- =============================================================================
-- AI POLLS POLICIES
-- =============================================================================

-- Public / Anonymous & Authenticated users can view active polls (Admins can view all)
CREATE POLICY "AI polls are viewable by everyone"
  ON public.ai_polls
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true 
    OR public.is_admin(auth.uid())
  );

-- Admins / Moderators have full management access (create, update, delete polls)
CREATE POLICY "Admins can manage ai_polls"
  ON public.ai_polls
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- =============================================================================
-- AI POLL VOTES POLICIES
-- =============================================================================

-- Public / Anonymous & Authenticated users can view votes (transparency & public stats)
CREATE POLICY "Poll votes are viewable by everyone"
  ON public.ai_poll_votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anonymous and Authenticated users can cast votes (validated choice & ip_hash)
CREATE POLICY "Anyone can cast a poll vote"
  ON public.ai_poll_votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    choice IN ('yes', 'no', 'unsure')
    AND ip_hash IS NOT NULL
    AND length(trim(ip_hash)) > 0
    AND (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
  );

-- Admins have management access for moderation / audit / cleanup
CREATE POLICY "Admins can manage poll votes"
  ON public.ai_poll_votes
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- =============================================================================
-- GRANTS
-- =============================================================================
GRANT SELECT ON public.ai_polls TO anon, authenticated;
GRANT SELECT, INSERT ON public.ai_poll_votes TO anon, authenticated;

COMMIT;

-- ROLLBACK:
-- DROP POLICY IF EXISTS "AI polls are viewable by everyone" ON public.ai_polls;
-- DROP POLICY IF EXISTS "Admins can manage ai_polls" ON public.ai_polls;
-- DROP POLICY IF EXISTS "Poll votes are viewable by everyone" ON public.ai_poll_votes;
-- DROP POLICY IF EXISTS "Anyone can cast a poll vote" ON public.ai_poll_votes;
-- DROP POLICY IF EXISTS "Admins can manage poll votes" ON public.ai_poll_votes;
