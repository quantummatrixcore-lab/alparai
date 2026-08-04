-- Migration: 20260828000000_ai_models_weight_class.sql
-- Description: Classify every AI model as open / closed / unknown so the
-- open-vs-closed incident analysis can compare incident rates by weight class.

-- Enum: model_weight_class
create type public.model_weight_class as enum ('open', 'closed', 'unknown');

-- Column on ai_models (defaults to 'unknown' until classified)
alter table public.ai_models
  add column weight_class public.model_weight_class not null default 'unknown';

create index idx_ai_models_weight_class on public.ai_models(weight_class);

-- RLS: table is already protected; re-enable is idempotent and documents intent.
alter table public.ai_models enable row level security;

-- Aggregated stats for the /insights/open-vs-closed page.
-- SECURITY INVOKER so RLS applies to the caller: anon/authenticated users only
-- see published incidents (public.ai_models select is open to everyone).
create or replace function public.get_incident_weight_class_stats()
returns table (weight_class public.model_weight_class, incident_count bigint)
language sql
security invoker
set search_path = public
stable
as $$
  select m.weight_class, count(*)::bigint as incident_count
  from public.incidents i
  join public.ai_models m on m.id = i.ai_model_id
  where i.status = 'published'
  group by m.weight_class
$$;

revoke all on function public.get_incident_weight_class_stats() from public;
grant execute on function public.get_incident_weight_class_stats() to anon, authenticated;

-- ROLLBACK:
-- drop function if exists public.get_incident_weight_class_stats();
-- drop index if exists public.idx_ai_models_weight_class;
-- alter table public.ai_models drop column if exists weight_class;
-- drop type if exists public.model_weight_class;
