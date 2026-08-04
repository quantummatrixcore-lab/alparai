# Autopilot — Self-Healing Task Automation

> Last updated: 2026-06-07

## What

The autopilot module is a thin, typed wrapper that gives any Server Action:

- **Exponential backoff with jitter** (1s → 2s → 4s → 8s, cap 30s).
- **Circuit breaker** (closed → open → half_open) so a failing dependency
  cannot block the user forever.
- **Cost-aware stop** (time + attempts + tokens) — a runaway retry never
  spends more than its budget.
- **Idempotency** via `sha256(action | userId | canonicalInputs)` or a
  client-supplied `x-idempotency-key` header.
- **Durable persistence** of every run in `autopilot_runs` (idempotency key,
  attempts, status, duration, error, result_id).
- **PII-safe telemetry** — redaction is mandatory, never opt-in.
- **Durable queue** over Upstash Redis with in-process fallback.
- **Layer 2 worker** that drains the queue and re-runs policies with full
  retry/breaker semantics.

The official term: _Self-Healing Task Automation Engine with Backward Error
Propagation and Cost-Aware Stop Conditions._

## Where

```
src/lib/autopilot/
├── types.ts        # branded types, result discriminated unions, helpers
├── retry.ts        # exponential backoff + jitter + retryable classifier
├── breaker.ts      # circuit breaker state machine + snapshot
├── budget.ts       # cost-aware stop (time + tokens)
├── idempotency.ts  # sha256 hash + client-key parser + log redaction
├── persistence.ts  # autopilot_runs DB I/O (admin client) + list/summary
├── queue.ts        # Upstash Redis queue with in-process fallback
├── worker.ts       # Layer 2 worker: drain queue, run policies
├── telemetry.ts    # Sentry + Plausible + audit_log
├── policies.ts     # 8 named presets (submitIncident, …)
├── define.ts       # `definePolicy()` helper with config validation
└── index.ts        # `withAutopilot()` orchestrator + barrel
```

## Active policies

| Action             | Retry | Breaker thr | Budget ms | On exhaust       | Use case                          |
| ------------------ | ----- | ----------- | --------- | ---------------- | --------------------------------- |
| `submitIncident`   | 4     | 8           | 10 000    | `silent_log`     | User-facing incident submission   |
| `submitContact`    | 3     | 12          | 6 000     | `toast_warn`     | Marketing contact form            |
| `submitTakedown`   | 5     | 6           | 15 000    | `email_fallback` | Legal takedown (must reach inbox) |
| `voteIncident`     | 3     | 20          | 3 000     | `silent_log`     | High-volume, low-stakes           |
| `moderateIncident` | 3     | 10          | 8 000     | `escalate_admin` | Admin moderation, must be loud    |
| `submitSuggestion` | 3     | 15          | 5 000     | `toast_warn`     | User feature suggestion           |
| `reviewTakedown`   | 4     | 10          | 8 000     | `escalate_admin` | Admin review of takedown          |
| `exportUserData`   | 2     | 5           | 20 000    | `silent_log`     | Admin CSV export                  |

## How (one-minute tour)

```ts
import { withAutopilot, submitIncidentPolicy } from "@/lib/autopilot";

const result = await withAutopilot(
  submitIncidentPolicy,
  [user.id, title, description, category],
  async (ctx) => {
    const { data, error } = await supabase.from("incidents").insert(...);
    if (error) {
      return { kind: "retryable", error: error.message };
    }
    return { kind: "success", value: { id: data.id } };
  },
  {
    context: {
      userId: user.id,
      ipHash: sha256(ip + IP_SALT),
      clientIdempotencyKey: headers().get("x-idempotency-key"),
    },
  }
);
```

The result is a discriminated union:

```ts
type AutopilotResult<T> =
  | { kind: "ok"; value: T; attempts: number; durationMs: number; idempotencyKey: IdempotencyKey }
  | {
      kind: "replayed";
      value: unknown;
      originalId: string;
      attempts: number;
      idempotencyKey: IdempotencyKey;
    }
  | {
      kind: "exhausted";
      error: string;
      attempts: number;
      durationMs: number;
      idempotencyKey: IdempotencyKey;
    }
  | { kind: "circuit_open"; cooldownMs: number; idempotencyKey: IdempotencyKey }
  | { kind: "budget_exceeded"; costMs: number; attempts: number; idempotencyKey: IdempotencyKey };
```

Helpers — `attemptsOf(result)`, `durationOf(result)`, `isSuccess(result)` —
keep the `circuit_open` arm clean (it has no `attempts` field).

## Idempotency contract

Two retries with the same `(action, userId, canonicalBody)` produce the
same idempotency key. The first successful run writes its `result_id` to
`autopilot_runs`; subsequent runs short-circuit with `kind: "replayed"`.

