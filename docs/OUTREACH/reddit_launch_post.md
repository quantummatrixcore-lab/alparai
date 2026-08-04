# Reddit Launch Post Drafts (r/MachineLearning & r/cybersecurity)

## Option A: Target `r/MachineLearning` [Project / Discussion]

**Title:** Show r/ML: ALPAR AI — Open Source Trust & Incident Registry for AI Accountability (EU AI Act Article 73 Aligned)

**Body:**

Hey r/MachineLearning!

Over the past few years, we’ve seen AI failures move from benign hallucinations to critical safety incidents, data leaks, and algorithmic bias. However, the public record for AI incidents has historically been fragmented across tweets, forum threads, and obscure GitHub issues.

With **EU AI Act Article 73** making serious-incident reporting mandatory, we built **ALPAR AI** ([alparai.com](https://alparai.com)) — an independent, open-source trust infrastructure for AI accountability. Think of it as a public, verifiable registry for AI failures and model ratings (the "Moody's for AI").

### Key Open-Source Features:

- **AGPL-3.0 Licensed:** The frontend, database schemas, and PII Guardian masking pipeline are 100% open source.
- **PII Guardian:** Every user submission passes through an automated regex + LLM masking pipeline (emails, phone numbers, API keys, IBANs) before hit to DB.
- **Provider Right-to-Respond:** AI labs can verify their domain and publish official incident responses.
- **K-BENCHMARK & TrustScore:** Adversarial cross-evaluations and statistical scoring of model reliability.

Check out the code & methodology on GitHub: [github.com/quantummatrixcore-lab/alparai](https://github.com/quantummatrixcore-lab/alparai)

We’d love feedback on our PII masking pipeline and model rating methodology from the ML community!

---

## Option B: Target `r/netsec` or `r/cybersecurity`

**Title:** Launch: Open-Source AI Incident & Security Vulnerability Registry with Automated PII Guardian

**Body:**

Hi security community,

As LLM applications move into production, security threats like prompt injections, slopsquatting, and data leaks are escalating rapidly.

We’ve launched **ALPAR AI**, an open-source incident reporting registry designed to track AI system vulnerabilities, hallucinations, and safety breaches in real time.

### Security Architecture:

1. **Automated PII Stripping:** Client-side & server-side PII Guardian masks all credentials, tokens, and personal data before storage.
2. **Vulnerability Disclosure Policy (VDP):** Integrated HackerOne VDP for responsible disclosure of platform & model vulnerabilities.
3. **EU Hosting & RLS Hardened:** Frankfurt deployment with zero-trust PostgreSQL Row-Level Security policies.

Repository: [github.com/quantummatrixcore-lab/alparai](https://github.com/quantummatrixcore-lab/alparai)

Looking forward to your security audits and feedback!
