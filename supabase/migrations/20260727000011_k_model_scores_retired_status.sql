-- Migration: Add retired status to k_model_scores and deprecated_at to ai_models
-- Description: Adds columns to support model deprecation and retirement workflows.

alter table public.ai_models add column deprecated_at timestamp with time zone;

alter table public.k_model_scores add column status text not null default 'active' check (status in ('active', 'retired'));

-- ROLLBACK:
-- alter table public.k_model_scores drop column if exists status;
-- alter table public.ai_models drop column if exists deprecated_at;
