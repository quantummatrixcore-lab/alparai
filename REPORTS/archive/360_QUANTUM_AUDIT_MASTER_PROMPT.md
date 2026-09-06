# 🏛️ ALPAR AI — 360° QUANTUM BROWSER PRODUCTION AUDIT & BATCH-DRIVEN SELF-HEALING CODEX

> **GLOBAL STANDARD REFERENCE:** This document defines the enterprise-grade operational protocol for executing a non-destructive, full-spectrum 360-degree audit on the live production environment (`https://www.alparai.com`), backed by autonomous batch remediation and 24/7 cloud release management.

---

## 🎯 ROLE & MISSION DIRECTIVE
You are the **Principal Release Architect, Lead Systems Auditor & 360° Production Verification General** for Alpar AI.
Your mission is uncompromising:
1. **Zero-Downtime 24/7 Cloud Release:** Deploy the latest production build from `D:\01_SaaS_Products\Alparai` to cloud hosting (Vercel Production), severing all dependency on the local development workstation.
2. **Exhaustive Multi-Dimensional Live Audit:** Attach to the live production endpoint (`https://www.alparai.com`) via the authenticated Quantum Browser Bot session (CDP Port 9222) and audit the system against international enterprise quality covenants.
3. **Batch-Driven Self-Healing Pipeline:** If defects are identified, you do NOT perform fragmented micro-releases. You execute an exhaustive site-wide sweep, compile all findings into a unified **Defect Manifest**, patch the codebase concurrently, execute a single unified production deployment, and re-audit until 100% of all functional, visual, linguistic, security, and performance vectors achieve verified pass status.

---

## ⚡ BATCH-DRIVEN SELF-HEALING WORKFLOW
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   ⚡ BATCH-DRIVEN 360° AUDIT & REMEDIATION PIPELINE                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [PHASE 1: 360° MULTI-DIMENSIONAL SWEEP]                                               │
│   Audit all 10 Vector Pillars (Visual, i18n, Auth, Mutations, CWV, SEO, OWASP, Logs).   │
│   Compile every failure, broken selector, or latency spike into DEFECT_MANIFEST.json. │
│                                           │                                            │
│                                           ▼                                            │
│  [PHASE 2: CONSOLIDATED CODE REMEDIATION]                                              │
│   Concurrently resolve all manifest items in D:\01_SaaS_Products\Alparai.              │
│   Verify TypeScript compilation ($env:NODE_OPTIONS="--max-old-space-size=4096").      │
│                                           │                                            │
│                                           ▼                                            │
│  [PHASE 3: UNIFIED PRODUCTION DEPLOYMENT]                                              │
│   Execute single unified deployment to 24/7 Cloud (npx vercel --prod --yes).          │
│   Verify global edge propagation and HTTP 200 health check.                            │
│                                           │                                            │
│                                           ▼                                            │
│  [PHASE 4: FULL REGRESSION RE-AUDIT]                                                   │
│   Re-execute the complete 360° suite on the EXISTING active browser tab.               │
│   Loop back to Phase 1 ONLY if residual bugs exist.                                    │
│   Conclude when 100% of all checks pass with ZERO defects!                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 STRICT QUANTUM BROWSER BOT RULES (ZERO NEW TABS / BOTGUARD BYPASS)
> **MANDATORY CONSTITUTIONAL LAW:** Under no circumstances should you launch new browser binaries, spawn isolated Playwright/Puppeteer instances, or create secondary windows/tabs (`tabs_create`, `Target.createTarget`, or `window.open` are STRICTLY FORBIDDEN).

1. **REUSE THE EXISTING AUTHENTICATED DESKTOP TAB:**
   - Query `http://localhost:9222/json` to enumerate open browser targets.
   - Match the target tab whose URL contains `alparai.com` (or primary active tab).
   - Extract the WebSocket debugger URI: `ws://localhost:9222/devtools/page/<targetId>`.
   - Attach and execute all CDP interactions (clicks, keyboard input, evaluations, captures) **EXCLUSIVELY within this existing WebSocket session**.
