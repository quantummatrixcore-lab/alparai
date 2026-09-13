# ADR-013: CSP for a streaming App Router — inline scripts are a framework dependency

- **Status:** Accepted
- **Date:** 2026-08-19
- **Decider:** Architect (Opus), during a live production outage reported by the Founder

## Context

`https://www.alparai.com/en` served a page with no hero and no data. The server was not at fault:
the response was HTTP 200, 627,785 characters, containing the full navigation, the hero copy, five
real live-feed incidents, the provider leaderboard, and zero `MISSING_MESSAGE` or `IntlError`
occurrences. DeHost's runtime error table was empty. Every server-side signal read healthy.

The failure was entirely in the browser, and the cause was one line.

### Measurements (live fetch, 2026-08-19)

| Observation                                              | Value                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `script-src` in response header                          | `'self'` + 7 hosts — no `'unsafe-inline'`, no `nonce-`, no `'strict-dynamic'` |
| Inline `<script>` elements in document                   | 25                                                                            |
| ...of those carrying a `nonce` attribute                 | 0                                                                             |
| ...of those pushing `self.__next_f` (RSC flight payload) | 20                                                                            |
| Nonce recorded inside the flight payload                 | `"nonce":"$undefined"`                                                        |
| Pending Suspense markers (`<!--$?-->`)                   | 3                                                                             |
| Boundary-completion calls (`$RC(`)                       | 3                                                                             |
| `<footer>` position in script-stripped body              | 31.0%                                                                         |
| Single `<h1>` position in the same body                  | 41.3% — **below the footer**                                                  |

Source of the directive: `next.config.mjs:11` (`cspRules`). The regression was introduced by
commit `d8bd006d` ("360 swarm audit fixes (CSP, bloatware, taxonomy, UI truth protocol)"), which
removed `'unsafe-inline' 'unsafe-eval'` as a hardening measure without adding a nonce mechanism.
The directive shipped intact from `1bc10726` until that commit. Verified still present on the
remote with `git show origin/master:next.config.mjs`.

### Mechanism

React's streaming SSR does not render `<Suspense>` content in place. It emits the fallback in
position, streams the resolved content to the **end of the document**, and then relocates it with an
inline `$RC()` call. The RSC flight payload that hydration itself depends on is likewise delivered
through inline `self.__next_f.push()` scripts.

Blocking inline scripts therefore produces exactly the observed page: the flight payload never
arrives so React never hydrates, and the three suspended regions — hero, live stats, leaderboard —
stay stranded where they were emitted, below the footer, while their skeletons freeze at the top.

**Inline scripts are not an incidental convenience in this framework. They are the transport.** A
CSP that forbids them without supplying a nonce does not harden the application; it disables it,
while remaining a perfectly valid CSP.

## Why every quality gate missed it

This is the part worth keeping. The outage passed through a full CI pipeline untouched:

- **`pnpm build`** — a CSP is a response header produced by `headers()`, not a build artifact. The
  build was green and had no way not to be.
- **`pnpm typecheck` / `pnpm lint`** — a directive string has no type or lint surface.
- **Vitest** — no unit test asserts response headers.
- **Playwright** — structurally blind here. `toBeVisible()` and text assertions pass against
  server-rendered HTML, and the content _was_ in the DOM. A suite built on presence assertions
  cannot distinguish a hydrated application from an inert document.
- **DeHost runtime errors** — CSP violations are raised by the browser, not the server runtime. The
  table was empty because the server was healthy and serving a correct document.

The systemic finding: **no layer of the test pyramid asserts that the application hydrated.** Every
gate measured the server, and the server was never wrong.

A related diagnostic anti-pattern is on the record. Two prior commits — `65b7c09c` ("prevent
infinite loading skeleton crash") and `8fbe42b1` ("remove root loading and resolve hydration
mismatch causing infinite skeletons") — treated the frozen skeletons as a data or layout defect and
patched around them. When a fix targets a symptom and the symptom returns, the next step is to
falsify the assumed mechanism, not to patch harder.

## Decision

**Restore `'unsafe-inline' 'unsafe-eval'` to `script-src`** in `next.config.mjs:11`, returning the
directive to the state the site ran on for its entire life before `d8bd006d`.

**Rejected for now — per-request nonce in middleware.** This is the correct end state and the
documented Next.js approach: generate a nonce per request, set it on the CSP header from
`src/middleware.ts`, and the framework stamps its inline scripts with it. It is rejected _today_
because a nonce cannot be baked into a statically generated page, so adopting it forces dynamic
rendering on every route across five locales. That is an architectural change, and a live outage is
not when it gets made.

**Rejected — `'strict-dynamic'`.** It governs scripts loaded by other scripts. The flight payload
and `$RC()` calls are inline in the document; `'strict-dynamic'` does not reach them.

## Consequences

Accepted honestly: `'unsafe-inline'` genuinely widens the XSS surface, and a scanner flagging this
change is not wrong. The cost is accepted to restore service, and it restores a known state rather
than inventing a new one. `'unsafe-eval'` is restored alongside it because it was part of the
known-good directive and this session cannot verify from the container which dependency, if any,
requires it — narrowing it is follow-up work with a test behind it, not a guess made during an
outage.

The nonce migration remains the intended destination and is filed as follow-up, scoped so the
static-rendering tradeoff is measured before it is adopted.

## Enforcer (Doctrine #047)

Cheap invariant first, browser assertion second.

1. **`scripts/check-csp-hydration.mjs`** — static check, no browser. Fail when `next.config.mjs`'s
   `script-src` contains neither `'unsafe-inline'` nor a `nonce-` placeholder _and_ `src/middleware.ts`
   sets no per-request nonce. This encodes the constraint directly: the application may drop
   `'unsafe-inline'` only once a nonce mechanism exists. Wire as a step in `.github/workflows/ci.yml`.

2. **A hydration assertion in Playwright** — assert behaviour that requires JavaScript, not text
   presence. The narrow signal available for free: after load, no unresolved streaming boundary may
   remain in the document (`<!--$?-->` / `$RC` markers all consumed). Presence assertions must never
   again be read as evidence of hydration.

## Note on verification discipline

During this investigation the Architect reported a `clientKeys` allowlist regression in
`src/app/[locale]/layout.tsx` that **does not exist on `origin/master`** — commit `16102f28` had
already removed it. The finding came from a stale local working copy. The corrective rule is the
read-side mirror of G-7 ("pushed or it did not happen"): a finding is verified against `origin`, not
against the container's checkout, before it is reported as real.
