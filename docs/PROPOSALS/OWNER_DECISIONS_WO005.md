# OWNER DECISIONS — WO-005 Phase C (2026-09-12, binding)

## 1. Route cleanup: APPROVED

Deprecate `about/advisory_board` → 301 to `about/advisory-board`; unify 8 auth redirects to canonical `/en/auth/signin` with `?mode=` + `next=`. Ship to implementation.

### 1b. Advisory-board canonical ruling (owner, 2026-09-12 night, IMPLEMENTED)

Hyphenated `about/advisory-board` stays a full standalone page (trust content: names, titles; must not be buried in `/about` or it loses visitors + search value). Underscore `about/advisory_board` is canonicalized via permanent 301 to the hyphenated URL — enforced twice: `next.config.mjs` redirects AND the in-page server redirect (`advisory_board/page.tsx`, noindex). Both hyphenated→/about redirects removed.

## 2. Hero pitch: APPROVED WITH ROTATOR (owner's marquee idea, disciplined)

- Static default (SEO + first paint): A — "Alpar AI is the sovereign trust infrastructure that independently audits, verifies, and indexes AI model failures with cryptographic proof."
- Rotate every 6s with pause (not infinite marquee, accessibility-safe): B — "Empowering organizations with real-time AI compliance, automated risk mitigation, and zero-knowledge incident tracking." / C — "The open-standard registry for AI reliability metrics, incident verification, and algorithmic accountability."

## 3. SLA: APPROVED WITH GUARDRAILS

72h standard + 12h critical + academy targets (500/50). Rationale: 4-turn debate worst case is tens of minutes (30-60s provider timeouts × calls × failover) — 72h is 100× headroom; self-hosted tiers fit the same envelope. Guardrails: instant public `pending` receipt on submit; queue-depth alarm pauses SLA clock with banner. Honesty note: debate currently also routes via external providers — do not market "100% local" until sovereign tier carries full load.

## 4. Badge: APPROVED (Option 1, marketing)

"EARLY ACCESS — 50% Founder Tier Discount Active" on pricing until MRR proof exists.
