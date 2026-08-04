# G4 - Data Retention Policy Enforcement

## Implementation Overview

- Created `docs/DATA_RETENTION.md` defining table-level retention rules (raw evidence 24 months, audit logs 5 years, PII 12 months, deleted users 30 days).
- Created a database migration at `supabase/migrations/20260727000012_data_retention_policies.sql` establishing the reference schema:
  - Created `public.data_retention_policies` table with row-level security enabled.
  - Initialized a default policy for every single table in the `public` schema dynamically using a PostgreSQL `DO` block.
- Implemented RLS policies allowing public read access and moderator write access.

## Verification

- Unit/Integration Tests: Created `tests/lib/data-retention.test.ts`. Verified fetching data retention policies. Passed successfully.
- Command: `npx vitest run tests/lib/data-retention.test.ts` (Passed).

Verified-Against: origin/master
