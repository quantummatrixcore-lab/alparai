-- Migration: Create fellowship_applications table
-- Description: Registers schema for academic faculty fellowship applications with strict RLS and rollback.

create table public.fellowship_applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    institution text not null,
    department text not null,
    proposal text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone not null default now()
);

-- Enable RLS for Fellowship Applications
alter table public.fellowship_applications enable row level security;

create policy "Users can view their own fellowship applications"
on public.fellowship_applications
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can insert their own fellowship applications"
on public.fellowship_applications
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can update their own fellowship applications"
on public.fellowship_applications
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can delete their own fellowship applications"
on public.fellowship_applications
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Realtime settings
alter publication supabase_realtime add table public.fellowship_applications;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.fellowship_applications CASCADE;
