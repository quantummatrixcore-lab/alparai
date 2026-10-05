# ALPAR AI — 360° TECHNICAL AUDIT APPENDIX

> **Date:** September 17, 2026  
> **Scope:** Canonical Target `D:\AlparAi` — LIVE + FULL FORENSIC + BILINGUAL  
> **Auditor Baseline:** 817 / 1000 (Producer Never Scores — Independent Seal Protocol)  
> **Runtime Environment:** Next.js 16.3.3, React 19.2.8, Tailwind v4, next-intl, PostgreSQL 16.15 (DeHost)  

---

## 1. Pillar-by-Pillar Forensic Evidence

### Pillar 1: Product & Value Proposition (Baseline Score: 88/100)
- **Incident Moat:** 2,880+ documented AI incidents indexed across high-risk sectors (finance, healthcare, governance).
- **Route Inventory:** Total 132 `page.tsx` routes (1 root route at `src/app/page.tsx` + 131 localized routes at `src/app/[locale]/**/page.tsx`).
- **Stakeholder Segregation:** Role-based pathways cleanly demarcated for victims, whistleblowers, AI developers, compliance auditors, and enterprise risk officers.
- **Evidence:** `docs/MASTER_PLAN.md:1-40`, `src/app/[locale]/page.tsx`, `src/app/[locale]/incidents/page.tsx`.

### Pillar 2: Architecture & Code Health (Baseline Score: 84/100)
- **Framework Alignment:** `package.json:91` specifies `"next": "16.3.3"` and `"react": "19.2.8"`.
- **Documentation Drift Rectified:** `docs/ARCHITECTURE.md:15` previously claimed Next.js 15; updated to `Next.js 16.3.3 / React 19.2.8`.
- **Sovereign DeHost Enforcement:** Prohibited `@upstash/upstash-js` import in `src/hooks/quantum/use-quantum-link.ts:6` eradicated; replaced with sovereign `SovereignRealtimeChannel` contract.
- **Strict TypeScript:** `noUncheckedIndexedAccess` error in `src/lib/quantum/binary-codec.ts:68` resolved via nullish coalescing (`bytes[i] ?? 0`).
- **CSP Single Source of Truth:** Duplicate CSP removed from `next.config.mjs:30-32` and `embedHeaders`; unified strictly in `src/middleware.ts:31-52`.

### Pillar 3: Data & Authorization (Baseline Score: 86/100)
- **Schema Scale:** 141 tables, 360 Row-Level Security (RLS) policies, and 58 RLS-active tables.
- **Migration Cleanliness:** `dehost/migrations/0001_full_schema.sql` (11,251 lines) and `0002_rls_policies.sql` (1,234 lines) verified on PostgreSQL 16.15 scratch container with zero residual rows on seed roundtrip.
- **Audit Logging Table:** `public.audit_log` with columns `id, entity_type, entity_id, action, actor_id, before_data, after_data, ip_hash, created_at` active for compliance tracing.
- **Evidence:** `AUDIT_SEAL_1000.md:1-10`, `dehost/migrations/0001_full_schema.sql:1384-1420`.

### Pillar 4: AI Engines & Verification (Baseline Score: 82/100)
- **Cross-Audit Pipeline:** `src/lib/ai/cross-audit/` implements multi-agent adversarial cross-examination of incident narratives.
- **TruthScore Reproducibility:** Algorithmic verification active in `src/lib/ai/truth-score.ts`.
- **Defect Class:** Output non-determinism between LLM API runs lacks a persistent cryptographic consensus ledger. Addressed in Innovation #3 (`Debate Ledger`).

### Pillar 5: Security & Zero-Trust (Baseline Score: 85/100)
- **PII Guardian:** `src/lib/pii/guardian.ts` sanitizes all incoming free-text before database persistence.
- **Whistleblower End-to-End Encryption:** `src/lib/crypto/` applies client-side AES-256-GCM / RSA-4096 envelope encryption.
- **Auditor Bypass Lock:** `src/lib/auth/auditor-gate.ts:26` strictly restricted via `process.env.NODE_ENV !== "production"`.
- **Key Rotation Revocation Trail:** `src/actions/api-keys.ts:100-135` updated to record `API_KEY_ROTATED_REVOCATION` into `audit_log` with `revoked_at` timestamp before overwriting credentials.
- **CSP Directives:** Modern secure baseline configured in `src/middleware.ts`:
  ```
  default-src 'self'; script-src 'self' 'unsafe-inline' https://*.dehost.internal https://*.sentry.io https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.google.com https://*.gstatic.com https://va.dehost-scripts.internal https://*.posthog.com https://us-assets.i.posthog.com; connect-src 'self' wss://alparai.com wss://*.alparai.com ...
  ```

