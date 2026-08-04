-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Alter api_keys table to add tier and client_type
ALTER TABLE public.api_keys 
  ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('free', 'developer', 'enterprise')) DEFAULT 'developer',
  ADD COLUMN IF NOT EXISTS client_type text CHECK (client_type IN ('internal', 'external')) DEFAULT 'external';

-- Update existing rows based on provider values to set tier and client_type
UPDATE public.api_keys 
  SET tier = 'free', client_type = 'external' 
  WHERE provider = 'client_free';

UPDATE public.api_keys 
  SET tier = 'developer', client_type = 'external' 
  WHERE provider = 'client_developer';

UPDATE public.api_keys 
  SET tier = 'enterprise', client_type = 'external' 
  WHERE provider = 'client_enterprise';

-- For internal LLM keys
UPDATE public.api_keys 
  SET tier = 'enterprise', client_type = 'internal' 
  WHERE provider NOT IN ('client_free', 'client_developer', 'client_enterprise');

-- Hash ONLY the external client keys
UPDATE public.api_keys
  SET api_key = encode(digest(api_key, 'sha256'), 'hex')
  WHERE client_type = 'external'
    AND (length(api_key) <> 64 OR api_key !~ '^[0-9a-f]{64}$');

-- ROLLBACK:
-- DROP EXTENSION IF EXISTS pgcrypto; -- only if no other tables depend on it
-- ALTER TABLE public.api_keys DROP COLUMN IF EXISTS tier, DROP COLUMN IF EXISTS client_type;
-- NOTE: sha256 hashing is irreversible — original plaintext keys cannot be restored.
-- To recover, re-insert keys from secure backup or re-issue via admin UI.
