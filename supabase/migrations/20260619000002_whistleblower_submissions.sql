-- ============================================================================
-- 20260619000002_whistleblower_submissions.sql
--
-- Adds the `whistleblower_submissions` table for anonymous insider reports.
-- IP addresses and user profiles are completely omitted/untracked to protect sources.
-- ============================================================================

create table if not exists public.whistleblower_submissions (
  id uuid primary key default gen_random_uuid(),
  encrypted_content text not null, -- client-side encrypted payload
  category text not null,
  provider_hint text, -- optional hint about the AI provider
  submitted_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'verified', 'closed'))
);

-- Row Level Security
alter table public.whistleblower_submissions enable row level security;

-- Only moderators/admins can view, edit, or delete submissions
drop policy if exists "whistleblower_admin_all" on public.whistleblower_submissions;
create policy "whistleblower_admin_all"
  on public.whistleblower_submissions
  for all
  to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));

-- Anyone can submit (anonymous, no session required)
drop policy if exists "whistleblower_public_insert" on public.whistleblower_submissions;
create policy "whistleblower_public_insert"
  on public.whistleblower_submissions
  for insert
  with check (true);
