create table public.vendor_quotas (
  vendor text not null
    check (vendor in ('github_actions', 'vercel', 'supabase', 'claude_pro', 'resend', 'upstash')),
  metric text not null
    check (metric in ('minutes', 'bandwidth_gb', 'db_size_gb', 'messages')),
  limit_value numeric,
  used_value numeric,
  unit text not null,
  period_start date not null,
  period_end date not null,
  plan_name text,
  source text not null default 'manual'
    check (source in ('api', 'manual')),
  updated_at timestamptz not null default now(),
  primary key (vendor, metric, period_start),
  constraint vendor_quotas_period_valid check (period_end >= period_start)
);

create index idx_vendor_quotas_period on public.vendor_quotas(period_start);

alter table public.vendor_quotas enable row level security;

create policy "Moderators can manage vendor_quotas"
  on public.vendor_quotas for all to authenticated
  using (public.is_moderator(auth.uid()))
  with check (public.is_moderator(auth.uid()));

-- ROLLBACK:
-- drop table if exists public.vendor_quotas;
