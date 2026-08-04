-- Migration: Create k_provider_previews table
-- Description: Registers schema for tracking model provider 60-day previews with strict RLS and rollback.

create table public.k_provider_previews (
    id uuid primary key default gen_random_uuid(),
    provider_id uuid not null references public.ai_providers(id) on delete cascade,
    preview_token text not null unique,
    sent_at timestamp with time zone,
    expires_at timestamp with time zone not null,
    status text not null default 'pending' check (status in ('pending', 'sent', 'accessed', 'expired')),
    created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.k_provider_previews enable row level security;

-- Only admins can manage and read this table directly
create policy "Only admins can select provider previews"
on public.k_provider_previews
for select
using (public.is_admin(auth.uid()));

create policy "Only admins can insert provider previews"
on public.k_provider_previews
for insert
with check (public.is_admin(auth.uid()));

create policy "Only admins can update provider previews"
on public.k_provider_previews
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Only admins can delete provider previews"
on public.k_provider_previews
for delete
using (public.is_admin(auth.uid()));

-- Realtime settings
alter publication supabase_realtime add table public.k_provider_previews;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.k_provider_previews CASCADE;
