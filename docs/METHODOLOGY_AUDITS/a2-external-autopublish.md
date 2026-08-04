# A2 - External Auto-Publish & Deduplication

## Implementation Overview

- Updated `src/app/api/cron/fetch-external/route.ts` to automatically publish incidents originating from domains in the `TRUSTED_ALLOWLIST`.
- `TRUSTED_ALLOWLIST`: `technologyreview.mit.edu`, `404media.co`, `lastweekinai.substack.com`, `theregister.com`.
- Ran a one-time migration (`ops/a2-migrate.mjs`) to update the 97 pending records. 33 existing records matched the allowlist and were automatically transitioned from `pending` to `published`.

## Verification

- Run `pnpm test` (Unit/Integration): Passes (No regressions in cron execution).
- Data verification: `SELECT id FROM external_incidents_queue WHERE status = 'published';` returns 33 records.

## PII Guardian Check

- Unchanged. External sources still pass through PII redaction pipeline downstream if displayed on UI or indexed.

Verified-Against: origin/master
