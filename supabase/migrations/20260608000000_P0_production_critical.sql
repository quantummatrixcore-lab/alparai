-- ============================================================================
-- ALPAR AI — P0 Production Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor > New Query icine yapistir ve Run.
-- Tarih: 2026-06-07
-- Guvenli: idempotent (birden fazla calistirilabilir, "if not exists" kullanir)
-- ============================================================================

-- 1) incident_votes tablosu (voteOnIncident Server Action'i icin)
create table if not exists public.incident_votes (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  value smallint not null check (value in (-1, 0, 1)),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (incident_id, user_id)
);

create index if not exists idx_incident_votes_incident on public.incident_votes(incident_id);
create index if not exists idx_incident_votes_user on public.incident_votes(user_id);

alter table public.incident_votes enable row level security;

drop policy if exists "incident_votes_select_all" on public.incident_votes;
create policy "incident_votes_select_all" on public.incident_votes for select to anon, authenticated using (true);

drop policy if exists "incident_votes_insert_own" on public.incident_votes;
create policy "incident_votes_insert_own" on public.incident_votes for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "incident_votes_update_own" on public.incident_votes;
create policy "incident_votes_update_own" on public.incident_votes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "incident_votes_delete_own" on public.incident_votes;
create policy "incident_votes_delete_own" on public.incident_votes for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "incident_votes_mod_all" on public.incident_votes;
create policy "incident_votes_mod_all" on public.incident_votes for all to authenticated using (public.is_moderator()) with check (public.is_moderator());

create or replace function public.tg_incident_votes_touch() returns trigger language plpgsql security definer set search_path = public as $$ begin new.updated_at := now(); return new; end; $$;

drop trigger if exists trg_incident_votes_touch on public.incident_votes;
create trigger trg_incident_votes_touch before update on public.incident_votes for each row execute function public.tg_incident_votes_touch();

-- 2) incidents tablosuna PII kolonlari (submitIncident icin)
alter table public.incidents add column if not exists contains_pii boolean not null default false;
alter table public.incidents add column if not exists pii_categories text[] not null default '{}';

create index if not exists idx_incidents_contains_pii on public.incidents(contains_pii) where contains_pii = true;
create index if not exists idx_incidents_pii_categories on public.incidents using gin(pii_categories);
