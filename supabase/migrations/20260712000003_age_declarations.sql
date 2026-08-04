-- G8: Age declaration audit trail (COPPA + UK Online Safety Act)

create table public.age_declarations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  incident_id uuid references public.incidents(id) on delete cascade,
  declared_over_18 boolean not null default true,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.age_declarations enable row level security;

create policy "Users can view their own age declarations"
  on public.age_declarations for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Anyone can insert age declaration"
  on public.age_declarations for insert
  with check (true);

create index idx_age_declaration_user on public.age_declarations(user_id);
create index idx_age_declaration_incident on public.age_declarations(incident_id);

-- ROLLBACK:
-- drop table if exists public.age_declarations;
