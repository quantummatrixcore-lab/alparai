-- ============================================================================
-- 20260608000001_incident_votes.sql
--
-- Adds the `incident_votes` table that the autopilot-wired `voteOnIncident`
-- Server Action and the existing `submitIncident` page both depend on.
--
-- This table was referenced by the application layer but never created in
-- 20260605000001_initial_schema.sql.  Without it:
--   * voteOnIncident throws "relation incident_votes does not exist"
--   * any UI displaying vote counts reads null/0
-- ============================================================================

create table if not exists public.incident_votes (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  value smallint not null check (value in (-1, 0, 1)),
  ip_hash text,                             -- KVKK-safe: hashed IP only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (incident_id, user_id)
);

create index if not exists idx_incident_votes_incident
  on public.incident_votes(incident_id);
create index if not exists idx_incident_votes_user
  on public.incident_votes(user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.incident_votes enable row level security;

-- Anyone can see aggregated vote counts (the value column hides sensitive info)
drop policy if exists "incident_votes_select_all" on public.incident_votes;
create policy "incident_votes_select_all"
  on public.incident_votes
  for select
  to anon, authenticated
  using (true);

-- Only the row owner can insert/update/delete their own vote
drop policy if exists "incident_votes_insert_own" on public.incident_votes;
create policy "incident_votes_insert_own"
  on public.incident_votes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "incident_votes_update_own" on public.incident_votes;
create policy "incident_votes_update_own"
  on public.incident_votes
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "incident_votes_delete_own" on public.incident_votes;
create policy "incident_votes_delete_own"
  on public.incident_votes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Moderators/admins retain full access via the existing is_moderator() function
drop policy if exists "incident_votes_mod_all" on public.incident_votes;
create policy "incident_votes_mod_all"
  on public.incident_votes
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));

-- ----------------------------------------------------------------------------
-- Trigger: keep updated_at fresh + bump parent incidents.upvotes_count
-- ----------------------------------------------------------------------------
create or replace function public.tg_incident_votes_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_incident_votes_touch on public.incident_votes;
create trigger trg_incident_votes_touch
  before update on public.incident_votes
  for each row execute function public.tg_incident_votes_touch();
