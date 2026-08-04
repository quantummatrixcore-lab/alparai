# SLI/SLO Definitions

**Date**: 2026-07-12

## Service Level Indicators (SLIs)

| SLI                      | Measurement                                   | Source              |
| ------------------------ | --------------------------------------------- | ------------------- |
| Availability             | % of successful HTTP responses (status < 500) | Vercel Analytics    |
| Latency p50              | Median response time (ms)                     | Vercel Analytics    |
| Latency p95              | 95th percentile response time (ms)            | Vercel Analytics    |
| Latency p99              | 99th percentile response time (ms)            | Vercel Analytics    |
| Error rate               | % of 5xx responses                            | Vercel Analytics    |
| Cross-audit success rate | % of completed audit runs without failure     | Sentry / audit logs |

## Service Level Objectives (SLOs)

| SLI                      | Target   | Measurement Window |
| ------------------------ | -------- | ------------------ |
| Availability             | ≥ 99.9%  | 30 days            |
| Latency p50              | < 200ms  | 30 days            |
| Latency p95              | < 500ms  | 30 days            |
| Latency p99              | < 2000ms | 30 days            |
| Error rate               | < 0.1%   | 30 days            |
| Cross-audit success rate | ≥ 95%    | 30 days            |

## Dashboard

Available at `/admin/slo-dashboard`. Reads 30-day window.

## Burn Rate

- Error budget: 0.1% over 30 days
- Burn rate ≥ 1 (consuming budget faster than expected) → alert
- Burn rate ≥ 3 (consuming 3× budget) → urgent incident

## Exclusions

- Scheduled maintenance (announced via `/status`)
- Pre-deploy staging/preview deployments
- Rate-limited client traffic (429s excluded from error rate)
