-- Migration: Create private_benchmarks and rating_alerts tables
-- Description: Registers schema for K-Product enterprise segment with strict RLS and rollback.

-- 1. Private Benchmarks Table
create table public.private_benchmarks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model_id text not null,
    score numeric not null,
    created_at timestamp with time zone not null default now()
);

-- Enable RLS for Private Benchmarks
alter table public.private_benchmarks enable row level security;

create policy "Users can view their own private benchmarks"
on public.private_benchmarks
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can insert their own private benchmarks"
on public.private_benchmarks
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can update their own private benchmarks"
on public.private_benchmarks
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can delete their own private benchmarks"
on public.private_benchmarks
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 2. Rating Alerts Table
create table public.rating_alerts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model_id text not null,
    threshold numeric not null,
    is_active boolean not null default true,
    created_at timestamp with time zone not null default now()
);

-- Enable RLS for Rating Alerts
alter table public.rating_alerts enable row level security;

create policy "Users can view their own rating alerts"
on public.rating_alerts
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can insert their own rating alerts"
on public.rating_alerts
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can update their own rating alerts"
on public.rating_alerts
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can delete their own rating alerts"
on public.rating_alerts
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Realtime settings
alter publication supabase_realtime add table public.private_benchmarks;
alter publication supabase_realtime add table public.rating_alerts;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.private_benchmarks CASCADE;
-- DROP TABLE IF EXISTS public.rating_alerts CASCADE;
