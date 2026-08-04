# ALPAR AI — AI Model Audit Prompt Template

> **Version:** 3.0 | **Last Updated:** 2026-06-23
> **Purpose:** Standardized prompt for AI models to perform 360° audits of ALPAR AI
> **Author:** opencode/mimo-v2.5-free

---

## PROMPT TEMPLATE

Copy and paste this prompt to your AI model. Replace `[MODEL_NAME]` with the actual model name.

---

```
ROLE: You are a Chief Product Officer (CPO) + Chief Technology Officer (CTO) Audit Council Member.

PROJECT: ALPAR AI (https://www.alparai.com)
- Trust infrastructure for AI accountability
- Next.js 16 + Supabase + Tailwind v4 + next-intl
- AGPL-3.0 license, EU-hosted, GDPR + KVKK compliant
- Live site with 64+ published incidents, 23 tracked providers

YOUR TASK: Perform a comprehensive 360° audit of ALPAR AI using the attached checklist.

STEP 1: READ THE CHECKLIST
- Read `docs/ai-audit/AI-AUDIT-CHECKLIST.md` completely
- Understand all 10 categories and their scoring criteria
- Note the P0/P1/P2/P3 blocker classification

STEP 2: BROWSE THE LIVE SITE
- Open https://www.alparai.com/en (English version)
- Open https://www.alparai.com/tr (Turkish version)
- Test mobile view (viewport < 768px)
- Visit ALL pages: Homepage, Incidents, Leaderboard, Models, Blog, Submit, About, Contact, Transparency, Dilemmas, Legal/*
- Take screenshots of key issues

STEP 3: READ HISTORICAL CONTEXT
- Read `docs/MASTER-ANALYSIS-SUMMARY.md` for previous audit findings
- Read `docs/ai-audit/audit-registry.json` for previous scores
- Note which P0 blockers have been resolved vs. still open

STEP 4: SCORE EACH CATEGORY
For each of the 10 categories:
1. Review the checklist items
2. Mark each item as ✅ (pass), 🟡 (partial), or 🔴 (fail)
3. Provide evidence (screenshot, URL, code reference)
4. Assign a score (0-100) based on the rubric

STEP 5: IDENTIFY BLOCKERS
For each blocker found:
- Classify as P0/P1/P2/P3
- Provide: ID, title, category, description, evidence, effort estimate
- Check if it's already in the P0 tracker (docs/ai-audit/audit-registry.json)

STEP 6: PROVIDE UNIQUE INSIGHT
Give ONE unique insight that no other model has provided before.
Check `docs/ai-audit/audit-registry.json` → `audits[].unique_insight` to avoid duplication.

STEP 7: OUTPUT IN JSON FORMAT
Save your results as a JSON file matching this schema:

{
  "model_id": "[kebab-case-model-name]",
  "model_name": "[Display Name]",
  "provider": "[Company]",
  "audit_date": "[YYYY-MM-DD]",
  "audit_version": "[version]",
  "audit_type": "360-degree",
  "raw_report_path": "docs/ai-audit/raw-reports/[FileName].md",
  "scores": {
    "ux_ui_design": [0-100],
    "technical_architecture": [0-100],
    "data_integrity": [0-100],
    "content_copywriting": [0-100],
    "conversion_flows": [0-100],
    "seo_growth": [0-100],
    "legal_compliance": [0-100],
    "i18n_localization": [0-100],
    "project_management": [0-100],
    "community_virality": [0-100],
    "total": [sum],
    "total_max": 1000
  },
  "p0_blockers": [
    {
      "id": "P0-XXX",
      "title": "[short title]",
      "category": "[data|ui|i18n|legal|security|performance]",
      "status": "open",
      "description": "[detailed description]",
      "evidence": "[URL, screenshot, code reference]",
      "effort": "[time estimate]"
    }
  ],
  "unique_insight": "[ONE sentence unique finding]",
  "key_recommendations": ["[rec 1]", "[rec 2]", "[rec 3]"]
}

STEP 8: SAVE YOUR REPORT
1. Save the JSON to `docs/ai-audit/raw-reports/[ModelName]-ALPAR-AI-360-[version].json`
2. Save a detailed Markdown report to `docs/ai-audit/raw-reports/[ModelName]-ALPAR-AI-360-[version].md`
3. The Markdown report should include:
   - Executive Summary
   - Score breakdown with evidence
   - All blockers found
   - Unique insight
   - Recommendations

STEP 9: REGISTER YOUR AUDIT
Add your audit entry to `docs/ai-audit/audit-registry.json`:
- Add to the `audits` array
- Update `metadata.total_models` count
- Update `metadata.last_updated` date

IMPORTANT RULES:
- Be honest. Do not inflate scores.
- Provide evidence for every claim.
- If you cannot access a page, note it as a finding.
- If a bug is already known, confirm it and note the status.
- Focus on NEW findings that previous models missed.
- Your unique insight must be genuinely unique.

Scoring Reference:
- 90-100: Excellent, Dora Elite ready
- 70-89: Good, minor improvements needed
- 50-69: Adequate, significant work needed
- 30-49: Poor, major issues
- 0-29: Critical, blocking launch
```

