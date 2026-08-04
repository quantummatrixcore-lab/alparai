# ALPAR AI — Community & Forum Launch Content & Approval Document

> ⚠️ **FOUNDER APPROVAL GATE:**
> HN "Show HN" and Reddit submissions are subject to explicit Founder approval.
>
> - Status: `[x] Approved by Founder`
> - Total Tracked Model Providers: **47** (`src/lib/config/providers.ts`)

---

## 1. Hacker News (Show HN)

### Title Alternatives (Select One for Launch)

- **Option A (Recommended):** `Show HN: ALPAR AI – Open-source trust infrastructure & incident registry for LLMs`
- **Option B:** `Show HN: ALPAR AI – Real-world AI failure registry and PII-masked incident audit engine`
- **Option C:** `Show HN: We built an open-source platform tracking LLM hallucinations and security vulnerabilities`

### Submission Body (Founder Draft)

```markdown
Hey HN,

We built ALPAR AI (https://alparai.com) — an open-source trust infrastructure for AI accountability.

**The Problem:** Enterprise teams adopting LLMs face zero transparency regarding real-world model failure rates, jailbreak vulnerabilities, and EU AI Act compliance risks. Existing leaderboards focus purely on academic benchmarks rather than production incident safety.

**What ALPAR AI does:**

1. **Public Incident Registry:** Tracks and categorizes AI hallucinations, data leaks, and security failures. All user-submitted free text passes through a 14-category PII Guardian engine before DB insert (`src/lib/pii/guardian.ts`).
2. **K-BENCHMARK Evaluation:** Evaluates frontier and open-weights models across 47 active AI model providers (OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, Mistral, Cohere, NVIDIA, etc.) on Wilson-score reliability metrics.
3. **EU AI Act Art. 73 Tracker:** Live tracking for serious incident reporting readiness (`/transparency/art-73-tracker`).

The codebase is Next.js 15 App Router + Supabase PostgreSQL + AGPL-3.0 on GitHub:
https://github.com/quantummatrixcore-lab/Alparai.com

We'd love to hear your feedback on our evaluation metrics, PII masking approach, and incident taxonomy!
```

---

## 2. Reddit Community Submissions

> 🛡️ **Self-Promotion Compliance & Rules:**
> Reddit subreddits strictly enforce anti-spam rules and the 9:1 community contribution ratio.
>
> - **r/MachineLearning:** Requires technical depth, empirical data/methodology, and zero marketing jargon.
> - **r/netsec:** Requires pure technical security write-ups, threat models, or vulnerability analysis. No commercial promotion allowed.
> - **r/LocalLLaMA:** Requires benchmark methodology, open datasets, and explicit value for local/open-weights model deployers.

---

### 2a. Reddit r/MachineLearning (Empirical Failure Data & Taxonomy)

#### Title Alternatives

- **Option A (Recommended):** `ALPAR AI: An open-source empirical dataset and taxonomy of real-world LLM failure modes`
- **Option B:** `Analyzing 100+ real-world LLM hallucinations and jailbreaks across 47 model providers (Open Source)`
- **Option C:** `Quantifying production LLM reliability: Open-source incident registry & Wilson-score benchmark`

#### Submission Body

```markdown
Hi r/MachineLearning,

We are launching ALPAR AI (https://alparai.com), an open-source research initiative and platform tracking empirical AI failure modes, hallucinations, and safety incidents across 47 commercial and open-weights model providers.

**Motivation & Methodology:**
Standard static benchmarks (MMLU, GSM8K) fail to capture real-world production failure modes like contextual degradation, safety bypasses, and domain-specific hallucinations. ALPAR AI collects structured, reproducible incident logs and applies lower-bound Wilson confidence interval scoring to evaluate provider trust scores.

**Technical Architecture:**

- **PII Guardian:** Client/server sanitization filtering 14 categories of sensitive data (`src/lib/pii/guardian.ts`).
- **Provider Coverage:** 47 model providers tracked (OpenAI, Anthropic, Google, Meta, DeepSeek, Mistral, Qwen, etc.).
- **Open Data:** Public CSV/JSON datasets available for researchers and developers under AGPL-3.0.

GitHub Repository: https://github.com/quantummatrixcore-lab/Alparai.com

We invite feedback on our incident taxonomy, scoring formulas, and datasets!
```

