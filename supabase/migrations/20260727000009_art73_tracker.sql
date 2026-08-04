-- Migration: Create art73_obligation_status table
-- Description: Registers schema for tracking AI provider compliance status under EU AI Act Article 73 with strict RLS and rollback.

create table public.art73_obligation_status (
    id uuid primary key default gen_random_uuid(),
    provider_id uuid not null references public.ai_providers(id) on delete cascade,
    obligation_name text not null,
    status text not null default 'pending' check (status in ('pending', 'compliant', 'non_compliant')),
    verified_at timestamp with time zone,
    created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.art73_obligation_status enable row level security;

-- Read policies: Anyone can read compliance status
create policy "Anyone can read Art 73 compliance status"
on public.art73_obligation_status
for select
using (true);

-- Write policies: Only admins can manage compliance status
create policy "Only admins can insert Art 73 status"
on public.art73_obligation_status
for insert
with check (public.is_admin(auth.uid()));

create policy "Only admins can update Art 73 status"
on public.art73_obligation_status
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Only admins can delete Art 73 status"
on public.art73_obligation_status
for delete
using (public.is_admin(auth.uid()));

-- Realtime settings
alter publication supabase_realtime add table public.art73_obligation_status;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.art73_obligation_status CASCADE;
