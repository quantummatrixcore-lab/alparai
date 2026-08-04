# P1 Sprint Plan — ALPAR AI 360° Consolidated Audit Results

**Date:** 2026-06-08  
**Sprint Duration:** ~6-8 hours (autopilot)  
**Source:** `ALPARAI-360-ALL-REPORTS.md` (5 AI models consolidated)  
**Quality Threshold:** 0 P0 ✅ + 80% P1 ✅ + `pnpm validate` ✅ + site live ✅

---

## Cross-Analysis (Common Finding of 5 Models)

| Finding                                       | Source     | Severity | Status |
| :-------------------------------------------- | :--------- | :------: | :----- |
| `setUserRole` admin escalation                | All models |  🔴 P0   | OPEN   |
| Open Redirect (auth callback)                 | All models |  🔴 P0   | OPEN   |
| IP_SALT fallback                              | 4 models   |  🔴 P0   | OPEN   |
| No Magic link rate limit                      | 4 models   |  🔴 P0   | OPEN   |
| `consent_log.granted` missing                 | M3 + mimo  |  🔴 P0   | OPEN   |
| `database.ts` manual, 27 `as never`           | 3 models   |  🔴 P0   | OPEN   |
| Husky hooks are empty                         | 3 models   |  🟡 P1   | OPEN   |
| Prettier config conflict                      | 3 models   |  🟡 P1   | OPEN   |
| `contact-form.tsx` lacks i18n                 | 4 models   |  🟡 P1   | OPEN   |
| `hashIp()` duplicated 3 times                 | M3 + mimo  |  🟡 P1   | OPEN   |
| `IncidentListItem` mapping duplicated 8 times | mimo       |  🟡 P1   | OPEN   |
| `REASONS` array duplicated 2 times            | mimo + V2  |  🟡 P1   | OPEN   |
| `language: "en"` hardcoded                    | mimo       |  🟡 P1   | OPEN   |
| 4 Server Actions lack rate limit              | V2 + M3    |  🟡 P1   | OPEN   |
| Health endpoint information leakage           | mimo + M3  |  🟡 P1   | OPEN   |
| A11y: table lacks `<caption>`                 | M3         |  🟡 P1   | OPEN   |
| Cookie banner lacks Escape key support        | mimo + M3  |  🟢 P2   | OPEN   |
| Empty route groups                            | V2         |  🟢 P2   | OPEN   |

**Note:** The claim in the V2 report of "35+ TypeScript errors" is **incorrect** — in reality, `pnpm typecheck` returns 0 errors. The V2 report was written **before** the `incident_votes`/`contains_pii` migrations were applied on 08.06.

---

## P0 Sprint (90 mins) — Security Vulnerabilities

### P0-1: setUserRole — Moderator→Admin Escalation [15 mins]

- **File:** `src/actions/admin.ts:168-188`
- **Fix:** Remove `"admin"` from the schema (`z.enum(["user", "moderator"])`); enforce `requireAdmin()`
- **Test:** `tests/admin.test.ts` — moderator cannot escalate, admin can demote

### P0-2: Open Redirect — Auth Callback [15 mins]

