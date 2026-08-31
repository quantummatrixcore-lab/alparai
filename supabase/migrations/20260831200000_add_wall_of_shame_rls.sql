-- ============================================================================
-- Migration: 20260831200000_add_wall_of_shame_rls.sql
-- Wall of Shame Entries RLS & Security Policy Hardening
-- ============================================================================

ALTER TABLE IF EXISTS public.wall_of_shame_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.wall_of_shame_entries;
CREATE POLICY "Allow public read"
  ON public.wall_of_shame_entries
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow auth insert" ON public.wall_of_shame_entries;
CREATE POLICY "Allow auth insert"
  ON public.wall_of_shame_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