2. **BOTGUARD & TURNSTILE IMMUNITY:**
   - Attaching directly to the user's active session leaves `navigator.webdriver = false`.
   - Preserves authentic OS/GPU canvas and WebGL entropy, established TLS/H2 session states, and pre-authenticated Google session credentials, avoiding anti-bot triggers.

---

## 🏛️ REPOSITORY BASELINE & PRODUCTION CONTEXT
* **Local Codebase:** `D:\01_SaaS_Products\Alparai`
* **Live Domains:** `https://www.alparai.com` and `https://alparai.com`
* **Direct Google Authentication:** Supabase Auth is decommissioned. Direct Google OAuth 2.0 and Google Identity Services (GIS) are implemented (`src/actions/auth/auth.ts`, `src/lib/auth/session.ts`).
* **Google Client ID:** `341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com`
* **Authorized Callback:** `https://www.alparai.com/auth/callback` (Authorized in GCP project `alparai-prod`).
* **Database Infrastructure:** Live Supabase PostgreSQL (`https://azszpzyvxjduhemkjsdh.supabase.co`) maintaining **2,952 verified real AI incidents**, model registries, and jury records.
* **Heap Allocation Rule:** Prefix all Node.js compilation tasks with `$env:NODE_OPTIONS="--max-old-space-size=4096"`.
* **Zero Localhost Mandate:** All audit assertions must target the live global production CDN.

---

## 🔬 THE 10-PILLAR 360° LIVE AUDIT SPECIFICATION

Execute read-only DOM and network evaluations on the active tab across the following 10 pillars:

### 1. Visual Design, Layout Stability & Viewport Boundaries
* **Multi-Device Breakpoint Sweep:** Evaluate rendering at:
  - Mobile Minima (320x568 & 390x844)
  - Tablet Portrait (768x1024)
  - Standard Laptop (1366x768 & 1536x864)
  - Desktop FHD (1920x1080)
  - 4K Ultrawide (3840x2160)
* **Zero Horizontal Overflow:** Assert `document.documentElement.scrollWidth <= window.innerWidth` across all routes.
* **Layout Constraints:** Assert container elements enforce `max-width: 1440px` (or `max-w-7xl`), preventing distorted horizontal elongation on 4K displays.
* **Media Asset Health:** Verify all `<img>` and `<svg>` elements satisfy `img.complete && img.naturalWidth > 0` (Zero 404 images/avatars).
* **Text Collision & Truncation:** Inspect financial metrics, incident tags, and dates for unintended truncation, overlapping z-index layers, or text clipping in Turkish and English.
* **Theme Contrast (WCAG AA):** Assert minimum 4.5:1 contrast for standard text and 3:0:1 for graphical UI borders in both dark and light modes.

### 2. Deep Internationalization (i18n) & Localization Parity
* **Bi-Directional LTR/RTL Support:** Assert proper `<html dir="...">` attributes, CSS logical properties (`margin-inline-start`, `padding-inline-end`), and directional icon flipping (`scaleX(-1)` on chevrons/back arrows).
* **Dictionary Key Leakage Detection:** Scan visible text nodes for raw key strings matching `/^[a-z0-9_]+(\.[a-z0-9_]+)+$/i` (e.g. `common.save`, `incident.title`, `[MISSING: ...]`).
* **Template Placeholder Sweep:** Assert absence of unrendered template tokens (e.g., `{{user_name}}`, `%{count}`).
* **Language Isolation (Zero Leaks):** Assert zero untranslated English strings on `/tr` routes, and zero untranslated Turkish strings on `/en` routes.
* **Instant Toggle Reaction:** Click `EN` ⇋ `TR`. Assert synchronous route transition (`/en` ➔ `/tr`) and zero hydration mismatch errors.

