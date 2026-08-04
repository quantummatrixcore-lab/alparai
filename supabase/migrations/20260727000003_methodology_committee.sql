-- Migration: Create methodology_committee_members table
-- Description: Registers methodology advisory committee details with strict RLS and rollback path.

create table public.methodology_committee_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    institution text not null,
    role text not null,
    avatar_url text,
    joined_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.methodology_committee_members enable row level security;

-- Create SELECT policy (public read access)
create policy "Public committee members are viewable by everyone"
on public.methodology_committee_members
for select
using (true);

-- Create WRITE policy (admin access only)
create policy "Only admins can modify committee members"
on public.methodology_committee_members
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Enable realtime if needed
alter publication supabase_realtime add table public.methodology_committee_members;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.methodology_committee_members CASCADE;
