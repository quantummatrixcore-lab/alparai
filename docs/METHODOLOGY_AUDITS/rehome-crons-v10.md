# Evidence: Cron Re-homing Audit (Item 121)

This audit documents the successful migration of scheduled cron jobs from the blocked GitHub Actions environment to native Supabase database scheduling using `pg_cron` and `pg_net`.

## 1. Migration Rationale

GitHub Actions schedule execution is blocked on the repository due to unresolved payment/billing issues:

> _The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings_

To prevent critical jobs (such as ingestion, auto-translation, marketing draft generation, and newsletters) from staying silently dead, scheduling has been re-homed to a native, self-contained database scheduler using the `pg_cron` and `pg_net` extensions on the Supabase production project (`azszpzyvxjduhemkjsdh`).

---

## 2. Authentication and Secret Storage

To maintain the existing security layer:

1. A cryptographically strong `CRON_SECRET` was generated (`fc7ba6b61c...`).
2. Added to Vercel environment variables for `production` and `preview` environments.
3. Added to Supabase Vault via `vault.create_secret()` with name `cron_secret` to keep credentials out of version-controlled files.
4. Created a database function `public.trigger_cron_job(cron_path text)` with `SECURITY DEFINER` privileges. It fetches the secret from Vault at runtime and performs an asynchronous HTTP GET request to `https://www.alparai.com` + path using `pg_net`'s `net.http_get()` with a 30-second timeout.

---

## 3. Scheduled Jobs Mapping

All 16 jobs defined in the GitHub Actions workflow have been successfully registered under `pg_cron` in the `cron.jobs` table:

| Job Name                       | Cron Expression | Target Endpoint                            |
| ------------------------------ | --------------- | ------------------------------------------ |
| `translate-backfill-cron`      | `*/10 * * * *`  | `/api/cron/translate-backfill`             |
| `moderation-sla-alarm-cron`    | `0 0 * * *`     | `/api/cron/moderation-sla-alarm`           |
| `k-provider-preview-cron`      | `0 1 * * *`     | `/api/cron/k-provider-preview`             |
| `import-incidents-aiaaic-cron` | `0 2 * * *`     | `/api/cron/import-incidents?source=aiaaic` |
| `k-model-retirement-cron`      | `0 2 * * *`     | `/api/cron/k-model-retirement`             |
| `import-incidents-aiid-cron`   | `0 3 * * *`     | `/api/cron/import-incidents?source=aiid`   |
| `process-deletions-cron`       | `0 3 * * *`     | `/api/cron/process-deletions`              |
| `hard-delete-cron`             | `0 3 * * *`     | `/api/cron/hard-delete`                    |
| `fetch-external-cron`          | `0 4 * * *`     | `/api/cron/fetch-external`                 |
| `retro-audit-cron`             | `0 5 * * *`     | `/api/cron/retro-audit`                    |
| `cost-alarm-cron`              | `0 6 * * *`     | `/api/cron/cost-alarm`                     |
| `k-weekly-refresh-cron`        | `0 8 * * 0`     | `/api/cron/k-weekly-refresh`               |
| `kill-metric-cron`             | `0 8 9 8 *`     | `/api/cron/kill-metric`                    |
| `pivot-check-cron`             | `0 8 1 9 *`     | `/api/cron/pivot-check`                    |
| `generate-marketing-cron`      | `0 9 * * *`     | `/api/cron/generate-marketing`             |
| `newsletter-cron`              | `0 10 * * 1`    | `/api/cron/newsletter`                     |

---

## 4. Verification and Live Run Evidence

A manual run of `translate-backfill-cron` was triggered on the remote database using the newly deployed function:

```sql
SELECT public.trigger_cron_job('/api/cron/translate-backfill');
```

Response status checking from the `public.cron_job_logs` table confirmed successful execution and database logging:

```json
[
  {
    "id": "24be88a0-b25a-42d8-a9c4-1807e7da1a02",
    "cron_name": "translate-backfill",
    "started_at": "2026-07-20 15:00:47.191+00",
    "completed_at": "2026-07-20 15:01:17.821+00",
    "status": "success",
    "error_message": null,
    "execution_metadata": {
      "status_code": 200
    }
  }
]
```

**Status:** PASS ✅
