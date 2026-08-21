# HEALTH-1

**HEALTH-1** — The health endpoint was made to always return 200, which disables the signal it exists
to carry. Owner: Implementer. Priority: P1. Measured 2026-08-21 on `origin/master`.

`src/app/api/health/unified/route.ts` now reads:

```ts
const httpStatus = 200; // Force 200 to allow deployment checks to pass
```

`checkSystemHealth()` still runs and its report is still returned in the body, so a consumer that
parses the body can see the truth. But **every monitor, uptime probe and deployment gate reads the
status code**, and this endpoint now returns 200 whether the system is healthy or not. The comment
states the intent plainly: the code was changed so a check would pass.

`BB` asked for something different. The endpoint was returning **308** — a redirect, meaning the route
was not being reached at all. That is a routing defect. Forcing the status constant does make the
redirect stop, and it also removes the one thing the endpoint was for.

This is the defect class this board keeps recording in other forms: a check made to pass rather than a
thing made to work. It is the health-endpoint equivalent of a hardcoded metric.

## Required work

Fix the routing so `/api/health` reaches the handler without a redirect — that was the actual `BB`
defect — and let the status code follow the report: 200 when healthy, 503 when a dependency is down.
If a deployment gate cannot tolerate a 503, the gate should read the body or use a separate liveness
path; the fix does not belong in the health endpoint's return value.

If a constant status is genuinely required for a platform probe, add a **separate** liveness route
that says only "the process is up" and never claims to describe system health.

## Acceptance

- `/api/health` returns 200 without a redirect when dependencies are up
- The status code changes when a dependency is down (demonstrated with one dependency stubbed)
- No comment in the codebase justifies a return value by the check it allows to pass

## Closed 2026-08-21 (v13.77)

`src/app/api/health/unified/route.ts:10` reads `report.overall === "healthy" ? 200 : 503`, so the
status code follows the report. `src/app/api/health/live/route.ts` provides the separate constant-200
liveness probe, and the middleware bypass is scoped to skipping i18n rather than rewriting the path.
Verified on `origin/master` at `3bfd65c8`.
