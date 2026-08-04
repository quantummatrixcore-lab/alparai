export interface ProductPillar {
  id: string;
  number: number;
  name: string;
  tagline: string;
  description: string;
  route: string;
  iconName: string;
}

export const MODULAR_PILLARS: ProductPillar[] = [
  {
    id: "ai-observatory",
    number: 1,
    name: "AI Observatory",
    tagline: "Live Monitoring",
    description:
      "Real-time global tracking of AI incidents, hallucinations, and ethical anomalies.",
    route: "/[locale]/incidents",
    iconName: "Eye",
  },
  {
    id: "ai-evidence",
    number: 2,
    name: "AI Evidence",
    tagline: "Immutable Vault",
    description: "SHA-256 cryptographic audit ledger for tamper-proof AI misbehavior evidence.",
    route: "/[locale]/admin/dual-channel-scoring",
    iconName: "ShieldCheck",
  },
  {
    id: "ai-benchmark",
    number: 3,
    name: "AI Benchmark",
    tagline: "K-Benchmark",
    description: "Independent cross-audit model trust scoring and comparative analytics.",
    route: "/[locale]/admin/ai-orchestrator",
    iconName: "BarChart2",
  },
  {
    id: "ai-certification",
    number: 4,
    name: "AI Certification",
    tagline: "EU AI Act Compliance",
    description: "Article 73 serious-incident reporting and regulatory compliance verification.",
    route: "/[locale]/transparency/art-73-tracker",
    iconName: "CheckCircle2",
  },
  {
    id: "ai-monitoring",
    number: 5,
    name: "AI Monitoring",
    tagline: "Real-Time Protection",
    description: "B2B prompt injection shields and automated model failover monitoring.",
    route: "/[locale]/api/cron/ai-heartbeat",
    iconName: "Activity",
  },
  {
    id: "ai-risk-intelligence",
    number: 6,
    name: "AI Risk Intelligence",
    tagline: "Red Teaming",
    description: "Multi-perspective expert board threat modeling and automated security auditing.",
    route: "/[locale]/admin/expert-analysis",
    iconName: "AlertTriangle",
  },
  {
    id: "ai-transparency-index",
    number: 7,
    name: "AI Transparency Index",
    tagline: "Enterprise Disclosures",
    description: "Public transparency scorecards and provider accountability index.",
    route: "/[locale]/insights",
    iconName: "Globe",
  },
  {
    id: "ai-trust-api",
    number: 8,
    name: "AI Trust API",
    tagline: "Programmatic Access",
    description: "REST and GraphQL APIs for enterprise trust score integration.",
    route: "/[locale]/documentation",
    iconName: "Code",
  },
];

export interface GptAuditScore {
  overallScore: number;
  maxScore: number;
  strengths: { category: string; score: number }[];
  growthAreas: { category: string; score: number }[];
}

export const GPT_360_AUDIT_SCORE: GptAuditScore = {
  overallScore: 921,
  maxScore: 1000,
  strengths: [
    { category: "Innovation", score: 99 },
    { category: "Vision", score: 98 },
    { category: "Scalability", score: 96 },
    { category: "Engineering", score: 96 },
    { category: "Trust", score: 95 },
    { category: "Architecture", score: 95 },
  ],
  growthAreas: [
    { category: "VC Perspective", score: 87 },
    { category: "Revenue Model", score: 88 },
    { category: "Product Focus", score: 89 },
  ],
};
