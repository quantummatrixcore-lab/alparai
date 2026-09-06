export interface EcosystemPlayer {
  name: string;
  category: string;
  successFactors: string[];
  failurePitfalls: string[];
  alparMoat: string;
  moatScore: number;
}

/**
 * Returns 360° Ecosystem Benchmarking data for key market players.
 * Analyzes success drivers, failure pitfalls, and ALPAR AI's defensible moat.
 */
export function getEcosystemBenchmarks(): EcosystemPlayer[] {
  return [
    {
      name: "OpenRouter",
      category: "Model Gateway & Aggregation",
      successFactors: [
        "Unified API router across providers",
        "Pay-per-token pricing flexibility",
        "Zero-latency model catalog expansion",
      ],
      failurePitfalls: [
        "Commoditized reseller margin compression",
        "Zero proprietary data moat",
        "Total dependency on underlying LLM APIs",
      ],
      alparMoat:
        "Verifiable Trust Layer, PII Guardian & incident-backed model reliability index beyond pure routing",
      moatScore: 85,
    },
    {
      name: "Blackbox AI",
      category: "Developer AI & Code Search",
      successFactors: [
        "Instant code search & autocomplete",
        "Seamless IDE extension ecosystem",
        "High developer adoption velocity",
      ],
      failurePitfalls: [
        "High hallucination risk in generated code",
        "Lack of enterprise compliance & auditability",
        "Single-domain developer workflow limitation",
      ],
      alparMoat:
        "End-to-end incident verification, immutable audit trail & cryptographic proof of output",
      moatScore: 90,
    },
    {
      name: "LMSYS",
      category: "Crowdsourced Evaluation (Chatbot Arena)",
      successFactors: [
        "Elo-based human preference benchmarking",
        "Viral community & researcher adoption",
        "Open-source model rankings standard",
      ],
      failurePitfalls: [
        "Vulnerable to prompt gaming & bias",
        "Subjective vibe-based evaluation metrics",
        "Lack of real-time enterprise monitoring",
      ],
      alparMoat:
        "Empirical incident post-mortems & real-world operational fault tracking over subjective vibes",
      moatScore: 92,
    },
    {
      name: "Scale AI",
      category: "Data Labeling & RLHF Infrastructure",
      successFactors: [
        "Massive human annotator network",
        "High enterprise contract values",
        "Government & defense sector footprint",
      ],
      failurePitfalls: [
        "Capital-intensive human operations",
        "Quality control variance across human workers",
        "Enterprise data privacy & leakage exposure",
      ],
      alparMoat:
        "Automated agentic verification, zero-knowledge PII sanitization & minimal operational overhead",
      moatScore: 88,
    },
    {
      name: "LangChain",
      category: "LLM Framework & Orchestration",
      successFactors: [
        "First-mover developer mindshare",
        "Vast integration ecosystem & connectors",
        "Open-source community adoption",
      ],
      failurePitfalls: [
        "Abstraction leakiness & debug complexity",
        "Breaking API churn across minor versions",
        "Developer maintenance fatigue",
      ],
      alparMoat:
        "Turnkey enterprise Trust Infrastructure vs complex developer boilerplate framework",
      moatScore: 94,
    },
  ];
}

/**
 * Calculates overall Defensive Moat Index across ecosystem players.
 */
export function calculateMoatIndex(players: EcosystemPlayer[]): number {
  if (!players || players.length === 0) {
    return 0;
  }
  const totalScore = players.reduce((sum, player) => sum + (player.moatScore || 0), 0);
  return Number((totalScore / players.length).toFixed(1));
}

/**
 * Evaluates corporate defensive positioning based on calculated Moat Index.
 */
export function getDefensivePositioningIndex(moatIndex: number): {
  rating: string;
  tier: string;
  summary: string;
} {
  if (moatIndex >= 90) {
    return {
      rating: "FORTRESS",
      tier: "S-Tier Dominance",
      summary:
        "Structural competitive moat anchored in cryptographic auditability, real-time incident empirical data, and automated PII protection.",
    };
  }
  if (moatIndex >= 80) {
    return {
      rating: "HIGH DEFENDABILITY",
      tier: "A-Tier Moat",
      summary:
        "Strong differentiation through compliance and verification layers with high switching costs for enterprise clients.",
    };
  }
  return {
    rating: "MODERATE",
    tier: "B-Tier Moat",
    summary:
      "Competitive positioning requires continued expansion of proprietary audit mechanisms.",
  };
}
