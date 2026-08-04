# ALPAR AI — Scheduled Cron Jobs Re-homing Audit (Item 121)

Following the removal of crons from `vercel.json` due to Hobby plan limitations, all 16 scheduled tasks have been migrated to a centralized GitHub Actions dispatcher workflow.

## Cron Mapping & Triggers

| Job Path                                   | Original Schedule | New GitHub Actions Schedule / Dispatch Trigger       | Status |
| ------------------------------------------ | ----------------- | ---------------------------------------------------- | ------ |
| `/api/cron/translate-backfill`             | `*/10 * * * *`    | Runs directly every 10 minutes step                  | Active |
| `/api/cron/moderation-sla-alarm`           | `0 0 * * *`       | Hourly trigger (Hour = 00)                           | Active |
| `/api/cron/k-provider-preview`             | `0 1 * * *`       | Hourly trigger (Hour = 01)                           | Active |
| `/api/cron/import-incidents?source=aiaaic` | `0 2 * * *`       | Hourly trigger (Hour = 02)                           | Active |
| `/api/cron/k-model-retirement`             | `0 2 * * *`       | Hourly trigger (Hour = 02)                           | Active |
| `/api/cron/import-incidents?source=aiid`   | `0 3 * * *`       | Hourly trigger (Hour = 03)                           | Active |
| `/api/cron/process-deletions`              | `0 3 * * *`       | Hourly trigger (Hour = 03)                           | Active |
| `/api/cron/hard-delete`                    | `30 3 * * *`      | Hourly trigger (Hour = 03)                           | Active |
| `/api/cron/fetch-external`                 | `0 4 * * *`       | Hourly trigger (Hour = 04)                           | Active |
| `/api/cron/retro-audit`                    | `0 5 * * *`       | Hourly trigger (Hour = 05)                           | Active |
| `/api/cron/cost-alarm`                     | `0 6 * * *`       | Hourly trigger (Hour = 06)                           | Active |
| `/api/cron/k-weekly-refresh`               | `0 8 * * 0`       | Hourly trigger (Hour = 08 && DOW = Sunday)           | Active |
| `/api/cron/kill-metric`                    | `0 8 9 8 *`       | Hourly trigger (Hour = 08 && DOM = 09 && Month = 08) | Active |
| `/api/cron/pivot-check`                    | `0 8 1 9 *`       | Hourly trigger (Hour = 08 && DOM = 01 && Month = 09) | Active |
| `/api/cron/generate-marketing`             | `0 9 * * *`       | Hourly trigger (Hour = 09)                           | Active |
| `/api/cron/newsletter`                     | `0 10 * * 1`      | Hourly trigger (Hour = 10 && DOW = Monday)           | Active |

## Verification & Execution

1. **Workflow Location**: `.github/workflows/scheduled-crons.yml`
2. **Authentication**: Uses `secrets.CRON_SECRET` mapped to the `Authorization` header as `Bearer ${token}`.
3. **Manual Trigger**: The workflow is equipped with `workflow_dispatch` allowing manual execution from the GitHub Actions tab.

## Verification & Execution Results (Item 121)

> [!CAUTION]
> **FAILED: `CRON_SECRET` is missing and GitHub Actions billing limit reached.**
>
> - `gh secret list` confirms that **no repository secrets exist** (including `CRON_SECRET`).
> - The GitHub Actions run failed to execute because "recent account payments have failed or your spending limit needs to be increased."
> - **Action Required:** The Founder must add `CRON_SECRET` to GitHub Secrets and resolve the GitHub billing limitation before these cron jobs can actively dispatch.
