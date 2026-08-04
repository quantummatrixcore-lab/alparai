# E1 — E2E Test Suite Expansion Report

## Status

**COMPLETED** — 2026-07-12

## Coverage Summary

| Suite                                  | Tests  | Critical Paths Covered                                                       |
| -------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `accessibility.spec.ts`                | 10     | a11y violations, keyboard nav, alt text, lang attr, skip link                |
| `critical-flows.spec.ts`               | 6      | Home page, language switch, signin page, legal pages, model catalog          |
| `layout.spec.ts`                       | 1      | Layout SSR                                                                   |
| `seo.spec.ts`                          | 9      | OG meta tags, canonical, hreflang, robots, sitemap                           |
| `flows/submit.spec.ts`                 | 3      | URL extract API, import section render, anonymous email field                |
| `flows/sse-submit.spec.ts`             | 1      | Full submit flow with SSE progress stages                                    |
| `flows/user-journey.spec.ts`           | 1      | Submit page validation from home CTA                                         |
| `flows/pii-flow.spec.ts`               | 3      | PII form elements, rate limit mock, circuit breaker mock                     |
| `flows/admin-journey.spec.ts`          | 5      | Auth redirect: /admin, /admin/autopilot, /admin/incidents, /admin/moderation |
| `flows/incident-detail.spec.ts`        | 4      | Detail render, share buttons, ratings/votes, language switch                 |
| `flows/i18n.spec.ts`                   | 1      | Internationalization                                                         |
| `flows/nav.spec.ts`                    | 1      | Navigation                                                                   |
| `flows/ai-act.spec.ts`                 | 1      | AI Act Tracker page                                                          |
| `flows/transparency.spec.ts`           | 1      | Transparency report                                                          |
| `flows/provider-respond-token.spec.ts` | 2      | Provider token flow                                                          |
| `flows/unsubscribe-cap.spec.ts`        | 6      | Unsubscribe + email cap                                                      |
| **Total**                              | **55** |                                                                              |

## Critical Path Verification

### submit-flow (anonim + auth)

- ✅ Anonymous submit with SSE progress (sse-submit.spec.ts)
- ✅ Anonymous email field visible when checkbox checked (submit.spec.ts new)
- ✅ URL import API (submit.spec.ts)
- ✅ Rate limit / circuit breaker handling (pii-flow.spec.ts)

### Ratings/Votes

- ✅ Upvote/downvote button presence on incident detail (incident-detail.spec.ts new)

### Incident Detail + Share

- ✅ Detail page renders with heading (incident-detail.spec.ts new)
- ✅ Share buttons visible (incident-detail.spec.ts new)
- ✅ Language switch preserves incident path (incident-detail.spec.ts new)

### Admin Queue Triage

- ✅ /admin redirects unauthenticated users (admin-journey.spec.ts)
- ✅ /admin/autopilot/analytics redirects (admin-journey.spec.ts)
- ✅ /admin/incidents redirects (admin-journey.spec.ts new)
- ✅ /admin/moderation redirects (admin-journey.spec.ts new)

## New Tests Added (this session)

| Test File                       | Scenario                                                      | Line |
| ------------------------------- | ------------------------------------------------------------- | ---- |
| `flows/submit.spec.ts`          | submit page renders import URL section                        | 19   |
| `flows/submit.spec.ts`          | anonymous email field visible when anonymous checkbox checked | 27   |
| `flows/admin-journey.spec.ts`   | admin triage queue page redirects unauthenticated users       | 32   |
| `flows/admin-journey.spec.ts`   | admin moderation page redirects unauthenticated users         | 38   |
| `flows/incident-detail.spec.ts` | renders incident detail with title, description, and metadata | 14   |
| `flows/incident-detail.spec.ts` | shows share buttons on incident detail page                   | 22   |
| `flows/incident-detail.spec.ts` | voting/ratings UI elements are present                        | 30   |
| `flows/incident-detail.spec.ts` | language switch preserves incident detail page                | 39   |

## Command

```bash
pnpm test:e2e          # runs all Playwright specs
pnpm test              # vitest unit tests (separate from E2E)
```
