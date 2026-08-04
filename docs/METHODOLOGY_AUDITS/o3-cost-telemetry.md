# O3 - Cost Telemetry Database Logger & Alarm Integration

## Implementation Overview

- Created `public.cross_audit_runs` database table:
  - Stores audit execution info: `incident_id`, `model`, `tokens_in`, `tokens_out`, `cost_usd`, and `latency_ms`.
  - Configured Row-Level Security: public read access and moderator write access.
  - Created indexes on `created_at` and `incident_id` to optimize rolling-budget metrics queries.
- Patched Cross-Audit Pipeline (`src/lib/ai/cross-audit-engine.ts`):
  - On successful completion of the cross-audit debate pipeline, log model selection, token counts, actual debate COGS cost, and execution duration in the `cross_audit_runs` table.
- Refactored Cost-Alarm Cron Job (`src/app/api/cron/cost-alarm/route.ts`):
  - Queries `cross_audit_runs` directly to calculate rolling daily LLM costs and monthly LLM costs.
  - Aggregates non-LLM infrastructure monthly costs from `finance_monthly_costs`.
  - Triggers the monthly budget alarm or daily rate-limit switch if aggregate costs exceed defined limits ($500 monthly limit, $100 daily limit).
- Created a database migration at `supabase/migrations/20260727000016_cross_audit_runs.sql`.

## Verification

- Unit/Integration Tests: Updated `tests/api/cron/cost-alarm.test.ts` to assert that aggregate monthly and daily cost check fetches from the `cross_audit_runs` table and triggers budget alerts/kill switches. Passed successfully.
- Command: `npx vitest run tests/api/cron/cost-alarm.test.ts` (Passed).

Verified-Against: origin/master