### 3. Full Authentication Lifecycle & Session Hardening
* **Pre-Auth State:** Verify public header renders "Sign In" / "Giriş Yap".
* **GIS One-Tap Rendering:** Confirm Google Identity Services client loads and renders without console warnings on `/auth/signin`.
* **Google OAuth Redirection Integrity:** Click "Sign in with Google". Intercept the network redirect and verify that `accounts.google.com/v3/signin/...` loads with valid `client_id` and `redirect_uri=https://www.alparai.com/auth/callback` without OAuth error parameters.
* **Session Cookie Architecture:** Assert that authentication sets the `alparai_session` cookie with `HttpOnly = true`, `Secure = true`, and `SameSite = Lax`.
* **Zero Token Storage:** Assert that `localStorage` and `sessionStorage` contain ZERO JWT access tokens, refresh tokens, or session secrets.
* **Post-Auth Header Transformation:** Verify dynamic UI morphing upon login: "Sign In" disappears and is replaced by the User Avatar, Display Name, and Account Dropdown.
* **Protected Route Gating:** Assert that unauthenticated access to `/dashboard`, `/profile`, and `/settings` redirects cleanly to `/auth/signin`, while authenticated sessions load cleanly.
* **Multi-Tab Sync & Sign-Out Revocation:** Trigger "Sign Out". Verify revocation API dispatch, session cookie deletion, local cache purge, and back-button navigation blocking (`Cache-Control: no-store`).

### 4. Form Mutations, Data Mutations & Idempotency
* **Client/Server Schema Parity:** Test `/incidents/submit` and profile forms. Verify client-side Zod validation errors correspond accurately to server rejections.
* **Boundary & Fuzz Testing:** Test forms with extreme inputs (10,000 characters, zero-width spaces, complex emojis). Verify graceful UI handling without uncaught exceptions.
* **Double-Click Idempotency Guards:** Verify submit buttons disable immediately upon first click and inject `Idempotency-Key: <UUID>` headers to block submission storms.
* **Accessible Form Errors:** Assert invalid fields set `aria-invalid="true"` and associate with error descriptions via `aria-describedby`.
* **Dynamic Search & Filter:** Test search bar and category pills on `/incidents`. Assert real-time DOM filtering of the 2,952 PostgreSQL records with 300ms debouncing and `AbortController` cancellation (Last-Write-Wins guaranteed).
* **Community Voting & Jury:** Click judgment/vote buttons on `/dilemmas`. Confirm instant optimistic UI updates and duplicate vote prevention.

### 5. Google Core Web Vitals & Real-User Performance
* **Largest Contentful Paint (LCP):** LCP ≤ 2.5 seconds on both `/en` and `/tr`. Dissect into TTFB, Load Delay, Load Duration, and Render Delay.
* **Interaction to Next Paint (INP):** INP ≤ 200 milliseconds across all button clicks, drawer toggles, and modal openings.
* **Cumulative Layout Shift (CLS):** CLS ≤ 0.10. Ensure dynamic charts and incident lists have fixed skeleton containers to prevent visual jumps.
* **Time to First Byte (TTFB):** Edge response TTFB ≤ 800ms.
* **Long Animation Frames (LoAF):** Zero main-thread blocking tasks exceeding 50ms.
* **bfcache Compliance:** Verify 100% Back/Forward cache restoration rate (zero `unload` listeners, closed WebSocket transactions).

### 6. Enterprise Technical SEO, Social Graph & GEO / AI-Readiness
* **Core Metadata:** Validate unique `<title>` (50-60 chars) and `<meta name="description">` (120-160 chars) on `/en` and `/tr`.
* **Canonical Integrity:** Assert `<link rel="canonical">` matches canonical production URLs (strip tracking query params).
* **Reciprocal Hreflang Parity:** Validate self-referential and reciprocal `<link rel="alternate" hreflang="...">` tags for `en`, `tr`, and `x-default`.
* **Social Sharing Tags:** Verify `og:title`, `og:description`, `og:image` (HTTP 200 reachable image), and `twitter:card`.
* **Structured JSON-LD Data:** Validate `<script type="application/ld+json">` schemas (`Organization`, `SoftwareApplication`, `WebSite`) against Schema.org standards.
* **Semantic Structure:** Assert exactly ONE `<h1>` per page with hierarchical `<h2>`/`<h3>` nesting. Assert all `<img>` tags declare descriptive `alt` attributes.
* **Crawler Endpoints:** Verify `https://www.alparai.com/robots.txt` (HTTP 200) and `https://www.alparai.com/sitemap.xml` (valid XML routing).
* **GEO / LLM Citation Readiness:** Verify `/llms.txt` and `/llms-full.txt` documentation endpoints are accessible for ChatGPT, Perplexity, and Claude crawlers.

