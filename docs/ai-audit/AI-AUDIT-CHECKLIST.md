# ALPAR AI — Professional AI Audit Checklist

> **Version:** 3.0 | **Last Updated:** 2026-06-23
> **Purpose:** Standardized checklist for AI models to perform consistent, comparable, reproducible 360° audits
> **Scoring:** 10 categories × 100 points = 1000 total
> **Author:** opencode/mimo-v2.5-free

---

## HOW TO USE THIS CHECKLIST

1. Read this checklist completely before starting
2. Browse the live site at `https://www.alparai.com` (EN + TR + Mobile)
3. Read `docs/MASTER-ANALYSIS-SUMMARY.md` for historical context
4. Score each category using the rubric provided
5. Identify P0/P1/P2 blockers with evidence
6. Output results in the specified JSON format
7. Save raw report to `docs/ai-audit/raw-reports/[ModelName]-ALPAR-AI-360-[version].md`
8. Register in `docs/ai-audit/audit-registry.json`

---

## CATEGORY 1: USER EXPERIENCE & DESIGN (UI/UX) — 100 points

### 1.1 Desktop Navigation (20 pts)

- [ ] Top nav bar: all links visible, no overlap, no clutter
- [ ] Active page indicator working
- [ ] Logo + wordmark consistent across pages
- [ ] CTA buttons (Report Incident, Sign in) prominent
- [ ] Language switcher accessible
- [ ] No duplicate CTAs (e.g., "See Rankings" appears twice)
- [ ] AI Bug Bounty badge visible and clickable

### 1.2 Visual Hierarchy & Typography (20 pts)

- [ ] Hero section: headline < 10 words, subtitle < 30 words
- [ ] Font sizes: h1 > h2 > h3 > body > caption
- [ ] Color contrast: WCAG AA minimum (4.5:1 for text)
- [ ] Whitespace: sections clearly separated
- [ ] Gradient text effects: not overused
- [ ] Dark theme consistency: no light-theme leakage

### 1.3 Component Quality (20 pts)

- [ ] Cards: consistent border-radius, shadow, padding
- [ ] Badges: color-coded (severity, status), consistent size
- [ ] Buttons: primary (gradient), secondary (glass), ghost (text)
- [ ] Forms: input labels, placeholders, error states, character counters
- [ ] Tables: sortable headers, responsive, caption for a11y
- [ ] Modals/dialogs: backdrop blur, escape key, focus trap

### 1.4 Animations & Interactions (20 pts)

- [ ] Framer Motion: smooth transitions, no jank
- [ ] Hover states: scale, shadow, color changes
- [ ] Loading states: skeleton shimmer or spinner
- [ ] Scroll animations: parallax, fade-in, not dizzying
- [ ] Button click feedback: scale or color pulse

### 1.5 Responsive Design (20 pts)

- [ ] Mobile (< 768px): hamburger menu works, touch targets ≥ 44px
- [ ] Tablet (768-1024px): 2-column layout adapts
- [ ] Desktop (> 1024px): full layout, max-width container
- [ ] Images: responsive, no overflow, proper scaling
- [ ] Tables: horizontal scroll on mobile, or card layout

**Score:** \_\_\_/100

---

## CATEGORY 2: TECHNICAL ARCHITECTURE & PERFORMANCE — 100 points

### 2.1 Stack & Dependencies (20 pts)

- [ ] Next.js version: 15+ (App Router)
- [ ] React version: 19+
- [ ] TypeScript strict mode enabled
- [ ] No `any` types (use `unknown` + Zod)
- [ ] Package manager: pnpm 9+
- [ ] No deprecated packages

### 2.2 Server-Side Architecture (20 pts)

- [ ] Server Components by default (no unnecessary "use client")
- [ ] Server Actions for mutations (no client-side Supabase calls)
- [ ] Edge middleware: i18n + session refresh
- [ ] Proper error boundaries (error.tsx, not-found.tsx)
- [ ] Revalidate strategy: `revalidate = 0` for dynamic pages

