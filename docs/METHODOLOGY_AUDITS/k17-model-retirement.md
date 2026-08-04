# K17 - Model Retirement Policy

## Implementation Overview

- Created a database migration at `supabase/migrations/20260727000011_k_model_scores_retired_status.sql` to support retirement tracking:
  - Added `deprecated_at` timestamp column to `public.ai_models`.
  - Added `status` column to `public.k_model_scores` (with values `'active'` and `'retired'`, defaulting to `'active'`).
- Created a retirement cron job route at `src/app/api/cron/k-model-retirement/route.ts` running daily:
  - Fetches the active models from the local database.
  - Fetches the live OpenRouter models list from `https://openrouter.ai/api/v1/models` (public endpoint).
  - Identifies active OpenRouter models in our database that are missing from the live OpenRouter API, marking them as `'deprecated'` and setting `deprecated_at = now()`.
  - Scans for models that have been deprecated for >= 60 days.
  - Updates the corresponding scores in `k_model_scores` to `status = 'retired'`.
- Registered the cron job in `vercel.json`.
- Implemented UI Badge:
  - Updated `src/app/[locale]/ratings/page.tsx` to query the `status` column from `k_model_scores`.
  - Displays a "Retired" / "Emekli" badge next to any retired model in the ratings leaderboard.
  - Added translation keys to `messages/en.json` and `messages/tr.json`.

## Verification

- Unit/Integration Tests: Created `tests/api/cron/k-model-retirement.test.ts`. Verified the deprecation detection and the 60-day retirement progression. Passed successfully.
- Command: `npx vitest run tests/api/cron/k-model-retirement.test.ts` (Passed).

Verified-Against: origin/master
