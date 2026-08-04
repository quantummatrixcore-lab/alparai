# G5 - Provider Name Redaction Workflow

## Implementation Overview

- Created a database migration at `supabase/migrations/20260727000013_redaction_requests.sql` to track redaction requests:
  - Created `public.redaction_requests` table with checks for `status in ('pending', 'approved', 'rejected')`.
  - Enabled Row-Level Security allowing public read and moderator write permissions.
- Hooked redaction processing into the `process-deletions` daily cron job at `src/app/api/cron/process-deletions/route.ts`:
  - Scans for approved redaction requests where `processed_at` is null.
  - Resolves the target incident and the provider name.
  - Replaces all occurrences of the provider name with asterisks (`***`) in the incident's title, description, and masked fields.
  - Updates the incident and transitions the request's status by setting `processed_at = now()`.

## Verification

- Unit/Integration Tests: Enhanced `tests/api/cron/process-deletions.test.ts` to mock redaction request data and assert that the provider name is correctly replaced with asterisks in the incident. Passed successfully.
- Command: `npx vitest run tests/api/cron/process-deletions.test.ts` (Passed).

Verified-Against: origin/master
