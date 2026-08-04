# E3 — Load Testing Baseline

**Date**: 2026-07-12  
**Tool**: k6 (Grafana)

## Targets

| Endpoint        | Target RPS | p95 Target | Error Rate |
| --------------- | ---------- | ---------- | ---------- |
| `/en` (Home)    | 100        | < 300ms    | < 1%       |
| `/en/incidents` | 100        | < 300ms    | < 1%       |
| `/en/ratings`   | 100        | < 300ms    | < 1%       |

## Script

`ops/load/k6-script.js` — ramp-up 30s → 100 RPS sustained 4m → cool-down 30s.

## Running

```bash
k6 run ops/load/k6-script.js -e BASE_URL=https://alparai.com
```

For local dev:

```bash
k6 run ops/load/k6-script.js -e BASE_URL=http://localhost:3000
```

## Thresholds

- `errors`: rate < 0.01
- `http_req_duration`: p(95) < 300ms

## Regression Check

If any threshold fails after a deploy, block promotion and investigate before re-deploying.