---

### 2b. Reddit r/netsec (Technical Security & PII Ingestion Deep Dive)

#### Title Alternatives

- **Option A (Recommended):** `Technical Architecture of ALPAR AI: Open-Source PII Masking & AI Vulnerability Ingestion`
- **Option B:** `Open-Source AI Safety Ledger: 14-Category PII Masking & RLS Security Architecture`
- **Option C:** `Building a Zero-Trust AI Vulnerability & Incident Ingestion Pipeline with Next.js 15 & Supabase`

#### Submission Body

```markdown
Hi r/netsec,

We've open-sourced ALPAR AI (AGPL-3.0), a trust infrastructure designed to collect, sanitize, and score AI safety incidents and model vulnerabilities.

**Technical Highlights & Threat Model:**

- **Privacy-First Ingestion Pipeline:** User-submitted incident reports undergo 14-category client/server sanitization (`src/lib/pii/guardian.ts`) using regex and NLP masking (TCKN, credit cards, emails, IP addresses, names) before hitting PostgreSQL.
- **Row-Level Security (RLS):** Every Supabase database table enforces strict RLS policies; mutations strictly run via serverless Server Actions with zero direct client writes.
- **Wilson-Score Vulnerability Scoring:** Uses lower-bound Wilson confidence intervals to rank jailbreak resilience and hallucination severity across LLM providers.
- **Open Data & Datasets:** Public CSV/JSON dumps of anonymized incident reports for security researchers.

Code repository: https://github.com/quantummatrixcore-lab/Alparai.com

We welcome code audits, security feedback, and vulnerability taxonomy discussions!
```

---

### 2c. Reddit r/LocalLLaMA (Open Benchmarks & LLM Reliability Scoring)

#### Title Alternatives

- **Option A (Recommended):** `ALPAR AI: Open-source benchmark database for LLM hallucination and jailbreak rates`
- **Option B:** `Evaluating open-weights vs proprietary LLM reliability across 47 model providers`
- **Option C:** `ALPAR AI: Open incident database & reliability scoring for Llama, DeepSeek, Mistral & Qwen`

#### Submission Body

```markdown
Hi r/LocalLLaMA,

We are launching ALPAR AI (https://alparai.com), an open-source platform tracking real-world failure modes and reliability metrics for both open-weights (Llama 3.3, DeepSeek R1/V3, Mistral, Qwen) and proprietary models.

**Key Features for the Open-Source LLM Community:**

- **K-BENCHMARK:** Evaluates real-world jailbreak resilience, context decay, and hallucination rates across 47 model providers.
- **Open API & Public Datasets:** Raw anonymized incident datasets available in CSV and JSON formats.
- **Fully Open-Source (AGPL-3.0):** Built with Next.js 15 App Router, Supabase PostgreSQL, and Tailwind v4.

Repo: https://github.com/quantummatrixcore-lab/Alparai.com

We'd love to collaborate on open model evaluation datasets and custom benchmark suites!
```

---

## 3. Self-Promotion Guidelines & Rules Compliance

### Hacker News (Show HN Rules)

1. **Show HN Rule:** Must be something the submitter actually built that people can try out or inspect code for. (Satisfied: https://alparai.com & https://github.com/quantummatrixcore-lab/Alparai.com).
2. **Transparency:** Post submitter must explicitly state their role as creators in the post body.
3. **No Vote Manipulation:** Submissions must NOT be sent to email lists or Discord channels asking for upvotes. Upvotes must be 100% organic.
4. **Community Engagement:** Creators must remain active in the submission thread to answer technical questions about architecture, RLS, and PII masking.

### Reddit Self-Promotion Rules (9:1 Rule)

1. **Ratio:** Maintain a 9:1 ratio of helpful community contributions vs promotional links.
2. **Subreddit Specific Compliance:**
   - `r/netsec`: Pure technical breakdown. Zero marketing fluff. Must include technical threat model and code links.
   - `r/MachineLearning`: Must focus on dataset methodology, empirical evaluation, and research taxonomy.
   - `r/LocalLLaMA`: Must highlight open-weights model coverage (DeepSeek, Llama, Mistral, Qwen) and open data access.
3. **Disclosure:** Explicitly declare open-source AGPL-3.0 license and non-commercial open dataset availability.
