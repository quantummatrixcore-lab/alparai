-- ============================================================================
-- 20260619000003_blog_posts.sql
--
-- Adds the `blog_posts` table to support dynamic blog posts, drafts, and
-- automated weekly reports.
-- ============================================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_tr text not null,
  content_en text not null,
  content_tr text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  generated_by text, -- e.g. 'autopilot-weekly'
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.blog_posts enable row level security;

-- Anyone can read published posts
drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

-- Admins/moderators can manage all blog posts (drafts, delete, insert, update)
drop policy if exists "blog_posts_admin_all" on public.blog_posts;
create policy "blog_posts_admin_all"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));
