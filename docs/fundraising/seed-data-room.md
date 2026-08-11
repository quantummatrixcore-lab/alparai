# ALPAR AI — Seed Data Room & Financial Model Matrix (#201)

**Company:** ALPAR AI Inc.  
**Domain:** Trust Infrastructure for AI Accountability & Sovereign AI Governance  
**URL:** https://alparai.com  
**Contact:** ercument.erden@alparai.com / hello@alparai.com  
**Target Round:** Seed (€750,000 SAFE / Equity)  
**Target Valuation:** €4.5M Post-Money (€3.75M Pre-Money)  
**Document Version:** 3.0.0 — Synchronized with MASTER_PLAN v12.131 & Seed Funding Strategy

---

## 1. Data Room Index & Document Architecture

This Data Room contains the complete strategic, regulatory, operational, financial, and architectural dossier for ALPAR AI’s Seed financing round ahead of the EU AI Act enforcement milestone.

| Document ID | Title / Target File Path                       | Category & Description                                        | Status     |
| ----------- | ---------------------------------------------- | ------------------------------------------------------------- | ---------- |
| **DR-01**   | `docs/INVESTOR/001-pitch-deck-v2.md`           | Executive Investor Pitch Deck & Product Vision                | Verified   |
| **DR-02**   | `docs/INVESTOR/002-financial-projection-3y.md` | 3-Year Financial & Unit Economic Model                        | Verified   |
| **DR-03**   | `docs/fundraising/seed-data-room.md`           | Master Data Room, LTV/CAC Formula & 18-Month Operational Burn | **Active** |
| **DR-04**   | `docs/fundraising/valuation-memo.md`           | €4.5M Post-Money Valuation Defense & SOM/TAM Justification    | **Active** |
| **DR-05**   | `docs/outreach/vc_partner_list_and_drafts.md`  | Top 20 VC Partner Roster & OpenChrome Warm Outreach Drafts    | **Active** |
| **DR-06**   | `docs/ARCHITECTURE.md`                         | System Architecture, 9-Model Failover & RLS Security Baseline | Verified   |
| **DR-07**   | `docs/EU_AI_ACT_TAXONOMY.md`                   | EU AI Act Article 73 Regulatory Mapping & System Taxonomy     | Verified   |

---

## 2. Unit Economics & LTV/CAC > 17x Mathematical Formulation

ALPAR AI operates a high-margin enterprise dual-tier monetization engine across vendor compliance subscriptions and enterprise AI monitoring SLAs.

### 2.1 Core Metrics & Assumptions

- **Vendor Tier Monthly Recurring Revenue (ARPU):** $299 / month (€275 / month)
- **Enterprise SLA Tier Monthly ARPU:** $2,499 / month (€2,300 / month)
- **Blended ARPU (Initial Cohort):** $450 / month
- **Customer Lifespan ($T$):** 10 Years (120 Months) — driven by high regulatory switching barriers, mandatory compliance record retention, and EU AI Act audit requirements.
- **Gross Margin ($GM$):** 85% (Optimized via 9-model LLM failover architecture using OpenCode free tier and low-overhead serverless backend).
- **Customer Acquisition Cost ($CAC$):** $1,750 per enterprise/vendor client (Inbound regulatory directory, organic open-core developer adoption, and public incident registry).

### 2.2 Mathematical Formulas & Calculations

#### Lifetime Value (LTV) Formula:

$$\text{LTV} = \text{ARPU} \times \text{Lifespan (Months)} \times \text{Gross Margin}$$

$$\text{Vendor LTV} = \$299 \times 120 \times 0.85 = \mathbf{\$30,498.00}$$

$$\text{Blended Enterprise LTV} = \$450 \times 120 \times 0.85 = \mathbf{\$45,900.00}$$

#### LTV / CAC Ratio Formula:

$$\text{LTV/CAC Ratio} = \frac{\text{LTV}}{\text{CAC}}$$

$$\text{Vendor LTV/CAC} = \frac{\$30,498}{\$1,750} = \mathbf{17.43\text{x}} \quad (> 17\text{x})$$

$$\text{Blended LTV/CAC} = \frac{\$45,900}{\$1,750} = \mathbf{26.22\text{x}}$$

#### CAC Payback Period:

$$\text{Payback Period (Months)} = \frac{\text{CAC}}{\text{ARPU} \times \text{Gross Margin}} = \frac{\$1,750}{\$299 \times 0.85} = \mathbf{6.88\text{ Months}}$$

> **Key Takeaway:** The **17.43x LTV/CAC ratio** and **<7-month CAC payback period** demonstrate capital-efficient SaaS growth powered by regulatory tailwinds and zero-cost inbound developer funnels.

---

## 3. EU AI Act Article 73 Market Analysis & Regulatory Tailwinds

### 3.1 Article 73 Mandate Overview (EU Database for High-Risk AI Systems)

Article 73 of the EU Artificial Intelligence Act establishes a mandatory **EU Database for High-Risk AI Systems** registered under Article 51, managed directly by the European Commission and national supervisory authorities.

