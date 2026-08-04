-- =============================================================================
-- ALPAR AI — Initial Schema (v1.0.0)
-- =============================================================================
-- Trust infrastructure for AI accountability. Community-driven incident
-- reporting platform inspired by Trustpilot / sikayetvar.com model.

create extension if not exists pgcrypto;
--
-- Design principles:
--   1. Platform is a HOST (intermediary), not a publisher. Liability is on users.
--   2. KVKK / GDPR compliant: explicit consent, audit log, right to erasure.
--   3. PII is masked server-side before storage.
--   4. Anonymous-by-default submissions are supported.
--   5. AI providers have a right to respond (counter-statement).
-- =============================================================================

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================
create type public.user_role as enum ('user', 'moderator', 'admin', 'ceo');
create type public.incident_status as enum (
  'pending_review',  -- awaiting moderator approval
  'published',       -- live on platform
  'rejected',        -- moderator rejected
  'archived',        -- old / resolved
  'takedown'         -- removed after legal takedown
);
create type public.incident_severity as enum ('low', 'medium', 'high', 'critical');
create type public.incident_category as enum (
  'hallucination',
  'bias',
  'privacy',
  'security',
  'misinformation',
  'harassment',
  'manipulation',
  'inaccessibility',
  'copyright',
  'other'
);
create type public.suggestion_status as enum ('open', 'under_review', 'planned', 'in_progress', 'completed', 'declined');
create type public.takedown_status as enum ('received', 'under_review', 'approved', 'rejected', 'escalated');
create type public.evidence_kind as enum ('screenshot', 'video', 'document', 'url', 'transcript', 'other');

-- ============================================================================
-- USERS
-- ============================================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  role public.user_role not null default 'user',
  is_verified boolean not null default false,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_role on public.users(role);
create index idx_users_created_at on public.users(created_at desc);

-- ============================================================================
-- AI PROVIDERS (companies / orgs)
-- ============================================================================
create table public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                -- e.g. 'xai', 'openai', 'anthropic', 'google', 'meta'
  name text not null,                       -- 'xAI', 'OpenAI', etc.
  description text,
  website_url text,
  contact_email text,                       -- for responsible disclosure
  logo_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_ai_providers_slug on public.ai_providers(slug);

-- ============================================================================
-- AI MODELS
-- ============================================================================
create table public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_providers(id) on delete cascade,
  name text not null,                       -- 'Grok 3', 'GPT-4o', 'Claude 3.5 Sonnet'
  version text,                             -- '2024-08-06', etc.
  released_at date,
  status text not null default 'active' check (status in ('active','deprecated','beta')),
  created_at timestamptz not null default now()
);

create index idx_ai_models_provider on public.ai_models(provider_id);

-- ============================================================================
-- INCIDENTS — core entity
-- ============================================================================
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  is_anonymous boolean not null default true,

  -- Content
  title text not null check (char_length(title) between 8 and 200),
  description text not null check (char_length(description) <= 10000),
  -- PII-masked versions of above (PII Guardian output)
  title_masked text,
  description_masked text,

  -- Categorization
  ai_provider_id uuid references public.ai_providers(id) on delete set null,
  ai_model_id uuid references public.ai_models(id) on delete set null,
  category public.incident_category not null default 'other',
  severity public.incident_severity not null default 'medium',
  incident_date date,                       -- when the AI incident actually happened
  location_country text,                    -- ISO 3166-1 alpha-2
  language text not null default 'en',

  -- Status
  status public.incident_status not null default 'pending_review',
  moderator_id uuid references public.users(id) on delete set null,
  moderator_notes text,
  reviewed_at timestamptz,

  -- Engagement
  views_count integer not null default 0,
  upvotes_count integer not null default 0,
  shares_count integer not null default 0,
  comments_count integer not null default 0,

  -- Metadata
  source_url text,                          -- optional: where the incident occurred
  ip_hash text,                             -- hashed IP for abuse detection (KVKK-safe)
  user_agent text,

  -- Search
  search_vector tsvector,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_incidents_status on public.incidents(status);
create index idx_incidents_provider on public.incidents(ai_provider_id);
create index idx_incidents_model on public.incidents(ai_model_id);
create index idx_incidents_category on public.incidents(category);
create index idx_incidents_severity on public.incidents(severity);
create index idx_incidents_created_at on public.incidents(created_at desc);
create index idx_incidents_user_id on public.incidents(user_id);
create index idx_incidents_search on public.incidents using gin(search_vector);
create index idx_incidents_title_trgm on public.incidents using gin(title gin_trgm_ops);

-- ============================================================================
-- EVIDENCE — files attached to incidents
-- ============================================================================
create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  kind public.evidence_kind not null default 'screenshot',
  file_path text not null,                  -- /evidence/.../file.jpg or supabase storage path
  file_name text not null,
  file_size_bytes bigint,
  mime_type text,
  sha256_hash text,                         -- integrity verification
  width_px integer,
  height_px integer,
  contains_pii boolean not null default false,
  pii_categories text[],                    -- e.g. ARRAY['face','id_document']
  uploaded_at timestamptz not null default now()
);

create index idx_evidence_incident on public.evidence(incident_id);
create index idx_evidence_hash on public.evidence(sha256_hash);

