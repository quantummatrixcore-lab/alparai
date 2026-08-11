# The Grok Files — Day 7: Algorithmic Bias & Discrimination in Automated Screening

**Series:** The Grok Files: A 10-Day Expose on AI Reliability & Accountability  
**Publication Date:** Day 7  
**Author:** ALPAR AI Research & Risk Intelligence Lab  
**Category:** Ethical AI / Algorithmic Bias

---

## Executive Summary

Automated recruitment, credit scoring, and incident prioritization algorithms frequently encode implicit societal biases into binary automated decisions. Day 7 of _The Grok Files_ exposes how uncalibrated scoring algorithms amplify discrimination against protected characteristics under the guise of objective AI scoring.

---

## 1. Tactical Failure Analysis: Proxy Discrimination

Even when protected fields (gender, age, ethnicity) are removed from input payloads, LLMs and embedding models infer demographic traits through proxy variables:

- **ZIP Code & School Names:** Proxy indicators for socio-economic background and ethnicity.
- **Linguistic Markers:** Native accent or localized phrasing in voice-to-text transcripts triggering lower competence confidence scores.
- **Work History Gaps:** Scoring penalties applied automatically without context regarding medical or parental leave.

---

## 2. Regulatory Compliance Mandates (EU AI Act & NYC Automated Employment Decision Tools Law)

- **NYC Local Law 144:** Mandates annual independent bias audits for automated employment decision tools (AEDT).
- **EU AI Act High-Risk Classification (Annex III):** AI systems used in recruitment, credit scoring, and public service allocation are classified as High-Risk, requiring continuous bias testing, transparency, and human oversight.

---

## 3. The ALPAR AI Solution: Algorithmic Fairness Auditing & Metric Tracking

1. **Disparate Impact Ratio Analysis:** Continuous monitoring of selection rates across demographic sub-groups (4/5ths Rule adherence).
2. **Feature Importance Decomposition:** Explaining decision outputs to ensure proxy attributes do not drive automated risk scores.
3. **Transparent Bias Risk Reports:** Automated public and internal audit reporting for compliance teams.

---

_Next in series: Day 8 — Supply Chain Contamination & Model Context Protocol (MCP) Vulnerabilities._
