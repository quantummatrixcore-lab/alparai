-- Harden RLS policies for public.users and public.incident_votes to prevent PII leaks to anonymous clients.

drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Profiles are viewable by owner or staff"
  on public.users
  for select
  using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "incident_votes_select_all" on public.incident_votes;
create policy "incident_votes_select_own_or_mod"
  on public.incident_votes
  for select
  to anon, authenticated
  using (user_id = auth.uid() or public.is_moderator(auth.uid()));

-- ROLLBACK:
-- drop policy if exists "Profiles are viewable by owner or staff" on public.users;
-- create policy "Public profiles are viewable by everyone" on public.users for select using (true);
-- drop policy if exists "incident_votes_select_own_or_mod" on public.incident_votes;
-- create policy "incident_votes_select_all" on public.incident_votes for select to anon, authenticated using (true);
