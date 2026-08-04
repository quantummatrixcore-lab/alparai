-- ============================================================================
-- 20260706000004_ecosystem_news_status.sql
--
-- Adds status column to ecosystem_news table.
-- Existing rows are marked as 'accepted' to avoid duplicate social queue generation.
-- New rows default to 'pending'.
-- ============================================================================

ALTER TABLE public.ecosystem_news 
  ADD COLUMN status text NOT NULL DEFAULT 'accepted' CHECK (status in ('pending', 'accepted', 'rejected'));

ALTER TABLE public.ecosystem_news 
  ALTER COLUMN status SET DEFAULT 'pending';
