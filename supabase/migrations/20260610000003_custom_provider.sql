-- Migration: Support Custom Provider & Model Names (2026-06-10)
-- Allows users to submit incidents about any AI provider/model, not just
-- pre-vetted ones. Custom names are stored alongside null FKs.

alter table public.incidents
  add column if not exists provider_custom_name text,
  add column if not exists model_custom_name text;

alter table public.incidents
  alter column ai_provider_id drop not null,
  alter column ai_model_id drop not null;

alter table public.incidents
  add constraint if not exists incidents_provider_check
    check (
      (ai_provider_id is not null) or
      (provider_custom_name is not null and length(btrim(provider_custom_name)) >= 2)
    );

alter table public.incidents
  add constraint if not exists incidents_model_check
    check (
      (ai_model_id is not null) or
      (model_custom_name is not null and length(btrim(model_custom_name)) >= 1) or
      (ai_provider_id is null)
    );

create index if not exists idx_incidents_provider_custom
  on public.incidents (lower(provider_custom_name))
  where provider_custom_name is not null;

create index if not exists idx_incidents_model_custom
  on public.incidents (lower(model_custom_name))
  where model_custom_name is not null;

comment on column public.incidents.provider_custom_name is
  'User-entered provider name when not in the verified providers list';

comment on column public.incidents.model_custom_name is
  'User-entered model name when not in the verified models list';
