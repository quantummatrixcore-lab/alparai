-- ============================================================================
-- 20260623000400_security_rls_fixes.sql
-- SEC-002: Enable RLS and policies on ai_polls, ai_poll_votes, bounty_badges
-- ============================================================================

-- 1. Enable RLS
alter table public.ai_polls enable row level security;
alter table public.ai_poll_votes enable row level security;
alter table public.bounty_badges enable row level security;

-- 2. Drop existing policies if any
drop policy if exists "polls_public_select" on public.ai_polls;
drop policy if exists "polls_admin_all" on public.ai_polls;
drop policy if exists "poll_votes_public_select" on public.ai_poll_votes;
drop policy if exists "poll_votes_public_insert" on public.ai_poll_votes;
drop policy if exists "poll_votes_owner_delete" on public.ai_poll_votes;
drop policy if exists "bounty_badges_public_select" on public.bounty_badges;
drop policy if exists "bounty_badges_admin_all" on public.bounty_badges;

-- 3. Create policies for ai_polls
create policy "polls_public_select" on public.ai_polls
  for select using (true);

create policy "polls_admin_all" on public.ai_polls
  for all using (public.is_moderator(auth.uid()));

-- 4. Create policies for ai_poll_votes
create policy "poll_votes_public_select" on public.ai_poll_votes
  for select using (true);

create policy "poll_votes_public_insert" on public.ai_poll_votes
  for insert with check (
    -- Authenticated user can vote as themselves, or any user can vote anonymously (user_id is null)
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and user_id = auth.uid())
  );

create policy "poll_votes_owner_delete" on public.ai_poll_votes
  for delete using (
    (auth.uid() is not null and user_id = auth.uid())
    or public.is_moderator(auth.uid())
  );

-- 5. Create policies for bounty_badges
create policy "bounty_badges_public_select" on public.bounty_badges
  for select using (true);

create policy "bounty_badges_admin_all" on public.bounty_badges
  for all using (public.is_moderator(auth.uid()));
