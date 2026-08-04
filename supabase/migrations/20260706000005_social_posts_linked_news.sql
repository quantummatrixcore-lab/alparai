-- ============================================================================
-- 20260706000005_social_posts_linked_news.sql
--
-- Adds linked_news_id column to social_posts table to track news marketing assets.
-- ============================================================================

ALTER TABLE public.social_posts
  ADD COLUMN linked_news_id uuid REFERENCES public.ecosystem_news(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_social_posts_linked_news ON public.social_posts(linked_news_id);
