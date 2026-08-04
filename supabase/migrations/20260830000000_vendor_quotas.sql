-- Migration: 20260830000000_vendor_quotas.sql
-- Description: Rebuild vendor_quotas as an admin-only usage ledger with an
-- explicit surrogate primary key. Track tokens/requests/storage usage per
-- vendor per billing period.

create table public.vendor_quotas (
  id uuid primary key default gen_random_uuid(),
  vendor text not null,
  metric text not null
    check (metric in ('tokens', 'requests', 'storage')),
  limit_value numeric,
  used_value numeric,
  unit text,
  period_start date,
  period_end date,
  plan_name text,
  source text not null default 'manual',
  updated_at timestamptz not null default now()
);

create index idx_vendor_quotas_vendor_period
  on public.vendor_quotas (vendor, period_start);

alter table public.vendor_quotas enable row level security;

create policy "Admin can manage vendor_quotas"
  on public.vendor_quotas for all to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
  with check (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- ROLLBACK:
-- DROP TABLE IF EXISTS vendor_quotas;
