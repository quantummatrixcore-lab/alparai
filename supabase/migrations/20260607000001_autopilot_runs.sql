create table public.autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  action text not null,
  status text not null check (status in ('pending','running','succeeded','exhausted','replayed','circuit_open','budget_exceeded')),
  attempts int not null default 0,
  last_error text,
  duration_ms int,
  result_id uuid,
  ip_hash text,
  user_id uuid references public.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_autopilot_runs_action on public.autopilot_runs(action);
create index idx_autopilot_runs_status on public.autopilot_runs(status);
create index idx_autopilot_runs_created_at on public.autopilot_runs(created_at desc);
create index idx_autopilot_runs_user on public.autopilot_runs(user_id);
create index idx_autopilot_runs_idempotency on public.autopilot_runs(idempotency_key);

create trigger trg_autopilot_runs_updated_at
  before update on public.autopilot_runs
  for each row execute function public.set_updated_at();

alter table public.autopilot_runs enable row level security;

create policy "Users can view their own autopilot runs"
  on public.autopilot_runs for select
  using (user_id = auth.uid() or public.is_moderator(auth.uid()));

create policy "Authenticated users can insert autopilot runs"
  on public.autopilot_runs for insert
  with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

create policy "Service role can update autopilot runs"
  on public.autopilot_runs for update
  using (auth.role() = 'service_role');
