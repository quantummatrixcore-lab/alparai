# WORK-ORDER-005 Phase C — Business Track Proposals (PROPOSAL ONLY)

> [!IMPORTANT]
> This document contains non-binding business track proposals generated for owner review as specified in WORK-ORDER-005-FINAL-1000.md. No code or configuration changes will be shipped without explicit owner sign-off.

---

## 1. Route Deduplication & URL Normalization Strategy

### A. Redundant / Duplicate Routes Analysis
- **`about/advisory_board` vs `about/advisory-board`**:
  - **Status**: Duplicate route directories exist in `src/app/[locale]/about/`.
  - **Proposal**: Deprecate `about/advisory_board` with a 301 Permanent Redirect to canonical hyphenated route `about/advisory-board`.
- **Auth Redirect Unification**:
  - **Status**: 8 legacy redirect endpoints (`/login`, `/signin`, `/auth/login`, `/register`, `/signup`, `/auth/register`, `/auth/callback`, `/auth/google`).
  - **Proposal**: Consolidate primary entry points to canonical `/en/auth/signin` with unified `?mode=signup` or `?mode=login` query parameter and standardized `next=` redirect parameter.

---

## 2. One-Sentence Hero Pitch Freeze (3 Candidates)

1. **Candidate A (Accountability Focus - Recommended)**:
   > *"Alpar AI is the sovereign trust infrastructure that independently audits, verifies, and indexes AI model failures with cryptographic proof."*

2. **Candidate B (Enterprise Governance Focus)**:
   > *"Empowering organizations with real-time AI compliance, automated risk mitigation, and zero-knowledge incident tracking."*

3. **Candidate C (Developer / Open-Source Focus)**:
   > *"The open-standard registry for AI reliability metrics, incident verification, and algorithmic accountability."*

---

## 3. UGC Incident Verification SLA & Academy Metrics Draft

### A. User-Generated Content (UGC) Verification SLA
- **Standard Verification SLA**: 72 hours for community incident submission $\rightarrow$ multi-agent cross-audit $\rightarrow$ public status transition (`pending` $\rightarrow$ `published` or `rejected`).
- **Emergency / High-Severity SLA**: 12 hours for Critical / P0 incidents posing immediate safety or privacy risks.

### B. Academy Operational Metrics Target (Q3/Q4)
- **Graduates Target**: 500 Certified AI Reliability Auditors.
- **Active Fellows Target**: 50 Senior Research Fellows conducting automated red-teaming and compliance audits.

---

## 4. Pricing & Monetization "Early Access" Badge Copy

### A. Badge Copy Options
- **Option 1 (Recommended)**: `⚡ EARLY ACCESS — 50% Founder Tier Discount Active`
- **Option 2**: `🛡️ SOVEREIGN BETA — Unlimited Cross-Audits Included`
- **Option 3**: `🚀 LAUNCH EDITION — Lock in Lifetime Enterprise Rates`

---

*End of WO-005 Phase C Business Proposals.*