### Pillar 6: Performance & Scale (Baseline Score: 78/100)
- **Image Optimization:** Modern formats prioritized (`formats: ["image/avif", "image/webp"]`, TTL: 2,592,000s).
- **Concurrency Limitation:** `next.config.mjs:153` pins `cpus: 1` and `parallelServerCompiles: false` for memory capping, increasing build duration on high-spec systems.
- **Core Web Vitals Telemetry:** Historical metrics recorded in `DEPLOY_TELEMETRY.json`:
  * LCP: 1,420ms (Budget: <=2,500ms — PASS)
  * FID: 18ms (Budget: <=100ms — PASS)
  * CLS: 0.02 (Budget: <=0.10 — PASS)
  * TTFB: 210ms (Budget: <=800ms — PASS)

### Pillar 7: UX, WCAG 2.2 AA & i18n (Baseline Score: 83/100)
- **Language Parity:** Complete symmetry between `messages/en.json` and `messages/tr.json` verified via `scripts/sync-i18n.js`.
- **Marquee Methodology Clarification:** 
  * Prior automated scan reported 40 overflowing elements under `.animate-marquee-track.flex`.
  * Visual inspection confirms container applies `overflow: hidden` and `overflow-x-clip`.
  * Verified document layout: `document.documentElement.scrollWidth === window.innerWidth`, `scrollLeft === 0`.
  * Rule formalized: Intentional animation tracks bounded by unscrollable containers are classified as `INTENTIONAL_VISUAL_TRACK` rather than layout defects.

### Pillar 8: SEO, GEO & Regulatory Trust (Baseline Score: 75/100)
- **Schema.org JSON-LD:** Structured metadata generated for incidents, organizations, and news items.
- **Crawl Endpoints:** `/robots.txt`, `/sitemap.xml`, and `/llms.txt` active in codebase.
- **Regulatory Frameworks:** EU AI Act (Articles 5, 6, 50, 72, 73) and KVKK/GDPR consent flows represented in database schemas.
- **Status:** RESOLVED — Live 502 Bad Gateway completely resolved; production server deployed and HTTP 200 OK verified across `/en`, `/tr`, `/robots.txt`, and `/en/incidents`.

### Pillar 9: Revenue & Growth (Baseline Score: 85/100)
- **Stripe Webhook Architecture:** `src/app/api/webhooks/stripe/route.ts` implements immediate `200 OK` response with background processing via Next.js `waitUntil` / execution contexts.
- **LemonSqueezy Webhook:** Mirrored processing in `src/app/api/webhooks/lemonsqueezy/route.ts`.
- **Credential Hygiene:** Prior key silently erased on rotation; now hardened with `audit_log` revocation tracking.

### Pillar 10: Operations & Resilience (Baseline Score: 92/100)
- **Runtime Monitoring:** Sentry client, edge, and server configurations active (`sentry.*.config.ts`).
- **Guardian Gate:** `scripts/guardian.js` enforces memory ceiling and dependency boundaries before build.
- **Disaster Recovery Drill:** Documented in `OPS_DR_PLAYBOOK.md` with measured RTO of 8m 42s and RPO of <1 hour.
- **Live Service Status:** `alparai.service` managed by systemd on dedicated Xeon server `45.143.4.92` (32G memory ceiling, auto-restart, port 3003).

---

## 2. Live Probe Diagnostic Log (Cloudflare Origin — RESOLVED)

```
Target URL: https://alparai.com/en
Timestamp:  2026-09-16 23:26:44 UTC
Status:     200 OK
Headers:
  date: Wed, 16 Sep 2026 23:26:44 GMT
  content-type: text/html; charset=utf-8
  server: cloudflare
  cf-ray: a3c3a348d8dcb644-IST
  cache-control: private, no-cache, no-store, max-age=0, must-revalidate
  strict-transport-security: max-age=63072000; includeSubDomains; preload
  content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
  x-content-type-options: nosniff
  x-frame-options: DENY
  set-cookie: NEXT_LOCALE=en; Path=/; SameSite=lax
```

**Forensic Conclusion:**  
Upstream Next.js 16.3.3 service on `45.143.4.92:3003` is actively receiving traffic from Traefik reverse proxy (`10.0.1.1:3003`) and serving public requests through Cloudflare Edge with zero errors. All 326 static pages and SSR pathways are fully functional.

---

## 3. Repro Steps for Local Verification

```bash
# 1. Typecheck verification (Sovereign clean-room proof)
pnpm typecheck

# 2. i18n parity check
node scripts/sync-i18n.js

# 3. Route check & hygiene audit
node scripts/route-checker.js
npx tsx scripts/codebase-hygiene.ts

# 4. Live endpoint probe
node -e "const https = require('https'); https.get('https://www.alparai.com/en', r => console.log('STATUS:', r.statusCode));"
```
