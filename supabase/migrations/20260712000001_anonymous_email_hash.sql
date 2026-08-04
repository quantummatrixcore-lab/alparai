-- Add optional email-hash column for anonymous reporters (DSA Art. 14 + 5651 compliant)
-- Only sha256 hash stored — never raw email. No display, no join key.
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS anonymous_email_hash text;

-- ROLLBACK:
-- ALTER TABLE public.incidents DROP COLUMN IF EXISTS anonymous_email_hash;
