-- ============================================================================
-- 20260903000001_whistleblower_zkp_columns.sql
--
-- Adds Zero-Knowledge Proof (ZKP) cryptographic commitment, nullifier,
-- zero-day risk classification, and proof metadata to whistleblower_submissions.
-- Ensures strict cryptographic nullifier uniqueness (anti-replay / anti-double-spend).
-- ============================================================================

alter table public.whistleblower_submissions
  add column if not exists zkp_commitment text,
  add column if not exists nullifier_hash text,
  add column if not exists proof_metadata jsonb default '{}'::jsonb,
  add column if not exists zero_day_risk text check (zero_day_risk in ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE')) default 'NONE';

-- Create unique index on nullifier_hash to guarantee ZKP nullifier cannot be replayed
create unique index if not exists idx_whistleblower_nullifier_hash
  on public.whistleblower_submissions (nullifier_hash)
  where nullifier_hash is not null;

-- Index for speedy commitment and status lookup by moderators
create index if not exists idx_whistleblower_zkp_commitment
  on public.whistleblower_submissions (zkp_commitment)
  where zkp_commitment is not null;

-- Refresh comments for schema documentation
comment on column public.whistleblower_submissions.zkp_commitment is 'ZKP SHA-256 cryptographic commitment binding payload and secrets';
comment on column public.whistleblower_submissions.nullifier_hash is 'Cryptographic nullifier hash to prevent double-spending without revealing identity';
comment on column public.whistleblower_submissions.proof_metadata is 'Client proof token and structural verification metadata';
comment on column public.whistleblower_submissions.zero_day_risk is 'Automated zero-day heuristic severity classification (CRITICAL, HIGH, MEDIUM, LOW, NONE)';

-- ROLLBACK:
-- drop index if exists public.idx_whistleblower_zkp_commitment;
-- drop index if exists public.idx_whistleblower_nullifier_hash;
-- alter table public.whistleblower_submissions
--   drop column if exists zkp_commitment,
--   drop column if exists nullifier_hash,
--   drop column if exists proof_metadata,
--   drop column if exists zero_day_risk;