### 2.3 Security (20 pts)

- [ ] RLS enabled on all Supabase tables
- [ ] PII Guardian: masks email, phone, TC, IBAN, credit card before DB insert
- [ ] Rate limiting: Upstash Redis on all server actions
- [ ] CSP headers: no unsafe-eval in production
- [ ] No SUPABASE_SERVICE_ROLE_KEY in client bundle
- [ ] Input validation: Zod schemas for all forms

### 2.4 Performance (20 pts)

- [ ] Lighthouse score: Performance > 90, Accessibility > 90
- [ ] First Contentful Paint: < 1.5s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Cumulative Layout Shift: < 0.1
- [ ] Image optimization: Next/Image with blur placeholder
- [ ] Font optimization: next/font with subset

### 2.5 Code Quality (20 pts)

- [ ] `pnpm typecheck`: 0 errors
- [ ] `pnpm lint`: 0 errors (warnings OK)
- [ ] `pnpm test`: 100% pass
- [ ] `pnpm build`: success
- [ ] No `as never` casts (or minimal, documented)
- [ ] No hardcoded secrets or API keys
- [ ] Husky + lint-staged active

**Score:** \_\_\_/100

---

## CATEGORY 3: DATA INTEGRITY & RELIABILITY — 100 points

### 3.1 Homepage Stats Accuracy (25 pts)

- [ ] Total incidents count matches DB (`incidents` table, status=published)
- [ ] Total providers count matches DB (`ai_providers` table)
- [ ] Countries count: sourced from incident data or hardcoded?
- [ ] "Last report: Just now" — is it real-time or static?
- [ ] Leaderboard preview: top 5 providers correct

### 3.2 Brand/Provider Pages (25 pts)

- [ ] Incident count on brand page matches incidents list
- [ ] Severity breakdown: correct numbers for each provider
- [ ] Response rate: calculated correctly (responses / incidents)
- [ ] Trust score: formula transparent and correct
- [ ] Models listed: correct count and details

### 3.3 Leaderboard Accuracy (25 pts)

- [ ] Sorting logic: by trust_score or incident_count?
- [ ] Response rate: 0% = 0% — secondary sort defined?
- [ ] ALPAR Autopilot: excluded from provider ranking
- [ ] All providers listed: no missing entries
- [ ] Share buttons: correct URLs (absolute, not relative)

### 3.4 Incidents Data (25 pts)

- [ ] All published incidents visible
- [ ] Severity badges: correct color coding
- [ ] Provider attribution: correct for each incident
- [ ] Vote counts: up-to-date (or 0 if no votes)
- [ ] View counts: incrementing correctly
- [ ] Dates: consistent format (MMM DD, YYYY)

**Score:** \_\_\_/100

---

## CATEGORY 4: CONTENT & COPYWRITING — 100 points

### 4.1 English Content (30 pts)

- [ ] Hero headline: emotional, memorable, < 10 words
- [ ] Hero subtitle: clear value proposition, < 30 words
- [ ] "How it works": 4 steps, actionable, no jargon
- [ ] "Why I Built This": personal story, emotional arc
- [ ] CTA buttons: action-oriented, not generic
- [ ] Footer: comprehensive but not cluttered

### 4.2 Turkish Content (30 pts)

- [ ] Hero headline: culturally resonant, not direct translation
- [ ] All UI elements translated (nav, buttons, forms)
- [ ] No hardcoded English in TR version
- [ ] Legal pages: fully translated (Terms, Privacy, Cookies)
- [ ] Date formats: adapted for TR locale
- [ ] Tone: formal yet approachable (not machine-translated)

### 4.3 Content Strategy (20 pts)

- [ ] Blog: at least 3 articles with quality content
- [ ] Tags: relevant categories (REGULATION, AI-GOVERNANCE, etc.)
- [ ] News ticker: real-time, relevant, multi-source
- [ ] Ecosystem Pulse: weekly updates, diverse sources
- [ ] Dilemmas: thought-provoking questions, balanced

