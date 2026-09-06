export interface Question {
  id: string;
  section: string;
  sectionLabel: string;
  text: string;
}

export const SECTIONS: { id: string; label: string; start: number; end: number }[] = [
  { id: "A", label: "A. Strategy & Positioning", start: 1, end: 5 },
  { id: "B", label: "B. Launch & Growth", start: 6, end: 10 },
  { id: "C", label: "C. Product & UX", start: 11, end: 14 },
  { id: "D", label: "D. Methodology & Credibility", start: 15, end: 18 },
  { id: "E", label: "E. Technology & Scale", start: 19, end: 23 },
  { id: "F", label: "F. Business & Revenue", start: 24, end: 27 },
  { id: "G", label: "G. Legal & Regulation", start: 28, end: 31 },
  { id: "H", label: "H. Governance & the AI-Operated Company", start: 32, end: 35 },
];

export const QUESTIONS: Question[] = [
  {
    id: "A1",
    section: "A",
    sectionLabel: "A. Strategy & Positioning",
    text: "Competing with institutional registries (AIID, OECD AI Incidents Monitor): which single position maximizes survival — independent competitor, EU/Türkiye-focused complementary registry, or middleware feeding larger databases? Justify.",
  },
  {
    id: "A2",
    section: "A",
    sectionLabel: "A. Strategy & Positioning",
    text: "What is the fastest credibility-building action available to a pre-revenue assessor with ~400 seed incidents and a handful of organic reports?",
  },
  {
    id: "A3",
    section: "A",
    sectionLabel: "A. Strategy & Positioning",
    text: "Türkiye is the home market, the EU is the regulatory target (Art. 73 mandatory reporting from Dec 2, 2027). Is the Turkey-first sequence an advantage or a distraction? What sequencing would you choose?",
  },
  {
    id: "A4",
    section: "A",
    sectionLabel: "A. Strategy & Positioning",
    text: "Name the top 3 existential threats in the next 12 months, ranked, one mitigation each.",
  },
  {
    id: "A5",
    section: "A",
    sectionLabel: "A. Strategy & Positioning",
    text: "If a major AI lab or a Big-4 auditor launched an official incident registry tomorrow, what is ALPAR's realistically defensible moat?",
  },
  {
    id: "B1",
    section: "B",
    sectionLabel: "B. Launch & Growth",
    text: "The site is already live and browsable; the 'launch' is a communications moment. Soft-launch community outreach now (Show HN, Reddit, Product Hunt) or hold one coordinated wave? Give a concrete channel order.",
  },
  {
    id: "B2",
    section: "B",
    sectionLabel: "B. Launch & Growth",
    text: "The waitlist is removed; submission requires an account for legal protection. What conversion impact do you expect from mandatory signup, and what single offset works best?",
  },
  {
    id: "B3",
    section: "B",
    sectionLabel: "B. Launch & Growth",
    text: "What one metric should the founder optimize in the first 90 days post-launch, and what weekly number marks it as working?",
  },
  {
    id: "B4",
    section: "B",
    sectionLabel: "B. Launch & Growth",
    text: "An open community repo (methodology, K-BENCHMARK docs, API spec — AGPL) is approved in principle. What converts it into contributors rather than spectators?",
  },
  {
    id: "B5",
    section: "B",
    sectionLabel: "B. Launch & Growth",
    text: "Founding Reporter badges exist. Should reporting be further incentivized (gamification/rewards) or kept altruistic — and what abuse vector does your choice create?",
  },
  {
    id: "C1",
    section: "C",
    sectionLabel: "C. Product & UX",
    text: "Incident content is mostly English; a machine-translation lane (visible 'machine translated' badge) is being added for Turkish. Does MT content help or hurt credibility in the home market?",
  },
  {
    id: "C2",
    section: "C",
    sectionLabel: "C. Product & UX",
    text: "The submit flow targets 60 seconds (screenshot + description). What single UX change would most increase completed, high-quality reports?",
  },
  {
    id: "C3",
    section: "C",
    sectionLabel: "C. Product & UX",
    text: "The public surface spans: registry, leaderboard, K-BENCHMARK ratings, dilemma polls, academy, challenges. Which should be cut or de-emphasized before launch to sharpen the story?",
  },
  {
    id: "C4",
    section: "C",
    sectionLabel: "C. Product & UX",
    text: "With comments + sharing live and a <4h moderation SLA, what community-quality mechanism is missing that will bite hardest at 100× traffic?",
  },
  {
    id: "D1",
    section: "D",
    sectionLabel: "D. Methodology & Credibility",
    text: "What is the strongest methodological objection a skeptical ML researcher would raise against LLM-cross-audit model ratings, and what is the best honest answer?",
  },
  {
    id: "D2",
    section: "D",
    sectionLabel: "D. Methodology & Credibility",
    text: "The platform rates models from the same providers whose models serve as its judges. How should this circularity/conflict-of-interest be handled publicly?",
  },
  {
    id: "D3",
    section: "D",
    sectionLabel: "D. Methodology & Credibility",
    text: "The methodology committee page has zero named members. How many credible named members make the ratings trustworthy — and how do you recruit the first one with no budget?",
  },
  {
    id: "D4",
    section: "D",
    sectionLabel: "D. Methodology & Credibility",
    text: "Is a FAccT peer-reviewed paper worth months of effort at this stage, or is there a faster credibility instrument of comparable weight?",
  },
  {
    id: "E1",
    section: "E",
    sectionLabel: "E. Technology & Scale",
    text: "Supabase free tier is FULL (heaviest table stored full scraped article text; cleanup underway) and Vercel Hobby caps crons. What is the correct infra spend sequence for the next 90 days, from $0 upward?",
  },
  {
    id: "E2",
    section: "E",
    sectionLabel: "E. Technology & Scale",
    text: "Cost guards: $50/day warn, $100/day throttle, $500/month ceiling, kill switch. Sane for launch month? What would you set?",
  },
  {
    id: "E3",
    section: "E",
    sectionLabel: "E. Technology & Scale",
    text: "135+ migrations, strict TypeScript, RLS everywhere, mandated test pyramid + mutation testing — for a solo-founder platform, which quality investment is overkill and which is still missing?",
  },
  {
    id: "E4",
    section: "E",
    sectionLabel: "E. Technology & Scale",
    text: "The Vercel dashboard is lost to a 2FA lockout; a CLI session survives and deploys flow via GitHub. Rate the operational risk 1-10 and give the mitigation order.",
  },
  {
    id: "E5",
    section: "E",
    sectionLabel: "E. Technology & Scale",
    text: "Image generation moved from Vertex (no quota) to Hugging Face inference. For sustained daily social-image generation at near-zero cost, what provider strategy is most robust?",
  },
  {
    id: "F1",
    section: "F",
    sectionLabel: "F. Business & Revenue",
    text: "Candidates: Pro subscriptions, enterprise private benchmarks (K-Product), B2B risk-score API, EU Art. 73 compliance-report generator (2027). Rank by expected 12-month revenue and justify #1.",
  },
  {
    id: "F2",
    section: "F",
    sectionLabel: "F. Business & Revenue",
    text: "Selling audit/compliance services to rated companies is a neutrality conflict. Draw the exact line: what may be sold to rated companies, what must never be?",
  },
  {
    id: "F3",
    section: "F",
    sectionLabel: "F. Business & Revenue",
    text: "A bank-backed accelerator application (USD 50-150K) is pending. Does bank money compromise the 'independent referee' position — answer as one paragraph to a skeptical journalist.",
  },
  {
    id: "F4",
    section: "F",
    sectionLabel: "F. Business & Revenue",
    text: "What monthly revenue and incident-count numbers make a Series-A conversation realistic in 2027?",
  },
  {
    id: "G1",
    section: "G",
    sectionLabel: "G. Legal & Regulation",
    text: "Art. 73 mandatory reporting starts Dec 2, 2027. What product must exist by mid-2027 to capture that moment, and what is its minimum credible version?",
  },
  {
    id: "G2",
    section: "G",
    sectionLabel: "G. Legal & Regulation",
    text: "'We know who reporters are but never publish it' — under GDPR/KVKK, where is the weakest point of that promise and how is it hardened?",
  },
  {
    id: "G3",
    section: "G",
    sectionLabel: "G. Legal & Regulation",
    text: "A rated company sends a cease-and-desist calling its score defamatory. Sequence the correct response (a Streisand transparency log and a redaction workflow exist).",
  },
  {
    id: "G4",
    section: "G",
    sectionLabel: "G. Legal & Regulation",
    text: "Permanent public record vs GDPR erasure: the current answer is PII-masking + redaction instead of deletion. Where does that break, if anywhere?",
  },
  {
    id: "H1",
    section: "H",
    sectionLabel: "H. Governance & the AI-Operated Company",
    text: "One human + three AI agents run this company under a written constitution (30 rules, violation ledger, technical write-fences). What is the biggest hidden risk of an AI-operated company, and what human backstop is non-negotiable?",
  },
  {
    id: "H2",
    section: "H",
    sectionLabel: "H. Governance & the AI-Operated Company",
    text: "An AI executor once fabricated a founder-approval record; enforcement then moved from trust to technical guards. Sufficient — or does AI-agent governance need something structurally different?",
  },
  {
    id: "H3",
    section: "H",
    sectionLabel: "H. Governance & the AI-Operated Company",
    text: "The founder cannot read code. Design the minimal weekly trust-but-verify ritual that catches AI-executor drift without code review.",
  },
  {
    id: "H4",
    section: "H",
    sectionLabel: "H. Governance & the AI-Operated Company",
    text: "If the architect AI disappeared permanently tomorrow, which single document or mechanism matters most for continuity — and what makes it good enough?",
  },
];
