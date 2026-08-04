# K15 - Weekly Rating Refresh Cron

## Implementation Overview

- Created a weekly cron job route at `src/app/api/cron/k-weekly-refresh/route.ts` running every Sunday at 08:00 UTC.
- Registered the cron job in `vercel.json`.
- Implemented the scoring recalculation algorithm:
  - Fetches all active AI models and K-BENCHMARK categories.
  - Resolves base scores from `k_model_scores`. Defaults to `80` if not present.
  - Queries all published incidents from the last 90 days.
  - Computes incident severity penalties for the **Ethics & Safety (K5)** category:
    - Critical severity: -5.0 points
    - High severity: -3.0 points
    - Medium severity: -1.0 points
    - Low severity: -0.5 points
    - Incident penalty is adjusted by an engagement factor: `1 + 0.1 * ln(1 + upvotes_count)`.
  - Recalculates the Wilson score intervals using `score ± 3` (clamped between 25 and 100).
  - Bulk upserts the recalculated scores in `k_model_scores`.
  - Updates `last_audited_at` to the current timestamp.

## Verification

- Unit/Integration Tests: Created `tests/api/cron/k-weekly-refresh.test.ts`. Verified the penalty calculation logic and the default score initialization. Passed successfully.
- Command: `npx vitest run tests/api/cron/k-weekly-refresh.test.ts` (Passed).

Verified-Against: origin/master