### 4.4 Brand Voice (20 pts)

- [ ] Consistent tone: authoritative but not cold
- [ ] Emotional arc: Fear → Empathy → Solution → Action
- [ ] No empty phrases: "Built with care" → "Open source. Independent. Yours."
- [ ] Trust signals: specific, verifiable (AGPL, GDPR, EU-hosted)
- [ ] Founder story: present, compelling, personal

**Score:** \_\_\_/100

---

## CATEGORY 5: CONVERSION & USER FLOWS — 100 points

### 5.1 Submit Flow (30 pts)

- [ ] No login wall: anonymous submission works
- [ ] Form fields: title (200 chars), description (5000 chars), provider, model, category, severity, date
- [ ] Evidence upload: drag-and-drop, 10MB limit, images/videos/PDFs
- [ ] Consent checkboxes: 3 required + 1 optional (anonymous)
- [ ] PII masking: transparent to user ("automatically masked")
- [ ] Submit button: disabled until all required fields filled
- [ ] Success state: clear confirmation, next steps

### 5.2 Auth Flow (20 pts)

- [ ] Google OAuth: prominent, one-click
- [ ] Magic Link: email input, clear instructions
- [ ] Terms acceptance: required before sign-in
- [ ] Redirect: back to original page after auth
- [ ] Error handling: clear messages, retry options

### 5.3 Navigation Flow (25 pts)

- [ ] Homepage → Incidents: 1 click
- [ ] Homepage → Submit: 1 click (CTA prominent)
- [ ] Incidents → Brand page: 1 click (provider link)
- [ ] Brand page → Incidents list: scroll or anchor
- [ ] Footer → All key pages: accessible
- [ ] Breadcrumbs: present on subpages

### 5.4 Engagement Flow (25 pts)

- [ ] Vote system: working, visible, incentivized
- [ ] Comment system: present (or planned)
- [ ] Share buttons: working (X, LinkedIn, Copy Link)
- [ ] Founding Reporter program: clear CTA, badge system
- [ ] Partner/Contact: easy to find, form working

**Score:** \_\_\_/100

---

## CATEGORY 6: SEO & GROWTH MECHANICS — 100 points

### 6.1 Technical SEO (30 pts)

- [ ] Meta titles: unique per page, < 60 chars
- [ ] Meta descriptions: unique, < 160 chars
- [ ] Open Graph: images, titles, descriptions set
- [ ] Canonical URLs: correct
- [ ] Sitemap: generated, submitted
- [ ] Robots.txt: correct disallow rules
- [ ] Schema.org: structured data for articles, organization

### 6.2 Content SEO (30 pts)

- [ ] H1 tags: one per page, keyword-rich
- [ ] H2-H6 hierarchy: logical nesting
- [ ] Internal linking: incidents ↔ brands ↔ blog
- [ ] Alt text: all images have descriptive alt
- [ ] URL structure: clean, descriptive, no IDs

### 6.3 Growth Mechanics (20 pts)

- [ ] Social sharing: OG images for each incident
- [ ] Viral loops: "Report an incident" share prompt
- [ ] Email newsletter: signup present
- [ ] RSS feed: blog articles
- [ ] API access: public or planned

### 6.4 Analytics (20 pts)

- [ ] Vercel Analytics: active
- [ ] Plausible: EU-hosted, cookieless
- [ ] Conversion tracking: submit flow completion
- [ ] Heatmaps: planned or active (Hotjar, etc.)

**Score:** \_\_\_/100

---

## CATEGORY 7: LEGAL COMPLIANCE & TRUST — 100 points

### 7.1 Data Protection (30 pts)

- [ ] GDPR compliance: cookie consent, data minimization
- [ ] KVKK compliance: Turkish data protection law
- [ ] Privacy Policy: comprehensive, translated (EN+TR)
- [ ] Terms of Service: comprehensive, translated (EN+TR)
- [ ] Cookie Policy: present, explains all cookies
- [ ] Data deletion: right to erasure implemented

