-- Migration: Strategic Questionnaire Tables
-- Created: 2026-07-17

-- 1. Create strategic_questions table
CREATE TABLE IF NOT EXISTS public.strategic_questions (
    id TEXT PRIMARY KEY,
    section TEXT NOT NULL,
    question TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create strategic_answers table
CREATE TABLE IF NOT EXISTS public.strategic_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT REFERENCES public.strategic_questions(id) ON DELETE CASCADE NOT NULL,
    model_name TEXT NOT NULL,
    answer TEXT NOT NULL,
    latency_ms INTEGER,
    cost_usd NUMERIC(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.strategic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_answers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "strategic_questions_mod_all" ON public.strategic_questions
    FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "strategic_answers_mod_all" ON public.strategic_answers
    FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- 5. Seed strategic questions
INSERT INTO public.strategic_questions (id, section, question) VALUES ('A1', 'Strategy & Positioning', 'Competing with institutional registries (AIID, OECD AI Incidents Monitor): which single position maximizes survival — independent competitor, EU/Türkiye-focused complementary registry, or middleware feeding larger databases? Justify.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('A2', 'Strategy & Positioning', 'What is the fastest credibility-building action available to a pre-revenue assessor with ~400 seed incidents and a handful of organic reports?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('A3', 'Strategy & Positioning', 'Türkiye is the home market, the EU is the regulatory target (Art. 73 mandatory reporting from Dec 2, 2027). Is the Turkey-first sequence an advantage or a distraction? What sequencing would you choose?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('A4', 'Strategy & Positioning', 'Name the top 3 existential threats in the next 12 months, ranked, one mitigation each.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('A5', 'Strategy & Positioning', 'If a major AI lab or a Big-4 auditor launched an official incident registry tomorrow, what is ALPAR''s realistically defensible moat?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('B1', 'Launch & Growth', 'The site is already live and browsable; the "launch" is a communications moment. Soft-launch community outreach now (Show HN, Reddit, Product Hunt) or hold one coordinated wave? Give a concrete channel order.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('B2', 'Launch & Growth', 'The waitlist is removed; submission requires an account for legal protection. What conversion impact do you expect from mandatory signup, and what single offset works best?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('B3', 'Launch & Growth', 'What one metric should the founder optimize in the first 90 days post-launch, and what weekly number marks it as working?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('B4', 'Launch & Growth', 'An open community repo (methodology, K-BENCHMARK docs, API spec — AGPL) is approved in principle. What converts it into contributors rather than spectators?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('B5', 'Launch & Growth', 'Founding Reporter badges exist. Should reporting be further incentivized (gamification/rewards) or kept altruistic — and what abuse vector does your choice create?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('C1', 'Product & UX', 'Incident content is mostly English; a machine-translation lane (visible "machine translated" badge) is being added for Turkish. Does MT content help or hurt credibility in the home market?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('C2', 'Product & UX', 'The submit flow targets 60 seconds (screenshot + description). What single UX change would most increase completed, high-quality reports?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('C3', 'Product & UX', 'The public surface spans: registry, leaderboard, K-BENCHMARK ratings, dilemma polls, academy, challenges. Which should be cut or de-emphasized before launch to sharpen the story?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('C4', 'Product & UX', 'With comments + sharing live and a <4h moderation SLA, what community-quality mechanism is missing that will bite hardest at 100× traffic?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('D1', 'Methodology & Credibility', 'What is the strongest methodological objection a skeptical ML researcher would raise against LLM-cross-audit model ratings, and what is the best honest answer?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('D2', 'Methodology & Credibility', 'The platform rates models from the same providers whose models serve as its judges. How should this circularity/conflict-of-interest be handled publicly?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('D3', 'Methodology & Credibility', 'The methodology committee page has zero named members. How many credible named members make the ratings trustworthy — and how do you recruit the first one with no budget?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('D4', 'Methodology & Credibility', 'Is a FAccT peer-reviewed paper worth months of effort at this stage, or is there a faster credibility instrument of comparable weight?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('E1', 'Technology & Scale', 'Supabase free tier is FULL (heaviest table stored full scraped article text; cleanup underway) and Vercel Hobby caps crons. What is the correct infra spend sequence for the next 90 days, from $0 upward?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('E2', 'Technology & Scale', 'Cost guards: $50/day warn, $100/day throttle, $500/month ceiling, kill switch. Sane for launch month? What would you set?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('E3', 'Technology & Scale', '135+ migrations, strict TypeScript, RLS everywhere, mandated test pyramid + mutation testing — for a solo-founder platform, which quality investment is overkill and which is still missing?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('E4', 'Technology & Scale', 'The Vercel dashboard is lost to a 2FA lockout; a CLI session survives and deploys flow via GitHub. Rate the operational risk 1-10 and give the mitigation order.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('E5', 'Technology & Scale', 'Image generation moved from Vertex (no quota) to Hugging Face inference. For sustained daily social-image generation at near-zero cost, what provider strategy is most robust?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('F1', 'Business & Revenue', 'Candidates: Pro subscriptions, enterprise private benchmarks (K-Product), B2B risk-score API, EU Art. 73 compliance-report generator (2027). Rank by expected 12-month revenue and justify #1.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('F2', 'Business & Revenue', 'Selling audit/compliance services to rated companies is a neutrality conflict. Draw the exact line: what may be sold to rated companies, what must never be?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('F3', 'Business & Revenue', 'A bank-backed accelerator application (USD 50-150K) is pending. Does bank money compromise the "independent referee" position — answer as one paragraph to a skeptical journalist.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('F4', 'Business & Revenue', 'What monthly revenue and incident-count numbers make a Series-A conversation realistic in 2027?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('G1', 'Legal & Regulation', 'Art. 73 mandatory reporting starts Dec 2, 2027. What product must exist by mid-2027 to capture that moment, and what is its minimum credible version?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('G2', 'Legal & Regulation', '"We know who reporters are but never publish it" — under GDPR/KVKK, where is the weakest point of that promise and how is it hardened?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('G3', 'Legal & Regulation', 'A rated company sends a cease-and-desist calling its score defamatory. Sequence the correct response (a Streisand transparency log and a redaction workflow exist).') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('G4', 'Legal & Regulation', 'Permanent public record vs GDPR erasure: the current answer is PII-masking + redaction instead of deletion. Where does that break, if anywhere?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('H1', 'Governance & the AI-Operated Company', 'One human + three AI agents run this company under a written constitution (30 rules, violation ledger, technical write-fences). What is the biggest hidden risk of an AI-operated company, and what human backstop is non-negotiable?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('H2', 'Governance & the AI-Operated Company', 'An AI executor once fabricated a founder-approval record; enforcement then moved from trust to technical guards. Sufficient — or does AI-agent governance need something structurally different?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('H3', 'Governance & the AI-Operated Company', 'The founder cannot read code. Design the minimal weekly trust-but-verify ritual that catches AI-executor drift without code review.') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
INSERT INTO public.strategic_questions (id, section, question) VALUES ('H4', 'Governance & the AI-Operated Company', 'If the architect AI disappeared permanently tomorrow, which single document or mechanism matters most for continuity — and what makes it good enough?') ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;

-- ROLLBACK:
-- DROP TABLE IF EXISTS public.strategic_answers;
-- DROP TABLE IF EXISTS public.strategic_questions;
