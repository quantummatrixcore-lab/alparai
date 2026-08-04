-- G6: Cookie consent log for ePrivacy + KVKK granular consent audit trail

create table public.cookie_consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id text,
  consent_level text not null check (consent_level in ('necessary', 'analytics', 'marketing')),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.cookie_consent_log enable row level security;

create policy "Users can view their own cookie consents"
  on public.cookie_consent_log for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Anyone can insert cookie consent"
  on public.cookie_consent_log for insert
  with check (true);

create index idx_cookie_consent_user on public.cookie_consent_log(user_id);
create index idx_cookie_consent_session on public.cookie_consent_log(session_id);
create index idx_cookie_consent_created on public.cookie_consent_log(created_at desc);

-- ROLLBACK:
-- drop table if exists public.cookie_consent_log;
