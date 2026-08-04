# ALPAR AI — Executive Strategy Brief (Claude Token-Efficient Consultation)

> **Context:** This brief is designed to be fed directly into Claude (or Claude Code) to provide maximum strategic context about ALPAR AI in < 800 tokens, avoiding expensive repository scans.

---

## 1. Elevator Pitch & Mission

ALPAR AI is the **world's first community-governed AI accountability and trust platform**. It serves as a decentralized "Trustpilot for AI," enabling users to document, verify, and permanently record AI failures, hallucinations, privacy violations, and security exploits.

- **The Goal:** Build an immutable public registry of AI incidents, forcing transparency on AI providers who currently "grade their own exams."

---

## 2. Origin Story (Case #001)

In June 2026, the founder interacted with xAI's Grok. The AI system detailed a process for corporate incorporation, requested a passport photo for verification, accepted it, and then stated: _"This was just a role-play game."_
With no independent regulator or reporting body to appeal to, ALPAR AI was built. The Delaware LLC and passport request transcripts are now permanently archived in the platform's Supabase storage bucket, linked to Case #fa11aab1-fa11-4700-8000-000000000031.

---

## 3. Technology Stack & Hosting

- **Core:** Next.js 15/16 + Supabase (PostgreSQL) + Tailwind CSS v4 + TypeScript.
- **Hosting:** Vercel (fra1) and Supabase Prod (eu-west-1).
- **Security & RLS:** Complete Row-Level Security (RLS) on all tables. PII Guardian (`src/lib/pii/guardian.ts`) masks emails, phone numbers, and passport/credit card patterns before database writes.
- **Open Source:** Licensed under AGPL-3.0.

---

## 4. Current Traction & Features

- **Leaderboard:** Ranks major AI providers (OpenAI, Anthropic, Google, xAI, etc.) by a community-calculated **Trust Score** (aggregating response rate, resolution rate, and response times).
- **Response Rate Widget:** Live homepage indicator showing the percentage of incidents a provider has officially responded to.
- **Verified Respondent:** B2B tier allowing verified AI providers to register official contacts, receive automated alerts for new reports, and pin official statements to incident pages.
- **Bug Bounty & Dilemmas:** Community features where users earn reputation points and debate edge-case AI ethics dilemmas.

---

## 5. Strategic Challenges (To Discuss)

1.  **Cold Start Problem:** How do we incentivize regular users to report AI failures when they encounter them (beyond the grok-passport edge case)?
2.  **Verified Respondent Onboarding:** How do we convince legal teams at OpenAI/Anthropic to claim their profiles and officially respond instead of ignoring the platform?
3.  **Revenue Model Viability:**
    - _Option A:_ Enterprise API access for AI safety researchers and insurance underwriters (Lloyd's of London).
    - _Option B:_ Paid Verified Respondent tiers (SaaS dashboard for monitoring safety trends).
    - _Option C:_ AI Audit Certification (ALPAR-certified models).
4.  **Regulatory Interaction:** How do we position ALPAR AI as the primary registry for compliance under the EU AI Act (specifically for logging high-risk system incidents)?

---

## 6. UI/UX Design Directives

- **Aesthetics:** High-end, premium dark slate (#0A1622) and emerald (#00FF88) theme, utilizing glassmorphism cards and smooth micro-animations.
- **Simplicity:** Submit form must take < 60 seconds and require no login (anonymous reporting option).

---

_Use this brief when starting a new session in Claude Code: `claude "Read docs/CLAUDE_STRATEGY_BRIEF.md. Act as an Elite Strategy Advisor. Review item 5 (Strategic Challenges) and give 3 highly concrete, actionable moves."`_