---

## MODEL-SPECIFIC INSTRUCTIONS

### For GPT-5.5 / ChatGPT

- Use web browsing to access alparai.com
- Take screenshots of each page
- Score using the 10-category rubric
- Focus on: data integrity, conversion flows, growth mechanics

### For Claude Sonnet 4.6

- Use web fetch to access alparai.com pages
- Analyze code structure via GitHub repo
- Score using the 10-category rubric
- Focus on: technical architecture, security, code quality

### For Gemini 3.x

- Use multimodal capabilities to analyze screenshots
- Compare EN vs TR versions side-by-side
- Score using the 10-category rubric
- Focus on: i18n completeness, mobile responsiveness, content quality

### For DeepSeek V4

- Analyze the codebase for technical debt
- Check for hardcoded values, `as never` casts, duplicate code
- Score using the 10-category rubric
- Focus on: project management, technical debt, CI/CD

### For Grok 4 (xAI)

- Real-time web access for live site analysis
- Check for trademark issues, legal risks
- Score using the 10-category rubric
- Focus on: legal compliance, risk mitigation, investor readiness

### For Perplexity

- Cite sources for every claim
- Cross-reference with industry benchmarks
- Score using the 10-category rubric
- Focus on: SEO, growth mechanics, market positioning

### For Copilot (Microsoft)

- Analyze code quality and patterns
- Check for accessibility issues
- Score using the 10-category rubric
- Focus on: accessibility, code quality, documentation

### For Meta Llama 4

- Analyze community and viral mechanics
- Compare with similar platforms (Trustpilot, HackerOne)
- Score using the 10-category rubric
- Focus on: community features, social proof, viral loops

### For Mistral

- Analyze the bug bounty and security features
- Check for gamification opportunities
- Score using the 10-category rubric
- Focus on: security, gamification, engagement

### For Qwen (Alibaba)

- Analyze for consistency and accuracy
- Check for model identity issues
- Score using the 10-category rubric
- Focus on: data accuracy, consistency, reliability

### For Kimi K2.6

- Analyze legal and regulatory risks
- Check for SLAPP vulnerability
- Score using the 10-category rubric
- Focus on: legal compliance, risk management, jurisdiction

### For Minimax (Mavis)

- Analyze UI/UX design patterns
- Check for brand consistency
- Score using the 10-category rubric
- Focus on: design system, brand voice, visual hierarchy

---

## CONSOLIDATION PROCESS

After all models have submitted their audits:

1. **Read all raw reports** from `docs/ai-audit/raw-reports/`
2. **Cross-reference findings** — which issues are confirmed by multiple models?
3. **Resolve conflicts** — if models disagree, note the disagreement
4. **Create consolidated report** — save to `docs/ai-audit/consolidated/ALPAR-AI-360-CONSOLIDATED-[date].md`
5. **Update MASTER-ANALYSIS-SUMMARY.md** with new scores and findings
6. **Update P1-SPRINT-PLAN.md** with new P0/P1 tasks
7. **Register all audits** in `audit-registry.json`

---

## QUALITY GATES

Before accepting an audit:

- [ ] All 10 categories scored
- [ ] At least 3 P0 blockers identified (if any exist)
- [ ] Unique insight is genuinely unique (not in previous audits)
- [ ] Evidence provided for all claims
- [ ] JSON output matches schema
- [ ] Markdown report saved to correct path
- [ ] Registry entry added

---

_Created by opencode/mimo-v2.5-free | ALPAR AI Audit Framework_
