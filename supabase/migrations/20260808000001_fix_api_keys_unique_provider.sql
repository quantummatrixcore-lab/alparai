-- Add unique constraint on provider column for upsert to work
-- Migration 20260720000001 moved PK from provider to id but omitted a unique constraint on provider,
-- causing the saveApiKey upsert to always insert new rows instead of updating existing ones.

CREATE UNIQUE INDEX IF NOT EXISTS api_keys_provider_key ON public.api_keys (provider);

-- ROLLBACK:
-- DROP INDEX IF EXISTS public.api_keys_provider_key;
