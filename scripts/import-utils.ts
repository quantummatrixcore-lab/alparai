import { maskPII } from "../src/lib/pii/guardian";

export type IncidentCategory =
  | "hallucination"
  | "bias"
  | "privacy"
  | "security"
  | "misinformation"
  | "harassment"
  | "manipulation"
  | "inaccessibility"
  | "copyright"
  | "other";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export function mapCategory(raw: string): IncidentCategory {
  const c = raw.toLowerCase().trim();
  if (
    c.includes("bias") ||
    c.includes("discrimination") ||
    c.includes("fairness") ||
    c.includes("racism") ||
    c.includes("sexism") ||
    c.includes("gender") ||
    c.includes("race")
  ) {
    return "bias";
  }
  if (
    c.includes("privacy") ||
    c.includes("leak") ||
    c.includes("exposure") ||
    c.includes("surveillance") ||
    c.includes("gdpr") ||
    c.includes("kvkk")
  ) {
    return "privacy";
  }
  if (
    c.includes("security") ||
    c.includes("hack") ||
    c.includes("vulnerability") ||
    c.includes("jailbreak") ||
    c.includes("exploit") ||
    c.includes("cyberattack")
  ) {
    return "security";
  }
  if (
    c.includes("disinformation") ||
    c.includes("misinformation") ||
    c.includes("fake news") ||
    c.includes("propaganda") ||
    c.includes("deepfake")
  ) {
    return "misinformation";
  }
  if (
    c.includes("hallucination") ||
    c.includes("confabulation") ||
    c.includes("false output") ||
    c.includes("incorrect info")
  ) {
    return "hallucination";
  }
  if (
    c.includes("harassment") ||
    c.includes("abuse") ||
    c.includes("cyberbullying") ||
    c.includes("hate speech") ||
    c.includes("threat")
  ) {
    return "harassment";
  }
  if (
    c.includes("copyright") ||
    c.includes("intellectual property") ||
    c.includes("patent") ||
    c.includes("plagiarism") ||
    c.includes("trademark")
  ) {
    return "copyright";
  }
  if (c.includes("inaccessibility") || c.includes("disability") || c.includes("accessibility")) {
    return "inaccessibility";
  }
  if (c.includes("manipulation") || c.includes("influence") || c.includes("nudge")) {
    return "manipulation";
  }
  return "other";
}

export function inferSeverity(title: string, desc: string): IncidentSeverity {
  const text = `${title} ${desc}`.toLowerCase();
  if (
    text.includes("death") ||
    text.includes("fatal") ||
    text.includes("kill") ||
    text.includes("suicide") ||
    text.includes("national security") ||
    text.includes("election fraud") ||
    text.includes("critical infrastructure")
  ) {
    return "critical";
  }
  if (
    text.includes("arrest") ||
    text.includes("jail") ||
    text.includes("lawsuit") ||
    text.includes("million dollar") ||
    text.includes("hospital") ||
    text.includes("injury") ||
    text.includes("weapon") ||
    text.includes("cyberwar")
  ) {
    return "high";
  }
  if (
    text.includes("fired") ||
    text.includes("suspend") ||
    text.includes("scam") ||
    text.includes("phishing") ||
    text.includes("malware") ||
    text.includes("leak") ||
    text.includes("fine") ||
    text.includes("censure")
  ) {
    return "medium";
  }
  return "low";
}

export function cleanTextAndMaskPII(text: string | null | undefined): {
  raw: string;
  masked: string;
  hasPii: boolean;
} {
  if (!text) return { raw: "", masked: "", hasPii: false };
  const cleaned = text.trim();
  const scan = maskPII(cleaned);
  return {
    raw: cleaned,
    masked: scan.masked,
    hasPii: scan.piiFound,
  };
}
