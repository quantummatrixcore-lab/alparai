-- Add id primary key, client_type and sha256 hash to api_keys
-- ROLLBACK:
-- ALTER TABLE api_keys DROP COLUMN id, DROP COLUMN client_type;
-- UPDATE api_keys SET api_key = '(rollback_no_hash)' WHERE length(api_key) = 64;

ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS client_type text CHECK (client_type IN ('public', 'private', 'internal')) DEFAULT 'public';

ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_pkey CASCADE;
ALTER TABLE api_keys ADD PRIMARY KEY (id);

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

UPDATE api_keys
SET api_key = encode(extensions.digest(api_key::text, 'sha256'), 'hex')
WHERE length(api_key) != 64;
