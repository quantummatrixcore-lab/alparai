# 🛡️ ALPAR AI — Security Audit Report: FAZ 3 (August 2026)

**Auditor:** FATİH-SENTINEL (Antigravity Security Engine)
**Date:** 2026-08-27
**Scope:** `src/` directory — Server Role Key exposure, PII logging, TypeScript hygiene, .env tracking, SSRF controls
**Classification:** INTERNAL — AI Accountability Platform

---

## 1. SUPABASE_SERVICE_ROLE_KEY Exposure Analysis

### ✅ CLEAR — No client bundle leak confirmed

All 13 references reside exclusively in server-side files (Server Actions, API Routes, Server Libs).

| File | Type | Safe? |
|---|---|---|
| `src/actions/admin-users.ts` | Server Action | ✅ |
| `src/actions/api-management.ts` | Server Action | ✅ |
| `src/actions/autopilot-moderate.ts` | Server Action | ⚠️ See note |
| `src/actions/incidents.ts` | Server Action | ✅ |
| `src/app/api/admin/env-audit/route.ts` | API Route | ✅ |
| `src/app/api/admin/integrations/route.ts` | API Route | ✅ |
| `src/app/api/cron/backup/route.ts` | API Route | ✅ |
| `src/lib/supabase/admin.ts` | Server Lib | ✅ |
| `src/lib/integrations/registry.ts` | Server Lib | ✅ |
| `src/components/admin/api-management/static-keys-list.tsx` | Component (no use client) | ✅ label only |

> **static-keys-list.tsx verdict:** No `"use client"` directive. Stores only the string name `"SUPABASE_SERVICE_ROLE_KEY"` as a UI label. No actual secret value. SAFE.

### ⚠️ Medium Risk — Non-Constant Time Comparison

```typescript
// src/actions/autopilot-moderate.ts:248
if (internalToken !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
```

**Risk:** `!==` string comparison is vulnerable to timing attacks.
**Fix:** Use `crypto.timingSafeEqual()` — already correctly used in `verify-geo-citations/route.ts`.

---

## 2. PII in console.log Statements

### ✅ CLEAR — No PII found

| File | Line | Content | PII? |
|---|---|---|---|
| `src/lib/agent-os/local-router-tom.ts` | 25 | Prompt slice (50 chars) | ✅ No PII |
| `src/lib/autopilot/kahin-oracle.ts` | 15 | Agent role + question | ⚠️ User content (low risk) |
| `src/lib/autopilot/kahin-oracle.ts` | 41 | Status message | ✅ No PII |
| `src/lib/utils/browser-agent-fix.js` | 14 | Viewport metrics | ✅ No PII |

Regex sweep `email|password|token|ip|bearer|secret|key|uid` in console.log: **0 matches**.

---

## 3. TypeScript `any` Usage

### 🔴 HIGH — 26 instances detected (threshold: 10)

#### Critical #1 — `src/app/api/v1/personas/[twinId]/completions/route.ts` (PUBLIC API)

```typescript
// Lines 58, 215, 222 — adminClient bypassed with as any on external API
const { data: keyData } = await (adminClient as any)
await (adminClient.rpc as any)("increment_persona_usage", { ... })
await (adminClient as any).from("persona_usage_stats").insert({
```
Privileged admin operations on public V1 endpoint with no type safety.

#### Critical #2 — `src/lib/ai/cross-audit/pipeline-orchestrator.ts` (Core product)

```typescript
// Lines 116, 412
await (admin as any).from("cross_audit_runs").insert({
```
Core audit pipeline. Malformed inserts undetected at compile time.

#### Critical #3 — `src/actions/storage.ts`

```typescript
// Line 64
const { error: dbError } = await (supabase as any)
```
Storage mutations — could mask RLS violations or column mismatches.

**Full inventory (26 total):** strategy-questionnaire.ts, analytics-hub/analysis/page.tsx, scout-intel.ts (×2), storage.ts, b2b/dashboard/page.tsx (×2), twins-leaderboard-client.tsx, twins/chat/route.ts (×3), personas completions/route.ts (×3), master-plan-client.tsx, i18n/request.ts, pipeline-orchestrator.ts (×2), ai/discovery/orchestrator.ts (×2), audit/model-router.ts (×2), data-retention.ts, k-benchmark-service.ts, notifications/claim-and-respond.ts

---

## 4. .env Files in Git Tracking

### ✅ CLEAR

```
$ git ls-files ".env*"
.env.example
```

Only `.env.example` tracked. `.env.local` and `.env.production` are NOT in git.

---

## 5. fetch() Calls — SSRF & Host Whitelist

### ✅ Properly Guarded

| File | Mechanism | Status |
|---|---|---|
| `src/app/api/v1/extract/route.ts` | Explicit domain allowlist + private IP block | ✅ SSRF-safe |
| `src/app/api/cron/verify-geo-citations/route.ts` | `isSafeUrl()` from `@/lib/security/ssrf` | ✅ SSRF-safe |
| `src/actions/autopilot-sync.ts` (Gemini call) | Hardcoded `generativelanguage.googleapis.com` | ✅ Fixed host |

### ⚠️ Medium Risk — Unguarded Dynamic fetch

| File | Line | Issue |
|---|---|---|
| `src/actions/autopilot-sync.ts` | 175 | `fetch(feed.url)` — RSS URL from constant array, no `isSafeUrl()` guard |
| `src/app/api/cron/import-incidents/route.ts` | 35, 66 | `fetch(aiaaicUrl)` / `fetch(aiidUrl)` — verify these are hardcoded constants |

All other external fetch calls (openrouter.ai, anthropic.com, api.vercel.com, resend.com, github.com, tavily.com, linkedin.com, api.x.com, tiktokapis.com) are hardcoded literals — NOT user-controlled. ✅

---

## Risk Summary

| Check | Status | Severity |
|---|---|---|
| SERVICE_ROLE_KEY in client bundle | ✅ CLEAR | — |
| Non-constant-time token comparison (autopilot-moderate.ts:248) | ⚠️ MEDIUM | Medium |
| PII in console.log | ✅ CLEAR | — |
| User prompt in console.log (kahin-oracle.ts:15) | ⚠️ LOW | Low |
| TypeScript `any` count (26 instances) | 🔴 ACTION REQUIRED | High |
| Top 3 `any` violations: personas API, cross-audit, storage | 🔴 CRITICAL | High |
| .env files in git | ✅ CLEAR | — |
| SSRF — extract/route.ts | ✅ SAFE | — |
| SSRF — verify-geo-citations | ✅ SAFE | — |
| RSS feed.url without isSafeUrl() | ⚠️ MEDIUM | Medium |

---

## Recommended Actions (Priority Order)

1. **[HIGH]** `autopilot-moderate.ts:248` — Replace `!==` with `crypto.timingSafeEqual()`
2. **[HIGH]** `personas/[twinId]/completions/route.ts` — Eliminate `as any`, generate Supabase types
3. **[HIGH]** `autopilot-sync.ts:175` — Add `isSafeUrl()` guard before `fetch(feed.url)`
4. **[MEDIUM]** `cross-audit/pipeline-orchestrator.ts` — Replace `as any` with typed Supabase queries
5. **[LOW]** `kahin-oracle.ts:15` — Remove `console.log` or move to `logger.debug()`
6. **[LOW]** Systematic `as any` elimination across remaining 20 instances

---

*Report generated by FATİH-SENTINEL / Antigravity Security Engine — FAZ3 August 2026*