### 7.2 Platform Legal (30 pts)

- [ ] Intermediary status: Art. 14 EU E-Commerce Directive
- [ ] Takedown process: clear, documented, 7-day SLA
- [ ] Whistleblower protection: anonymous reporting
- [ ] Content ownership: users own their submissions
- [ ] No pre-moderation: PII masking + post-publication review

### 7.3 Trust Signals (20 pts)

- [ ] AGPL-3.0 license: visible, explained
- [ ] EU data hosting: Supabase eu-west-1, Vercel fra1
- [ ] Open source: GitHub repo linked, code auditable
- [ ] PII Guardian: explained, transparent
- [ ] Community verification: moderation process documented

### 7.4 Risk Mitigation (20 pts)

- [ ] SLAPP defense: legal fund, jurisdiction strategy
- [ ] Dual licensing: AGPL + commercial (planned)
- [ ] Insurance: cyber liability (planned)
- [ ] Audit trail: append-only audit_log table

**Score:** \_\_\_/100

---

## CATEGORY 8: i18n & LOCALIZATION — 100 points

### 8.1 Translation Completeness (30 pts)

- [ ] All UI strings translated (nav, buttons, forms, errors)
- [ ] All page content translated (headlines, descriptions)
- [ ] All legal pages translated (Terms, Privacy, Cookies, Takedown)
- [ ] No raw i18n keys visible (e.g., `legal.trustScoreMethodology`)
- [ ] Default values: used as fallback, not as primary

### 8.2 Translation Quality (30 pts)

- [ ] Natural Turkish: not machine-translated
- [ ] Cultural adaptation: idioms, tone, formality
- [ ] Technical terms: consistent (e.g., "incident" = "olay" everywhere)
- [ ] Date formats: locale-appropriate
- [ ] Number formats: locale-appropriate (1.000 vs 1,000)

### 8.3 Language Switching (20 pts)

- [ ] Switcher: visible on all pages (desktop + mobile)
- [ ] URL prefix: `/en/` and `/tr/` work correctly
- [ ] State preservation: switching language keeps current page
- [ ] No content loss: all content available in both languages
- [ ] SEO: hreflang tags set correctly

### 8.4 Edge Cases (20 pts)

- [ ] Long TR strings: no layout breakage (e.g., "Skor tablosu" vs "Leaderboard")
- [ ] Mixed content: some EN in TR page (e.g., incident titles from DB)
- [ ] RTL support: not needed (EN+TR only), but documented
- [ ] Fallback: if TR translation missing, EN fallback works

**Score:** \_\_\_/100

---

## CATEGORY 9: PROJECT MANAGEMENT & TECHNICAL DEBT — 100 points

### 9.1 Code Organization (25 pts)

- [ ] File structure: follows AGENTS.md conventions
- [ ] Component hierarchy: ui/ → feature/ → page
- [ ] Server actions: in `src/actions/`, typed, rate-limited
- [ ] Utilities: in `src/lib/utils/`, no duplicates
- [ ] Constants: in `src/lib/constants/`, centralized

### 9.2 Technical Debt (25 pts)

- [ ] `as never` casts: 0 (or documented exceptions)
- [ ] Hardcoded strings: 0 in components (all via i18n)
- [ ] Console.log: 0 in production code
- [ ] TODO/FIXME: tracked, not forgotten
- [ ] Duplicate code: identified, refactored

### 9.3 CI/CD Pipeline (25 pts)

- [ ] GitHub Actions: lint + typecheck + test on every PR
- [ ] Visual regression: Playwright screenshot tests
- [ ] i18n lint: raw key detection
- [ ] Deploy: automatic on merge to master
- [ ] Rollback: Vercel instant rollback available

### 9.4 Documentation (25 pts)

- [ ] README: comprehensive, up-to-date
- [ ] ARCHITECTURE.md: current, accurate
- [ ] ADRs: all major decisions documented
- [ ] CONTRIBUTING.md: clear guidelines
- [ ] API docs: if public API exists

