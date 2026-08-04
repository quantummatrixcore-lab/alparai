# ALPAR AI - Chaos Engineering Playbook

This document describes the fault injection scenarios, graceful degradation strategies, and chaos engineering drills for the ALPAR AI platform.

## 1. Fault Injection Scenarios & Graceful Degradation

### Scenario 1: Supabase 500 / Database Unreachable

- **Detection:** Database connection pool timeouts, Prisma/Supabase client throws `500 Unreachable`.
- **Mitigation & Graceful Degradation:**
  - Read queries for static pages (legal, methodology) fallback to Next.js static builds or memory-cached dictionaries.
  - Interactive forms (incident submission) show a friendly "Temporary maintenance - your submission is queued locally/retried" error instead of a raw stack trace.
  - Read-only features degrade by showing stale cached states.

### Scenario 2: Upstash Redis Timeout / Downtime

- **Detection:** Upstash REST endpoint timeout or connection refused.
- **Mitigation & Graceful Degradation:**
  - Rate limiting logic is designed to **fail-open** if Redis is unreachable (asserted in `tests/lib/rate-limit.test.ts`). This ensures valid users can still access the platform during a Redis outage.
  - Cache misses are routed directly to the database.

### Scenario 3: Vertex AI API 429 (Rate Limit / Quota Exceeded)

- **Detection:** Vertex API returns `429 Too Many Requests`.
- **Mitigation & Graceful Degradation:**
  - Adapter layers implement exponential backoff retries.
  - If retries fail, the system automatically redirects rating and audit tasks to OpenRouter adapters (GPT-4o-mini / Claude 3.5 Sonnet) as defined in the Model Router.

### Scenario 4: OpenRouter Down / Gateway Timeout

- **Detection:** OpenRouter API returns `504 Gateway Timeout` or `502 Bad Gateway`.
- **Mitigation & Graceful Degradation:**
  - Auditing processes degrade to single-slot Google Gemini evaluations.
  - Incident queue triage falls back to basic deterministic parsing rules or places the item in a "Pending Manual Verification" state.

---

## 2. Chaos Engineering Drill Log

### Drill ID: `DRILL-2026-07-12-REDIS`

- **Date:** 2026-07-12
- **Target Component:** Upstash Redis Rate Limiter
- **Simulation Method:** Stubbed the Redis client to reject all requests with a `Connection refused` exception during a high-load simulation.
- **Expected Behavior:** System continues to process API requests (fails open on rate limiting) while logging the Redis error.
- **Observed Behavior:**
  - `checkRateLimit` logged: `ERROR: rate limit check failed | error=Error: Redis connection failed`
  - Requests completed successfully with HTTP 200.
- **Result:** **PASS** (Graceful degradation verified).
