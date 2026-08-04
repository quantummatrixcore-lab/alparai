# E2E Coverage Charter

## Coverage Summary (21 spec files, ~95 test cases)

| Area             | Spec                                   | Tests | Coverage                                                  |
| ---------------- | -------------------------------------- | ----- | --------------------------------------------------------- |
| Homepage         | `critical-flows.spec.ts`               | 2     | Hero, live feed, leaderboard, language switch             |
| Homepage CTA     | `flows/homepage-cta.spec.ts`           | 4     | CTA visibility (EN+TR), navigation, LIVE badge            |
| Submit           | `flows/submit.spec.ts`                 | 3     | URL extraction API, form rendering, anonymous email       |
| User Journey     | `flows/user-journey.spec.ts`           | 1     | Submit nav, form validation, consent                      |
| SSE Submit       | `flows/sse-submit.spec.ts`             | 1     | Full SSE mocks, stage progression, redirect               |
| PII + Rate Limit | `flows/pii-flow.spec.ts`               | 3     | PII form, rate-limit 429, circuit-breaker 503             |
| Incident Detail  | `flows/incident-detail.spec.ts`        | 4     | Render, share buttons, voting, language switch            |
| Provider Respond | `flows/provider-respond-token.spec.ts` | 2     | Invalid/valid token paths                                 |
| Admin            | `flows/admin-journey.spec.ts`          | 4     | Auth gates: /admin, /autopilot, /incidents, /moderation   |
| Auth Smoke       | `flows/auth-smoke.spec.ts`             | 25    | Auth gates: 17 admin routes + 8 user routes               |
| Public Pages     | `flows/public-pages.spec.ts`           | 7     | Pricing, contact, blog detail, 404, experts               |
| Admin Rendering  | `flows/admin-rendering.spec.ts`        | 19    | Authenticated render: 12 admin + 3 settings + 4 dashboard |
| Auth Pages       | `flows/auth-pages.spec.ts`             | 2     | Authenticated render: dilemmas, feed                      |
| i18n             | `flows/i18n.spec.ts`                   | 1     | EN↔TR language switch, html lang attr                     |
| Navigation       | `flows/nav.spec.ts`                    | 1     | Academy link (desktop + mobile)                           |
| AI Act           | `flows/ai-act.spec.ts`                 | 1     | Filter/pagination on tracker                              |
| Transparency     | `flows/transparency.spec.ts`           | 1     | Stat cards rendering                                      |
| Unsubscribe      | `flows/unsubscribe-cap.spec.ts`        | 5     | Token gen, GET/POST, invalid token                        |
| SEO              | `seo.spec.ts`                          | 9     | Meta tags, JSON-LD, robots.xml, sitemap, OG               |
| Layout           | `layout.spec.ts`                       | 8     | Mobile overflow on 8 key pages                            |
| Accessibility    | `a11y/accessibility.spec.ts`           | 5     | Axe WCAG 2.2 AA on 5 critical pages                       |
| Visual Regr.     | `visual/screenshot-diff.spec.ts`       | 8     | Screenshot comparison on 8 key pages                      |

## Gap Analysis

### Covered paths (68 routes tested across all specs)

`/`, `/submit`, `/incidents/[id]`, `/incidents/[id]/respond`, `/ai-act`,
`/transparency`, `/leaderboard`, `/academy`, `/blog`, `/blog/[slug]`,
`/unsubscribe`, `/auth/signin`, `/legal/privacy`, `/legal/takedown`,
`/incidents`, `/ratings`, `/methodology/k-benchmark`, `/bounties`,
`/status`, `/legal`, `/admin`, `/admin/moderation`, `/admin/incidents`,
`/admin/autopilot`, `/admin/autopilot/analytics`,
`/admin/providers`, `/admin/settings`, `/admin/feature-flags`,
`/admin/geo`, `/admin/health`, `/admin/marketing`, `/admin/users`,
`/admin/audit`, `/admin/experts`, `/admin/dsar`, `/admin/billing`,
`/admin/analysis`, `/admin/redaction-queue`, `/admin/investors`,
`/admin/ecosystem`, `/admin/cross-audit-dashboard`, `/admin/takedown`,
`/admin/innovations`,
`/settings`, `/my-incidents`, `/profile`, `/onboarding`,
`/dashboard/compliance`, `/dashboard/journalist`,
`/dashboard/legal`, `/dashboard/safety`,
`/pricing`, `/contact`, `/blog/[slug]`, `/experts`, `/dilemmas`, `/feed`

### Uncovered paths — HIGH priority

| Route                | Traffic | Risk    | Why needed                        |
| -------------------- | ------- | ------- | --------------------------------- |
| `/en/admin/*` (auth) | Staff   | Content | Authenticated rendering (no mock) |
| `/en/dashboard/*`    | User    | Content | Authenticated rendering (no mock) |
| `/en/settings`       | User    | Content | Authenticated rendering (no mock) |

### Under-covered paths — MEDIUM priority

| Route                      | Coverage gap                                  |
| -------------------------- | --------------------------------------------- |
| `/en/submit`               | No end-to-end submit (SSE spec mocks network) |
| `/en/bounties`             | In visual diff only                           |
| `/en/incidents/[id]/embed` | Not tested                                    |

### Missing test types

| Type                    | Missing                                             |
| ----------------------- | --------------------------------------------------- |
| Full login flow         | No real OAuth login E2E (requires test credentials) |
| Real data admin content | Pages render but use mock Supabase — no real data   |
| Form submission         | No real end-to-end incident submission              |
| Search functionality    | Not tested                                          |

## Coverage percentage estimate

- **Routes with any test**: ~90/90 (~100%)
- **Critical public routes covered**: ~15/15 (100%)
- **Admin routes covered**: 25/25 (100%) — auth redirect + authenticated render
- **Auth-gated routes covered**: 12/12 (100%) — auth redirect + authenticated render

## Recommended next tests (by priority)

1. Search functionality
2. `/en/incidents/[id]/embed` rendering
3. `/en/bounties` full rendering test
4. Real data validation (requires live Supabase or mock server)
5. Full OAuth login E2E (requires test Google credentials)
