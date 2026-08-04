# F2 - IP and Device Submission Throttle

## Implementation Overview

- Created `public.submission_attempts` database table:
  - Tracks submissions using hashed IPs (`ip_hash`).
  - Enabled Row-Level Security allowing public insert and moderator read/write access.
  - Created a GIN/B-tree index on `ip_hash` and `created_at` to optimize counting queries.
- Hooked rate limit auditing into the `submitIncident` action:
  - Inserts a record into `submission_attempts` on every submission attempt.
  - Before invoking AI auto-moderation, checks the count of submission attempts for the current IP in the last 24 hours.
  - If the count is `> 10`, it flags the submission as suspicious, bypasses the LLM auto-moderation pipeline, sets the status to `pending_review`, and adds moderator notes: `"Bypassed AI moderation. Exceeded submission attempts limit (>10 attempts in 24h)."`
- Created a database migration at `supabase/migrations/20260727000015_submission_attempts.sql`.

## Verification

- Unit/Integration Tests: Added test in `tests/actions/incidents.test.ts` to assert that when the number of attempts exceeds 10, the AI moderation is bypassed and the incident is retained in `pending_review` for manual moderation. Passed successfully.
- Command: `npx vitest run tests/actions/incidents.test.ts` (Passed).

Verified-Against: origin/master