Client-side: send `x-idempotency-key: <8..256 chars, [A-Za-z0-9._:-]>` and
the server will use it instead of hashing. This is replay-safe across
browsers, retries, and double-clicks.

## Layer 2 — Durable worker

```ts
import { runAutopilotWorker, registerAutopilotHandler } from "@/lib/autopilot";

registerAutopilotHandler("submitIncident", async (job, ctx) => {
  // re-derive the original call from job.payload
  // return { kind: "success" | "retryable" | "fatal", value?: T }
});

const stats = await runAutopilotWorker({ batchSize: 10, maxEmptyPolls: 60 });
```

The worker calls `withAutopilot` for each job, so retry, breaker, budget,
idempotency, and persistence are all still active. This makes background
processing safe to retry.

`runAutopilotWorkerOnce()` processes a single batch and is used by the
admin "tick" button to drain a backlog.

## Admin observability

- `GET /admin/autopilot` (role: `admin`) — live dashboard.
- `GET /api/admin/autopilot?limit=100` — JSON snapshot.
- `POST /api/admin/autopilot` — single worker tick.

The snapshot returns:

- `stats` — totals, succeeded, failed, replayed, p50/p95 duration.
- `breakers` — live state of every circuit breaker.
- `policies` — current configuration.
- `queue` — availability + size.
- `runs` — last 100 persisted runs.

## Operational metrics

- **Auto-resolved rate** = `succeeded / total runs` (target ≥ 85%).
- **Median attempt count** for successful runs (target: 1.0).
- **p95 duration** per action (target: ≤ 6s).
- **Circuit breaker state** — view via `breakerSnapshot(action)`.
- **Exhaustion rate per action** — should stay < 1% in steady state.

## Failure modes

| Kind              | What it means                             | Recommended UX                 |
| ----------------- | ----------------------------------------- | ------------------------------ |
| `ok`              | Succeeded within budget.                  | Toast: success.                |
| `replayed`        | Same idempotency key seen before.         | Toast: success (same result).  |
| `exhausted`       | All attempts failed retryably OR fatal.   | Per `onExhaust` policy.        |
| `circuit_open`    | Breaker tripped; downstream is unhealthy. | Toast: "Service recovering…".  |
| `budget_exceeded` | Total cost > maxMs / maxTokens.           | Toast: "Logged, please retry." |

## Adding a new policy

```ts
import { definePolicy, DEFAULT_RETRY } from "@/lib/autopilot";

export const myActionPolicy = definePolicy({
  action: "myAction",
  retry: { ...DEFAULT_RETRY, attempts: 3, baseMs: 500 },
  breaker: { threshold: 10, cooldownMs: 30_000, halfOpenProbe: true },
  budget: { maxMs: 8_000, maxTokens: 1_000 },
  idempotency: { enabled: true, keyHeader: null, hashInputs: true },
  onExhaust: "silent_log",
  redactionFields: ["password", "token"],
});
```

## Adding a new telemetry sink

```ts
import { configureTelemetry } from "@/lib/autopilot";

configureTelemetry({
  sentry: (msg, extra) => Sentry.captureMessage(msg, { extra }),
  plausible: (event, props) => plausible(event, { props }),
});
```

## Failure surface (what can break)

1. **Upstash misconfigured** — queue degrades to in-process. Safe.
2. **Supabase down** — `submitIncident` retries, then circuit opens. Users
   see "Service recovering…" toast. SLA: ≤ 60s.
3. **Idempotency key collision** — extremely unlikely; UNIQUE constraint
   on `idempotency_key` is the safety net.
4. **Budget drift** — telemetry flags `budget_exceeded` rate; tune
   `retry.attempts` or `budget.maxMs`.
5. **PII in logs** — `redactForLog()` is called on every payload, but
   custom fields in `AttemptOutcome.value` are _not_ auto-redacted. Keep
   PII out of return values; the Guardian masks user input upstream.

## Migration

```bash
supabase db push --linked
# or
psql "$DATABASE_URL" -f supabase/migrations/20260607000001_autopilot_runs.sql
```

The `autopilot_runs` table is append-only; safe to keep indefinitely.
Recommend partitioning by `created_at` once row count exceeds 10M.

## Roadmap

- F1 ✅ Wrapper (in-process, idempotent) — done
- F2 ✅ BullMQ-compatible queue (durable) — done
- F2.5 ✅ Layer 2 worker that drains the queue — done
- F3 ✅ Admin UI for in-flight runs — done
- F4 ✅ Propagate to all write actions (contact, takedown, suggestion,
  vote, moderate, review, export) — done
- F5 Adaptive planner (postpone; ROI unclear)