-- ============================================================================
-- AI PROVIDER RESPONSES — counter-statements
-- ============================================================================
create table public.ai_provider_responses (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  ai_provider_id uuid not null references public.ai_providers(id) on delete cascade,
  response_text text not null check (char_length(response_text) <= 10000),
  responder_name text not null,
  responder_role text,                      -- 'Head of Trust & Safety', etc.
  responder_email text not null,            -- verified
  is_official boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_responses_incident on public.ai_provider_responses(incident_id);
create index idx_responses_published on public.ai_provider_responses(is_published, published_at desc);

-- ============================================================================
-- SUGGESTIONS — community feature requests
-- ============================================================================
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  title text not null check (char_length(title) between 8 and 200),
  description text not null check (char_length(description) <= 5000),
  category text not null default 'feature', -- 'feature' | 'improvement' | 'bug' | 'content' | 'integration'
  status public.suggestion_status not null default 'open',
  upvotes_count integer not null default 0,
  comments_count integer not null default 0,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_suggestions_status on public.suggestions(status);
create index idx_suggestions_category on public.suggestions(category);
create index idx_suggestions_created_at on public.suggestions(created_at desc);

-- ============================================================================
-- SUGGESTION VOTES
-- ============================================================================
create table public.suggestion_votes (
  user_id uuid not null references public.users(id) on delete cascade,
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, suggestion_id)
);

-- ============================================================================
-- CONSENT LOG — KVKK / GDPR compliance
-- ============================================================================
create table public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  consent_type text not null,                -- 'submission_truthfulness', 'anonymous_publication', 'data_processing', 'terms_of_service', 'age_18_plus'
  consent_text_snapshot text not null,       -- exact text user agreed to
  granted boolean not null,
  ip_hash text,
  user_agent text,
  related_entity_type text,                  -- 'incident' | 'suggestion' | 'auth'
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create index idx_consent_user on public.consent_log(user_id);
create index idx_consent_type on public.consent_log(consent_type);
create index idx_consent_created on public.consent_log(created_at desc);

-- ============================================================================
-- TAKEDOWN REQUESTS
-- ============================================================================
create table public.takedown_requests (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  requester_organization text,
  reason text not null check (char_length(reason) >= 30 and char_length(reason) <= 5000),
  legal_basis text,                          -- 'copyright' | 'defamation' | 'gdpr_right_to_erasure' | 'court_order' | 'other'
  evidence_url text,
  status public.takedown_status not null default 'received',
  assigned_moderator_id uuid references public.users(id) on delete set null,
  resolution_notes text,
  resolved_at timestamptz,
  sla_due_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index idx_takedown_status on public.takedown_requests(status);
create index idx_takedown_sla on public.takedown_requests(sla_due_at) where status in ('received','under_review');
create index idx_takedown_incident on public.takedown_requests(incident_id);

-- ============================================================================
-- AUDIT LOG — administrative actions
-- ============================================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,                      -- 'incident.approve', 'user.ban', 'role.assign', etc.
  entity_type text not null,
  entity_id uuid not null,
  before_data jsonb,
  after_data jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index idx_audit_actor on public.audit_log(actor_id);
create index idx_audit_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_created on public.audit_log(created_at desc);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_incidents_updated_at before update on public.incidents
  for each row execute function public.set_updated_at();

create trigger trg_suggestions_updated_at before update on public.suggestions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- AUTH → USERS SYNC
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'locale', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- TRIGGER: Maintain incidents.search_vector
-- ============================================================================
create or replace function public.tg_incidents_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple'::regconfig, coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(new.category::text,'')), 'C');
  return new;
end;
$$;

drop trigger if exists trg_incidents_search_vector on public.incidents;
create trigger trg_incidents_search_vector
  before insert or update of title, description, category on public.incidents
  for each row execute function public.tg_incidents_search_vector();

create index if not exists idx_incidents_search_vector
  on public.incidents using gin(search_vector);

-- ============================================================================
-- HELPER: IS_MODERATOR
-- ============================================================================
create or replace function public.is_moderator(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = uid and role in ('moderator', 'admin', 'ceo')
  );
$$;

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = uid and role in ('admin', 'ceo')
  );
$$;

-- ============================================================================
-- SEED: Common AI Providers
-- ============================================================================
insert into public.ai_providers (slug, name, description, website_url, contact_email, is_verified) values
  ('xai', 'xAI', 'Artificial intelligence company founded by Elon Musk.', 'https://x.ai', 'legal@x.ai', true),
  ('openai', 'OpenAI', 'Creator of GPT, DALL-E, Sora, ChatGPT.', 'https://openai.com', 'legal@openai.com', true),
  ('anthropic', 'Anthropic', 'Creator of Claude AI assistant.', 'https://anthropic.com', 'legal@anthropic.com', true),
  ('google', 'Google DeepMind', 'Creator of Gemini, Bard, PaLM.', 'https://deepmind.google', 'legal@google.com', true),
  ('meta', 'Meta AI', 'Creator of Llama models.', 'https://ai.meta.com', 'legal@meta.com', true),
  ('mistral', 'Mistral AI', 'Open-weight frontier models from France.', 'https://mistral.ai', 'contact@mistral.ai', true),
  ('cohere', 'Cohere', 'Enterprise AI platform.', 'https://cohere.com', 'legal@cohere.com', false),
  ('perplexity', 'Perplexity AI', 'AI-powered answer engine.', 'https://perplexity.ai', 'support@perplexity.ai', false),
  ('other', 'Other', 'Provider not listed.', null, null, false);

-- Seed xAI models (for the Grok Passport case)
insert into public.ai_models (provider_id, name, version, released_at, status)
select id, 'Grok 3', '2024-2025', '2024-12-01', 'active' from public.ai_providers where slug = 'xai';
