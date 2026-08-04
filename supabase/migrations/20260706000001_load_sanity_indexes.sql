-- Migration: Add indexes for load sanity
-- Incidents compound index: status and published_at
CREATE INDEX IF NOT EXISTS idx_incidents_status_published_at ON public.incidents(status, published_at desc);

-- Compound index for social_posts: status and scheduled_at
CREATE INDEX IF NOT EXISTS idx_social_posts_status_scheduled_at ON public.social_posts(status, scheduled_at desc);

-- ROLLBACK:
-- DROP INDEX IF EXISTS public.idx_incidents_status_published_at;
-- DROP INDEX IF EXISTS public.idx_social_posts_status_scheduled_at;