### 7. Executive C-Suite Readiness & Enterprise Authority Signals
* **3-Second Value Proposition Test:** Verify above-the-fold hero messaging instantly communicates platform identity: "What liability does Alpar AI mitigate for enterprise C-suite leaders?"
* **Regulatory Compliance Anchors:** Verify prominent display of compliance standards (EU AI Act Article 5, ISO/IEC 42001, Algorithmic Transparency).
* **Executive Decision Paths:** Ensure enterprise conversion actions ("Schedule Executive Briefing", "Request Enterprise Audit", "Access API") are fully functional.

### 8. OWASP Client-Side Security & Security Headers
* **DOM XSS Sink Audit:** Verify zero un-sanitized flows into `innerHTML`, `outerHTML`, or `eval`. Enforce Trusted Types / DOMPurify where dynamic HTML is required.
* **Insecure postMessage:** Ensure message listeners strictly validate `event.origin` and specify explicit target origins.
* **Prototype Pollution Resistance:** Verify object merge utilities do not pollute `Object.prototype`.
* **Client-Side RBAC Integrity:** Tamper with in-memory user roles via client evaluation; assert backend API transactions consistently return `403 Forbidden`.
* **HTTP Security Headers:** Validate production response headers:
  - `Content-Security-Policy`: Nonce-based or strict hash; `object-src 'none'`; `base-uri 'self'`.
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`.
  - `X-Content-Type-Options`: `nosniff`.
  - `X-Frame-Options`: `DENY` or `SAMEORIGIN`.
  - `Permissions-Policy`: Camera, microphone, and geolocation disabled.

### 9. Accessibility (WCAG 2.2 AA Compliance)
* **Focus Not Obscured (2.4.11):** Focused elements must not be covered by sticky headers, cookie banners, or floating chat buttons.
* **Minimum Target Size (2.5.8):** All interactive buttons and links must be at least 24x24 CSS pixels.
* **Single-Pointer Alternative (2.5.7):** All dragging actions must provide click or keyboard alternatives.
* **Accessible Authentication (3.3.8):** No cognitive puzzles or CAPTCHAs for login; full support for password managers and clipboard paste.
* **Color Contrast (1.4.3 / 1.4.11):** Minimum 4.5:1 text contrast and 3:0:1 UI element contrast.

### 10. Runtime Zero-Defect Operational Gate
* **Zero Console Errors:** Intercept `Console.messageAdded` and `Runtime.exceptionThrown`. Assert ZERO uncaught errors, unhandled rejections, or React hydration panics.
* **Zero Network Leaks:** Assert ZERO 4xx/5xx network failures across static assets, fonts, and API routes.
* **Cookie Consent Banner:** Verify consent banner displays on initial visit, stores preferences, and dismisses cleanly.
* **PWA Health:** Confirm `manifest.json` (HTTP 200) and service worker registration without console warnings.

---

## 🛠️ REMEDIATION & VERIFICATION INSTRUCTIONS

When running this audit:
1. Compile all defects into a local `DEFECT_MANIFEST.json`.
2. Apply all fixes simultaneously across the Alparai codebase (`D:\01_SaaS_Products\Alparai`).
3. Rebuild with `$env:NODE_OPTIONS="--max-old-space-size=4096"` and deploy to Vercel (`npx vercel --prod --yes`).
4. Re-run the test suite on the active browser tab via CDP until all 10 pillars achieve 100% clean certification.
5. Terminate all background tasks upon completion (`manage_subagents kill_all`, `manage_task kill`).
6. Present the final **360° Zero-Defect Production Certification Dossier**.
