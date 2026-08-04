# F1 - Duplicate Incident Detection

## Implementation Overview

- Enabled `pg_trgm` extension in the database to support fuzzy string similarity matching.
- Created GIN index on `incidents.title` utilizing `gin_trgm_ops` for fast fuzzy string searches.
- Created `public.check_incident_duplicate` SQL helper function:
  - Takes a title string as input.
  - Queries published incidents and returns the maximum similarity score and incident ID.
- Hooked fuzzy matching check into the `submitIncident` workflow action (`src/actions/incidents.ts`):
  - Prior to inserting, runs `check_incident_duplicate` with the incident's title.
  - If the similarity score is `> 0.7`, flags the incident as `is_possible_duplicate = true`.
- Created a database migration at `supabase/migrations/20260727000014_duplicate_incident_detection.sql`.

## Verification

- Unit/Integration Tests: Added test in `tests/actions/incidents.test.ts` to assert that the RPC check is executed and the duplicate flag is appropriately set. Passed successfully.
- Command: `npx vitest run tests/actions/incidents.test.ts` (Passed).

Verified-Against: origin/master
