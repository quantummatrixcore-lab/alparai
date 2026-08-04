-- Create investor_applications table
create table public.investor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  company text not null,
  linkedin_url text not null,
  email text not null,
  check_size text not null,
  why_interested text,
  status text not null default 'pending',
  access_token_hash text,
  created_at timestamp with time zone default now() not null,
  approved_at timestamp with time zone,
  constraint status_check check (status in ('pending', 'approved', 'rejected'))
);

-- Enable RLS
alter table public.investor_applications enable row level security;

-- Anon/Public can insert applications
create policy "investor_applications_anon_insert" on public.investor_applications
  for insert with check (true);

-- Admins and CEO can do everything
create policy "investor_applications_admin_all" on public.investor_applications
  for all using (public.is_admin(auth.uid()) or public.is_ceo(auth.uid()));