- **File:** `src/app/[locale]/auth/callback/route.ts:9,14`
- **Fix:** Whitelist `^/[a-zA-Z0-9_\-/]*$` (must start with a single `/`, no `//`, `/\`, or `:`); default to `/profile`
- **Test:** `tests/auth-callback.test.ts` — new (route handler test)

### P0-3: IP_SALT — Boot-Fatal Fallback [30 mins]

- **Files:** 5 locations — `incidents.ts:134,191`, `contact.ts:98`, `takedown.ts:78,166`
- **Fix:** Add `requireSalt()` helper to `lib/utils/hash.ts`; throw error on boot if missing: `throw new Error("IP_SALT must be set")`; remove fallback
- **Test:** `tests/hash.test.ts` (new) — salt missing → throw

### P0-4: Magic Link Rate Limit [15 mins]

- **File:** `src/actions/auth.ts:42-50`
- **Fix:** Add `RATE_LIMIT_KEYS.auth_magiclink` (5/15m) using IP-based rate limiting
- **Test:** `tests/auth.test.ts` — magic link rate limit exhaustion

### P0-5: consent_log.granted Missing [10 mins]

- **File:** `src/actions/incidents.ts:129-137`
- **Fix:** Add `granted: true`
- **Test:** `tests/incidents.test.ts` — submit creates consent_log row with granted=true

### P0-6: database.ts — Supabase Gen Types [5 mins]

- **Current:** `src/types/database.ts` is manual, 283 lines
- **Fix:** Run `npx supabase gen types typescript --local > src/types/database.ts`
- **Impact:** Most of the 27 `as never` casts drop automatically

---

## P1 Sprint (4-6 hours) — Code Quality + i18n + CI/CD

### P1-7: Cleanup of `as never` casts (~27 occurrences) [60 mins]

- **Strategy:** Manually fix the remaining 5-10 casts after P0-6
- **Files:** `incidents.ts`, `admin.ts`, `takedown.ts`, `suggestions.ts`, `export.ts`, `audit-service.ts`, `persistence.ts`, `lib/autopilot/`
- **Tooling:** List with `grep -r "as never" src/` and make them typed properly

### P1-8: hashIp() Deduplication [20 mins]

- **New:** `src/lib/utils/hash.ts` — export `hashIp(ip, salt)` and `requireIpSalt()`
- **Remove:** 3 duplicate copies (contact, incidents, takedown)
- **Test:** `tests/hash.test.ts`

### P1-9: IncidentListItem Mapping → lib/mappers.ts [30 mins]

- **New:** `src/lib/mappers.ts` — export `mapIncidentRow(row)` and `mapIncidentList(rows)`
- **Deduplicate:** Consolidate the 15-field mapping across 8 files

### P1-10: REASONS → lib/constants + i18n [20 mins]

- **New:** `src/lib/constants/takedown-reasons.ts` — common list
- **Usage:** `takedown-button.tsx` + `takedown-form.tsx`
- **i18n:** Add keys in `messages/{en,tr}.json` under `takedown.reasons.{defamation,copyright,...}`

### P1-11: contact-form.tsx → i18n [30 mins]

- **Hardcoded:** 7 strings (Your name, Email, Category, General, Press, ..., Send message, Message sent)
- **Namespace:** `contact.form.*` (EN+TR)
- **Same for:** success/error messages

### P1-12: badge.tsx → i18n [20 mins]

- **Hardcoded:** 9 severity/status labels
- **Namespace:** `badge.{severity,status}.*` (EN+TR)

### P1-13: language: "en" → user locale [15 mins]

- **File:** `src/actions/incidents.ts:81,111`
- **Fix:** Use `await getLocale()` (fallback to "en" for non-TR/EN locales)

### P1-14: Rate Limiting for 4 Actions [30 mins]

- **Missing:** `contact`, `takedown` (×2), `search`, `export`, `vote`, `magicLink`
- **New keys:** `contact_submission` (5/h), `takedown_submission` (3/d), `search_query` (30/m), `magic_link` (5/15m)
- **Test:** Rate limit exhaustion scenario for each action

### P1-15: Activate Husky + Lint-staged [15 mins]

- **Current:** `.husky/_/` (17 internal stubs), NO user hooks exist
- **Fix:** Create `.husky/pre-commit` running `npx lint-staged`

### P1-16: Consolidate Prettier Config [10 mins]

- **Current:** `.prettierrc.json` and `prettier.config.mjs` conflict
- **Fix:** Delete `.prettierrc.json`, keep `prettier.config.mjs` as the single source of truth (includes Tailwind plugin)

### P1-17: Health Endpoint Masking [10 mins]

- **File:** `src/app/api/health/route.ts`
- **Fix:** Do not output DB latency / Redis state / version; only output `{ status: "ok" }` or require authentication

### P1-18: A11y — Table Caption [20 mins]

- Add `<caption>` to 5+ tables (admin, moderation, users, audit pages)
- Apply `caption` with `sr-only` class

### P1-19: Cookie Banner Escape [15 mins]

- **File:** `src/components/legal/cookie-banner.tsx`
- **Fix:** Add `useEffect` with a `keydown` listener, close banner on ESC key press

---

## P2 Sprint (next week) — Enhancements

- P2-20: Component unit tests (53 components, 0 tests → 20+ tests)
- P2-21: `settings/page.tsx` i18n
- P2-22: `about/page.tsx` i18n
- P2-23: `contact/page.tsx` i18n
- P2-24: Clean up empty route groups (`(admin)`, `(app)`, `(auth)`, `(public)`)
- P2-25: Replace `select("*")` with specific fields in admin pages
- P2-26: Handle empty `catch {}` blocks with minimal error logging (10+ places)
- P2-27: Service-role reduction in user-driven write paths
- P2-28: Move 100+ hardcoded EN strings to i18n

---

## Multi-Role Orchestration Loop

In each batch, in order:

```
┌─ DEVELOPER AGENT ─┐ → Write, modify, and add code
│   (coder)        │
└────────┬─────────┘
         ↓
┌─ TESTER AGENT ────┐ → Run pnpm test, typecheck, lint, validate
│   (qa)           │   → Measure coverage
└────────┬─────────┘
         ↓
┌─ REVIEWER AGENT ──┐ → Code review (security, perf, a11y, i18n)
│   (auditor)      │   → Verify OWASP and 360° report criteria
└────────┬─────────┘
         ↓
┌─ ORCHESTRATOR ─────┐ → PASS/FAIL decision
│   (coordinator)   │   → FAIL: corrective action, return to batch
│                   │   → PASS: proceed to next batch
│                   │   → All batches PASS: build + deploy + final review
└───────────────────┘
```

**Quality Threshold (each batch):**

- ✅ `pnpm typecheck` → 0 errors
- ✅ `pnpm lint` → 0 errors (warnings OK)
- ✅ `pnpm test` → 100% pass
- ✅ `pnpm build` → success
- ✅ Reviewer approval (security + i18n + a11y)

**Gate of Excellence:** All P0 + P1 issues PASS + average test coverage >70% + 0 `as never` remaining + 0 hardcoded i18n under the scope of P1.

---

## Risk Notes

- `supabase gen types` may require a remote DB connection → may need a `db dump` for local use
- Removing `unsafe-eval` from CSP might break Next.js dev mode → tighten only in production
- `signInWithMagicLink` rate limit must be IP-based (not email-based, otherwise DDoS risk)
- If "admin" is removed from `setUserRole`, a separate `promoteToCEO` action can be considered for the CEO role
