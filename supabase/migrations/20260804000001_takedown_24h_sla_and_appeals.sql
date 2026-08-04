-- Migration: 20260804000001_takedown_24h_sla_and_appeals.sql
-- Description: Reduce takedown SLA from 7 days to 24 hours and create takedown_appeals table for appeal mechanism.

-- 1. Reduce SLA default on takedown_requests to 24 hours
alter table public.takedown_requests 
  alter column sla_due_at set default (now() + interval '24 hours');

-- 2. Create Takedown Appeals Table
create table if not exists public.takedown_appeals (
  id uuid primary key default gen_random_uuid(),
  takedown_id uuid references public.takedown_requests(id) on delete set null,
  incident_id uuid references public.incidents(id) on delete cascade,
  appellant_name text not null,
  appellant_email text not null,
  reason text not null check (char_length(reason) >= 20 and char_length(reason) <= 4000),
  evidence_url text,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'approved', 'rejected')),
  assigned_moderator_id uuid references public.users(id) on delete set null,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_takedown_appeals_status on public.takedown_appeals(status);
create index if not exists idx_takedown_appeals_takedown_id on public.takedown_appeals(takedown_id);
create index if not exists idx_takedown_appeals_incident_id on public.takedown_appeals(incident_id);

-- 3. Enable RLS on takedown_appeals
alter table public.takedown_appeals enable row level security;

create policy "Moderators can view appeals"
  on public.takedown_appeals for select using (public.is_moderator(auth.uid()));

create policy "Anyone can submit an appeal"
  on public.takedown_appeals for insert with check (true);

create policy "Moderators can update appeals"
  on public.takedown_appeals for update using (public.is_moderator(auth.uid()));

-- ROLLBACK:
-- drop table if exists public.takedown_appeals;
-- alter table public.takedown_requests alter column sla_due_at set default (now() + interval '7 days');
