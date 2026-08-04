-- Create finance_revenue_metrics table
create table if not exists public.finance_revenue_metrics (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  mrr_usd numeric(12, 2) not null default 0.00,
  arr_usd numeric(12, 2) not null default 0.00,
  active_subs integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.finance_revenue_metrics enable row level security;

-- Policies: only admins/ceo can read and write
create policy "Allow read for admins/ceo" on public.finance_revenue_metrics
  for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo')
    )
  );

create policy "Allow write for admins/ceo" on public.finance_revenue_metrics
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'ceo')
    )
  );

-- Note: Mock seed data removed per Item #13 cleanup protocol.
-- Table remains empty until real revenue data is ingested via Stripe integration.
