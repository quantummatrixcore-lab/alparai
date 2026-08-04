# Vault Key Rotation Policy

**Effective**: 2026-07-24  
**Mandate**: Every secret MUST be rotated every 90 days or immediately after a compromise.

## Rotation Schedule

| Secret                     | Rotation Period | Next Due   | Owner |
| -------------------------- | --------------- | ---------- | ----- |
| SUPABASE_SERVICE_ROLE_KEY  | 90 days         | 2026-10-22 | Infra |
| SUPABASE_DB_PASSWORD       | 90 days         | 2026-10-22 | Infra |
| VERCEL_TOKEN               | 90 days         | 2026-10-22 | Infra |
| RESEND_API_KEY             | 90 days         | 2026-10-22 | Infra |
| OPENROUTER_API_KEY         | 90 days         | 2026-10-22 | Infra |
| UPSTASH_REDIS_REST_TOKEN   | 90 days         | 2026-10-22 | Infra |
| GOOGLE_SERVICE_ACCOUNT_KEY | 90 days         | 2026-10-22 | Infra |

## Enforcement

- CI (security.yml) checks `git log --diff-filter=A --name-only --since="90 days ago"` and fails if no rotation evidence is found.
- Rotation that fails a smoke test (see [TOKEN_ROTATION_CHECKLIST.md](../TOKEN_ROTATION_CHECKLIST.md#-production-smoke-test-runbook)) is rolled back immediately.
- Emergency rotation (compromise) bypasses the schedule — rotate and run the full smoke test within 1 hour.

## Procedure

Follow [TOKEN_ROTATION_CHECKLIST.md](../TOKEN_ROTATION_CHECKLIST.md) for step-by-step rotation instructions for each secret.
