-- Migration: Create student_ambassadors table
-- Description: Registers schema for student ambassador program with strict RLS and rollback.

create table public.student_ambassadors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    university text not null,
    graduation_year integer not null,
    status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
    created_at timestamp with time zone not null default now()
);

-- Enable RLS for Student Ambassadors
alter table public.student_ambassadors enable row level security;

create policy "Users can view their own ambassador applications"
on public.student_ambassadors
for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can insert their own ambassador applications"
on public.student_ambassadors
for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can update their own ambassador applications"
on public.student_ambassadors
for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Users can delete their own ambassador applications"
on public.student_ambassadors
for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Realtime settings
alter publication supabase_realtime add table public.student_ambassadors;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.student_ambassadors CASCADE;
