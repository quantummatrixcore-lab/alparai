# WORK-ORDER-009-FIX3 — storage schema stub (staging-proven, 2026-09-13)

Staging proof (fresh DB, PG 16.15, ON_ERROR_STOP=1): 0001 now progresses past auth (FIX2 held) and aborts at `insert into storage.buckets …` — `relation "storage.buckets" does not exist`. No vanilla-PG `storage` schema exists.

## Fix (in 0001, next to the auth stub — same documented pattern)

Add a Supabase-storage-compatible stub. Derive the EXACT column list from this file's own references (self-consistency, no guessing):

- Must satisfy: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)` + `select … (metadata->>'size') … from storage.objects` + every live (uncommented) `CREATE/DROP POLICY … ON storage.objects` USING/WITH CHECK clause in the file.
- Minimal shape:

```sql
-- DeHost storage stub (replaces Supabase storage schema; mapped to real object store at deploy)
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

- If any file reference needs a column outside this set, ADD it (file is the spec) — do not touch the referencing statements.

## Acceptance (unchanged per WORK-ORDER-009)

Fresh staging DB, both files exit 0, server counts, seed roundtrip, `## WO-009-FIX3` entry FIRST. Numbers-honesty law applies. Freeze files during audit.
