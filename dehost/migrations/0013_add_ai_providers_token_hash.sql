-- 0013_add_ai_providers_token_hash.sql — Vendor API Token Authentication
-- SHA-256 token hash for authenticating AI vendors submitting defense responses.

ALTER TABLE public.ai_providers
  ADD COLUMN IF NOT EXISTS token_hash text;

CREATE INDEX IF NOT EXISTS idx_ai_providers_token_hash
  ON public.ai_providers (token_hash);

-- ROLLBACK:
-- DROP INDEX IF EXISTS public.idx_ai_providers_token_hash;
-- ALTER TABLE public.ai_providers
--   DROP COLUMN IF EXISTS token_hash;
