<!--
  ALPAR AI — Pull Request Template
  Operating Standard: Opus Engineering & DORA Elite Protocol
  License: AGPL-3.0
-->

## 📌 Architectural Overview & Context

<!-- Provide a concise summary of the problem, architectural context, and solution. -->

### Problem & Motivation

<!-- What problem does this PR solve? Reference relevant issues or Incident Passports. -->

### Proposed Changes & Architectural Impact

<!-- Summarize changes made across server actions, components, database migrations, or schemas. -->

---

## 🎯 Type of Change

- [ ] 🐛 **Bug Fix** (non-breaking fix for an issue)
- [ ] ✨ **New Feature** (non-breaking addition aligned with core pillars)
- [ ] 💥 **Breaking Change** (fix or feature modifying API/data contracts)
- [ ] 🗄️ **Database Migration** (schema update with verified RLS & rollback)
- [ ] ♻️ **Refactoring** (performance, code health, zero functional regression)
- [ ] 🛡️ **Security & Privacy** (PII Guardian, Epistemic Firewall, auth hardening)
- [ ] 🌐 **Localization** (updates to `messages/en.json` & `messages/tr.json`)
- [ ] 📚 **Documentation / Compliance** (EU AI Act, ISO/IEC 27037, DORA)

---

## ⚡ Opus Engineering Three-Gate Quality Control

All pull requests MUST pass the Opus Three-Gate Crucible before review or merge.

### Gate 1: Compiles & Static Integrity

- [ ] **Lint Cleanliness:** `pnpm lint` passed with **0 warnings** (`--max-warnings 0`).
- [ ] **Type Sovereignty:** `pnpm typecheck` passed with **0 errors** (`noUncheckedIndexedAccess` strictly satisfied).
- [ ] **No `any` Keyword:** No usages of `any`; all dynamic payloads typed as `unknown` and parsed via **Zod Strict Contracts**.

### Gate 2: Test Suite & Zero-Entropy Verification

- [ ] **Fast Test Suite:** `pnpm test:fast` executed and 100% green (contracts, security, API health).
- [ ] **Regression Resilience:** New unit/integration tests added covering modified paths (`pnpm test`).
- [ ] **Zero-State Placeholders:** Strictly NO `// TODO`, `pass`, placeholder stubs, or mock data. Code is production-ready.

### Gate 3: Database Sovereignty & Security (RLS)

- [ ] **Server Action Isolation:** State mutations occur EXCLUSIVELY via `src/actions/<domain>.ts`.
- [ ] **Client Mutation Ban:** Absolutely NO client-side direct mutations (e.g. `dehost.from().insert()` is forbidden).
- [ ] **Row-Level Security (RLS):** Every new/modified table has strict RLS policies defined in the migration file.
- [ ] **Deterministic Rollback:** Migration includes an explicit `-- ROLLBACK:` SQL block.

---

## 🔐 Privacy, Security & Isolation Checklist

- [ ] **PII Guardian Protocol:** Free-text user inputs are sanitized via `src/lib/pii/guardian.ts` prior to persistence.
- [ ] **Zero-Knowledge Logging:** No raw IPs, personal emails, secrets, or unhashed PII logged. Cryptographic hashing is applied.
- [ ] **Secret Hygiene:** `DEHOST_SERVICE_ROLE_KEY` or sensitive credentials never leak to client-side bundles.
- [ ] **Port 22 Prohibition:** No code, scripts, or container definitions reference or expose Port 22 (Zero-Trust / WireGuard Mesh VPN only).

---

## 🌐 UI, i18n & Architecture Standards

- [ ] **Strict i18n:** Zero hardcoded strings in UI components; all user-facing copy mapped in `messages/en.json` and `messages/tr.json`.
- [ ] **Tailwind v4 Primitives:** Styling strictly uses Tailwind v4 primitives (`@theme inline` in `globals.css`). No legacy `tailwind.config.ts`.
- [ ] **Component Taxonomy:** `src/components/ui/` contains only pure primitive components; domain logic isolated in feature directories.

---

## 🔗 Related Issues & Artifacts

- Closes #<!-- Issue Number -->
- Incident Passport Hash: `<!-- 0x... if applicable -->`
- Spec / Proposal: `<!-- Link to docs/PROPOSALS/... or task -->`

---

## ✍️ Developer Certificate of Origin (DCO 1.1)

By signing below, I certify that this contribution is original, compliant with the AGPL-3.0 license, and meets the Open-Core integrity standards of ALPAR AI:

```text
Signed-off-by: Full Name <developer@example.com>
```