#### Key Statutory Requirements under Article 73:

1. **Mandatory Public Registration:** Providers of high-risk AI systems must submit verifiable technical documentation, risk management summaries, and conformity assessment results prior to market placement.
2. **Continuous Post-Market Incident Reporting:** Providers and deployers must log, analyze, and report all serious incidents, system malfunctions, and systemic safety breaches directly to national competent authorities and the central EU repository within strict deadlines (15 days for general serious incidents, 2 days for critical infrastructure threats).
3. **Auditability & Traceability:** Enterprise deployers must maintain deterministic audit trails and automated decision logs for a minimum of 10 years to prove non-discriminatory and compliant AI operations.

### 3.2 Market Opportunity & ALPAR AI Strategic Positioning

```
+-----------------------------------------------------------------------------------+
|                        EU AI Act Article 73 Compliance Gap                        |
+-----------------------------------------------------------------------------------+
| High-Risk AI Providers  |  Requires third-party automated incident logging        |
| Enterprise Deployers    |  Requires deterministic audit trail & PII protection    |
| Regulatory Authorities  |  Requires standardized, tamper-evident risk metrics     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                      ALPAR AI Sovereign Trust Infrastructure                      |
|  - Real-time PII-Guardian Masking (`src/lib/pii/guardian.ts`)                    |
|  - Immutable PostgreSQL Audit Ledger with RLS isolation                           |
|  - Automated Article 73 Compliance Export & Incident Registry                     |
+-----------------------------------------------------------------------------------+
```

- **Target Customer Pain:** Enterprises face catastrophic fines up to **€35 Million or 7% of global turnover** for non-compliance with Article 73 and Article 12 (Record-keeping).
- **ALPAR AI Solution:** Serves as the turn-key "Stripe for AI Incident Reporting" — an off-the-shelf SDK and dashboard that automates Article 73 reporting pipelines and prevents PII leakage before data reaches external LLMs or public registries.

---

## 4. 18-Month Operational Burn & Runway Table

ALPAR AI maintains extreme capital discipline by combining automated engineering workflows with a serverless cloud footprint.

### 4.1 18-Month Financial Runway Schedule (€750,000 Target Raise)

| Operational Horizon | Monthly Burn Rate | Period Expenses  | Cumulative Spent | Remaining Capital (€750K Pool) | Key Milestones & Growth Targets                                                          |
| ------------------- | ----------------- | ---------------- | ---------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| **Months 1 – 6**    | €35,000 / mo      | €210,000         | €210,000         | €540,000                       | 50 AI Vendor Subscriptions (€15K MRR), EU AI Act Article 73 integration complete.        |
| **Months 7 – 12**   | €35,000 / mo      | €210,000         | €420,000         | €330,000                       | 150 Vendors + 20 Enterprise SLAs (€65K MRR), SOC2 Type II & ISO 42001 certification.     |
| **Months 13 – 18**  | €35,000 / mo      | €210,000         | €630,000         | €120,000                       | 300 Vendors + 60 Enterprise SLAs (€175K MRR / €2.1M ARR run-rate). Seed runway complete. |
| **Months 19 – 24**  | Net Cash Positive | €0 (Self-Funded) | €630,000         | **€120,000 Reserve**           | **Full Cash-Flow Positivity** achieved via ARR; Series A raised from position of power.  |

### 4.2 Monthly Burn Rate Breakdown (€35,000 / month)

1. **Engineering & Technical R&D (€17,500 / mo — 50%):** Core protocol maintenance, multi-model failover optimization, SDK development.
2. **Sales & Go-To-Market (€8,750 / mo — 25%):** Developer relations, Big-4 channel partner enablement, enterprise compliance events.
3. **Legal, Compliance & Audit (€5,250 / mo — 15%):** EU AI Act legal opinions, regulatory policy alignment, external security audits.
4. **Cloud Infrastructure & Tools (€3,500 / mo — 10%):** Supabase Enterprise tier, Vercel Pro hosting, multi-provider LLM API infrastructure.

---

## 5. Technology Stack & Proprietary Moat

- **Next.js 15 (App Router):** Strict TypeScript with `noUncheckedIndexedAccess`, zero `any` allowance, and server action mutations.
- **Supabase PostgreSQL & RLS:** 100% Row-Level Security policy enforcement on all tables with immutable trigger-based audit logs.
- **PII-Guardian Protocol (`src/lib/pii/guardian.ts`):** High-speed regex and NLP sanitization engine scrubbing user data prior to storage.
- **9-Model LLM Routing Architecture:** Resilient automatic failover across free and premium providers ensuring 99.99% availability for incident processing.
- **Native 5-Language i18n:** Full localization across English, Turkish, German, French, and Russian via `next-intl`.

---

_Document Version: 3.0.0 — Authoritative Seed Data Room_  
_Approved by: Ercüment Erden, Founder & Chief Architect (`ercument.erden@alparai.com`)_
