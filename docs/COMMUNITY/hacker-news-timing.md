# ALPAR AI — Hacker News Launch Strategy & Timing Guide

> ⚠️ **GOVERNANCE MANDATE:** All Hacker News posts and official comments are subject to explicit Founder approval prior to submission.

---

## 1. Optimal Submission Window (En İyi Gönderim Zamanlaması)

For maximum front-page visibility and upvote velocity on Hacker News (HN):

- **Target Days:** **Tuesday** or **Wednesday** (Highest technical engagement window).
- **Target Time Window:** **08:00 – 10:00 ET (Eastern Time)** / **15:00 – 17:00 TSI (Türkiye Saati)**.
- **Rationale:** 
  - Submitting at 08:00 ET catches US East Coast morning readers entering work hours, EU afternoon technical activity, and builds upvote momentum right as US West Coast (05:00–08:00 PT) wakes up.
  - Avoids weekend drop-offs (low technical readership) and Friday afternoon post decay.

---

## 2. Recommended Title Options (Önerilen Başlık Seçenekleri)

All proposed titles strictly adhere to the **<= 60 character limit** for maximum readability on HN mobile and desktop feeds:

| Option | Title | Char Count | Strategic Angle |
| :--- | :--- | :--- | :--- |
| **Option 1 (Recommended)** | `Show HN: ALPAR AI – Open-Source AI Incident Registry` | **52 chars** | Open-source & incident registry focus |
| **Option 2** | `Show HN: ALPAR AI – EU AI Act & Open AI Incident Database` | **59 chars** | Regulatory compliance & open data angle |
| **Option 3** | `Show HN: ALPAR AI – Open LLM Reliability & Incident Tracker` | **58 chars** | Benchmark & reliability angle |

---

## 3. Organic Community Reaction Scenarios & Response Framework

Anticipated organic community feedback scenarios on Hacker News and recommended technical responses:

### Senaryo A: PII & Data Ingestion Skepticism
- **Community Query:** *"How do you handle privacy when users submit incident logs containing sensitive enterprise data or PII?"*
- **Response Framework:**
  - Explain the multi-layer **PII Guardian** (`src/lib/pii/guardian.ts`).
  - Highlight client-side regex + server-side NLP masking across 14 PII categories (TCKN, credit cards, emails, IP addresses, names, API keys) before database insertion.
  - State that raw PII is never stored in Supabase PostgreSQL tables.

### Senaryo B: AGPL-3.0 Licensing & Open-Source Commitment
- **Community Query:** *"Why choose AGPL-3.0 over MIT/Apache 2.0? Is there a proprietary cloud lock-in?"*
- **Response Framework:**
  - Emphasize ALPAR AI's commitment to public trust infrastructure. AGPL-3.0 ensures that any cloud provider running the registry must contribute improvements back to the open-source community.
  - Confirm full self-hostability via Next.js 15 App Router and Supabase (`pnpm db:reset` / `pnpm dev`).

### Senaryo C: Differentiation from LMSYS & Benchmark Leaderboards
- **Community Query:** *"How does ALPAR AI differ from LMSYS Chatbot Arena or HuggingFace Leaderboard?"*
- **Response Framework:**
  - Clarify the core mission difference: LMSYS measures user preference, and HuggingFace measures academic NLP benchmarks.
  - ALPAR AI measures **production incident failure modes, Wilson-score reliability, jailbreak vulnerability rates, and EU AI Act Art. 73 compliance metrics**.

---

## 4. Launch Day Checklist

- [ ] Founder approval confirmed for title selection and body text.
- [ ] Live production environment (`https://alparai.com`) verified healthy.
- [ ] GitHub repository (`https://github.com/quantummatrixcore-lab/Alparai.com`) set to public with active AGPL-3.0 badge.
- [ ] Team members ready to answer technical comments in the thread within the first 60 minutes.
