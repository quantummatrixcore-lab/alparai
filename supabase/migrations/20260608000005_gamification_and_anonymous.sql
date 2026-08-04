-- =============================================================================
-- Migration: Gamification & Anonymous Submissions
-- =============================================================================

-- 1. Add gamification columns to users table
alter table public.users add column if not exists reputation_score integer not null default 0;
alter table public.users add column if not exists badges text[] not null default '{}';

-- 2. Allow anonymous incident submissions
create policy "Anonymous users can submit incidents"
  on public.incidents for insert
  with check (user_id is null);

-- 3. Allow anonymous consent logs
create policy "Anonymous users can insert consent records"
  on public.consent_log for insert
  with check (user_id is null);
