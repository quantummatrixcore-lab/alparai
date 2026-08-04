# Cron Re-homing Audit & Evidence (v10.27)

**Date:** 2026-07-22  
**Auditor:** Antigravity (Backend & Data Tier Executor)  
**Status:** VERIFIED & CLOSED (§7/22)

## Overview

All 16 scheduled jobs previously configured on Vercel Crons (or scheduled via GitHub Actions / external pingers) have been fully migrated to Supabase native `pg_cron` + `pg_net` via migration `20260720144730_scheduled_crons_pg_cron.sql`.

Vercel `vercel.json` has been updated to `"crons": []` to prevent duplicate execution and stay within Vercel free-tier execution limits.

## Infrastructure Architecture

- **Extension `pg_cron`**: Manages cron expression schedules directly in PostgreSQL.
- **Extension `pg_net`**: Executes asynchronous HTTP `GET` requests to `https://www.alparai.com/api/cron/...`.
- **Vault Integration**: The helper function `public.trigger_cron_job(cron_path text)` retrieves `cron_secret` from `vault.decrypted_secrets` and attaches it via HTTP `Authorization: Bearer <secret>` and `x-vercel-cron: 1` headers.

## Job Mapping Matrix & Status

| #   | Job Name                       | Schedule       | Endpoint Path                              | Authentication      | Status |
| --- | ------------------------------ | -------------- | ------------------------------------------ | ------------------- | ------ |
| 1   | `translate-backfill-cron`      | `*/10 * * * *` | `/api/cron/translate-backfill`             | Bearer Vault Secret | ACTIVE |
| 2   | `moderation-sla-alarm-cron`    | `0 0 * * *`    | `/api/cron/moderation-sla-alarm`           | Bearer Vault Secret | ACTIVE |
| 3   | `k-provider-preview-cron`      | `0 1 * * *`    | `/api/cron/k-provider-preview`             | Bearer Vault Secret | ACTIVE |
| 4   | `import-incidents-aiaaic-cron` | `0 2 * * *`    | `/api/cron/import-incidents?source=aiaaic` | Bearer Vault Secret | ACTIVE |
| 5   | `k-model-retirement-cron`      | `0 2 * * *`    | `/api/cron/k-model-retirement`             | Bearer Vault Secret | ACTIVE |
| 6   | `import-incidents-aiid-cron`   | `0 3 * * *`    | `/api/cron/import-incidents?source=aiid`   | Bearer Vault Secret | ACTIVE |
| 7   | `process-deletions-cron`       | `0 3 * * *`    | `/api/cron/process-deletions`              | Bearer Vault Secret | ACTIVE |
| 8   | `hard-delete-cron`             | `0 3 * * *`    | `/api/cron/hard-delete`                    | Bearer Vault Secret | ACTIVE |
| 9   | `fetch-external-cron`          | `0 4 * * *`    | `/api/cron/fetch-external`                 | Bearer Vault Secret | ACTIVE |
| 10  | `retro-audit-cron`             | `0 5 * * *`    | `/api/cron/retro-audit`                    | Bearer Vault Secret | ACTIVE |
| 11  | `cost-alarm-cron`              | `0 6 * * *`    | `/api/cron/cost-alarm`                     | Bearer Vault Secret | ACTIVE |
| 12  | `k-weekly-refresh-cron`        | `0 8 * * 0`    | `/api/cron/k-weekly-refresh`               | Bearer Vault Secret | ACTIVE |
| 13  | `kill-metric-cron`             | `0 8 9 8 *`    | `/api/cron/kill-metric`                    | Bearer Vault Secret | ACTIVE |
| 14  | `pivot-check-cron`             | `0 8 1 9 *`    | `/api/cron/pivot-check`                    | Bearer Vault Secret | ACTIVE |
| 15  | `generate-marketing-cron`      | `0 9 * * *`    | `/api/cron/generate-marketing`             | Bearer Vault Secret | ACTIVE |
| 16  | `newsletter-cron`              | `0 10 * * 1`   | `/api/cron/newsletter`                     | Bearer Vault Secret | ACTIVE |

## Verification Queries

To inspect execution history in production, run the following SQL query in Supabase SQL Editor:

```sql
SELECT
    j.jobid,
    j.jobname,
    j.schedule,
    r.status,
    r.return_message,
    r.start_time,
    r.end_time
FROM cron.job j
LEFT JOIN cron.job_run_details r ON j.jobid = r.jobid
ORDER BY r.start_time DESC LIMIT 20;
```

## Conclusion

Item 121 verification is COMPLETE. All scheduled cron jobs are re-homed to `pg_cron` with secure vault authentication and zero reliance on Vercel free-tier cron limits.
