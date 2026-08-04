-- Migration: 20260829000000_ai_act_article5.sql
-- Description: Add the Article 5 prohibited-practice category for
-- non-consensual intimate imagery / CSAM to the incident_category enum and
-- restrict public read access on this sensitive category to staff only.
--
-- Article 5 of the EU AI Act prohibits AI practices that exploit, generate,
-- or facilitate content that sexually victimises minors (CSAM) or non-consensual
-- intimate imagery. Incidents in this category are highly sensitive: they are
-- never surfaced to anonymous/public readers regardless of publish status.

-- 1. Add value to incident_category enum
alter type public.incident_category
  add value 'non_consensual_intimate_imagery_csam';

-- 2. RLS: remove the NCII/CSAM category from the public-read clause so that
--    published incidents of this category are only visible to their owner and
--    to moderators/admins (public.is_moderator covers admin and ceo roles).
drop policy if exists "Published incidents are viewable by everyone" on public.incidents;
create policy "Published incidents are viewable by everyone"
  on public.incidents
  for select
  using (
    (
      status = 'published'
      and category <> 'non_consensual_intimate_imagery_csam'
    )
    or user_id = auth.uid()
    or public.is_moderator(auth.uid())
  );

-- Re-assert RLS on incidents (idempotent; documents intent for this category).
alter table public.incidents enable row level security;

-- ROLLBACK:
-- drop policy if exists "Published incidents are viewable by everyone" on public.incidents;
-- create policy "Published incidents are viewable by everyone"
--   on public.incidents
--   for select
--   using (
--     status = 'published'
--     or user_id = auth.uid()
--     or public.is_moderator(auth.uid())
--   );
--
-- Note: PostgreSQL does not support dropping a single enum value in place.
-- To fully remove 'non_consensual_intimate_imagery_csam', recreate the enum:
--   create type public.incident_category_new as enum (
--     'hallucination', 'bias', 'privacy', 'security', 'misinformation',
--     'harassment', 'manipulation', 'inaccessibility', 'copyright', 'other'
--   );
--   alter table public.incidents
--     alter column category type public.incident_category_new
--     using category::text::public.incident_category_new;
--   drop type public.incident_category;
--   alter type public.incident_category_new rename to incident_category;
