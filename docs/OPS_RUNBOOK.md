# ALPAR AI — Operations & Alerting Runbook

This document defines the alerting rules, threshold matrices, and operations runbooks for the ALPAR AI platform.

---

## Alerting Matrix

| Severity          | Alert Rule Name        | Trigger Condition                                  | Notification Channels            | Response Action                                 |
| ----------------- | ---------------------- | -------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| **P0 (Critical)** | System Down / Outage   | HTTP 5xx rate > 5% (1 min) or DB connection failed | PagerDuty, SMS, email            | Trigger DR Failover Playbook                    |
| **P1 (High)**     | Production Error Spike | Error rate > 2% (5 min)                            | Email (`ops@alparai.com`), Slack | Trigger Auto Rollback Webhook                   |
| **P2 (Warning)**  | Cron Job Failure       | `cron.failed` event from Next.js endpoints         | Slack channel `#ops-warnings`    | Re-run cron manually via CLI / investigate logs |
| **P3 (Info)**     | Latency Spike          | p95 latency > 3 seconds (15 min)                   | Slack                            | Monitor database query execution plans          |

---

## Sentry Alert Rules Configuration

To set up these rules in the Sentry console:

### 1. Error Rate Alert (>2% in 5 minutes)

1. Go to **Alerts** > **Create Alert Rule**.
2. Select **Metric Alert**.
3. Define query: `event.type:error`.
4. Set threshold: **Trigger when error rate exceeds 2% of total transactions** in a **5-minute window**.
5. Actions:
   - Send Email to `ops@alparai.com`.
   - Send Slack notification to workspace `#alerts-production`.
   - Call Webhook: `https://alparai.com/api/webhooks/sentry-alert` (Rollback Hook).

### 2. Cron Failure Alert

1. Go to **Alerts** > **Create Alert Rule**.
2. Select **Issue Alert**.
3. Define conditions:
   - When: _An event is captured by Sentry_
   - If: _The event's message contains "cron failed" or transaction name is under `/api/cron/*` and status is error_
4. Actions:
   - Send Email to `ops@alparai.com`.
   - Send Slack notification to workspace `#alerts-production`.

---

## Manual Triage & Verification Runbook

When a P1/P2 alert is received:

1. Open the Sentry issue detail page link provided in the notification.
2. Verify if the error is originating from client-side runtime or serverless Edge function.
3. If it is an Edge function issue causing >2% error rate, verify that the Vercel auto-rollback webhook was triggered and target deployment was rolled back successfully.
4. Check database connection health using:
   ```bash
   pnpm db:reset --dry-run
   ```
5. Check Upstash Redis rate limiter logs.