**Score:** \_\_\_/100

---

## CATEGORY 10: COMMUNITY & VIRALITY — 100 points

### 10.1 Social Proof (30 pts)

- [ ] User count: visible, growing
- [ ] Incident count: visible, significant (> 50)
- [ ] Vote counts: visible on incidents
- [ ] Comment counts: visible (or "coming soon")
- [ ] Country count: visible, sourced from data

### 10.2 Community Features (30 pts)

- [ ] Founding Reporter program: active, badges awarded
- [ ] Dilemmas/Polls: active voting, diverse topics
- [ ] Suggestions: feature requests, community voting
- [ ] Leaderboard: provider ranking visible
- [ ] Blog: regular updates, community-contributed

### 10.3 Viral Mechanics (20 pts)

- [ ] Share buttons: on every incident, every page
- [ ] OG images: dynamic, compelling
- [ ] "Report an incident" CTA: prominent, easy
- [ ] Referral system: planned or active
- [ ] Email digest: weekly/monthly newsletter

### 10.4 Growth Metrics (20 pts)

- [ ] MAU tracking: active
- [ ] Conversion rate: submit flow completion
- [ ] Retention: returning users
- [ ] NPS: planned or active
- [ ] Organic traffic: growing

**Score:** \_\_\_/100

---

## SCORING SUMMARY

| #   | Category                | Weight   | Score (0-100) | Weighted Score  |
| --- | ----------------------- | -------- | ------------- | --------------- |
| 1   | UX/UI & Design          | 100      | \_\_\_        | \_\_\_          |
| 2   | Technical Architecture  | 100      | \_\_\_        | \_\_\_          |
| 3   | Data Integrity          | 100      | \_\_\_        | \_\_\_          |
| 4   | Content & Copywriting   | 100      | \_\_\_        | \_\_\_          |
| 5   | Conversion & User Flows | 100      | \_\_\_        | \_\_\_          |
| 6   | SEO & Growth            | 100      | \_\_\_        | \_\_\_          |
| 7   | Legal Compliance        | 100      | \_\_\_        | \_\_\_          |
| 8   | i18n & Localization     | 100      | \_\_\_        | \_\_\_          |
| 9   | Project Management      | 100      | \_\_\_        | \_\_\_          |
| 10  | Community & Virality    | 100      | \_\_\_        | \_\_\_          |
|     | **TOTAL**               | **1000** |               | **\_\_\_/1000** |

---

## BLOCKER CLASSIFICATION

### P0 — Critical (Must fix before launch)

- Platform unusable or misleading
- Data integrity violation
- Security vulnerability
- Legal non-compliance
- i18n raw keys visible

### P1 — High (Should fix within 1 week)

- Significant UX degradation
- Performance issues
- Missing essential features
- Content gaps

### P2 — Medium (Fix within 1 month)

- Minor UX issues
- Code quality improvements
- Documentation gaps
- Nice-to-have features

### P3 — Low (Backlog)

- Cosmetic issues
- Future enhancements
- Optimization opportunities

---

## OUTPUT FORMAT

Save your audit as a Markdown file in `docs/ai-audit/raw-reports/` with the naming convention:

```
[ModelName]-ALPAR-AI-360-[version].md
```

Example: `GPT-5.5-ALPAR-AI-360-v1.md`

Also register your audit in `docs/ai-audit/audit-registry.json` by adding an entry to the `audits` array.

---

## VERSION HISTORY

| Version | Date       | Changes                                           |
| ------- | ---------- | ------------------------------------------------- |
| 1.0     | 2026-06-08 | Initial checklist (10 categories)                 |
| 2.0     | 2026-06-22 | Added mobile, i18n, data integrity                |
| 3.0     | 2026-06-23 | Professional format, JSON output, prompt template |

---

_Created by opencode/mimo-v2.5-free | ALPAR AI Audit Framework_
