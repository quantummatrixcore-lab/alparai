export type RiskTier = "PROHIBITED" | "HIGH_RISK" | "SPECIFIC_TRANSPARENCY" | "MINIMAL_RISK";

export interface EUCompliancePassport {
  systemId: string;
  systemName: string;
  riskTier: RiskTier;
  euAiActArticle: string;
  transparencyScore: number;
  obligations: {
    fundamentalRightsAssessment: boolean;
    technicalDocumentation: boolean;
    humanOversightMechanism: boolean;
    cybersecurityMeasures: boolean;
    ceMarkingReadiness: boolean;
  };
  certifiedAt: string;
  validUntil: string;
  status: "COMPLIANT" | "NEEDS_AUDIT" | "NON_COMPLIANT";
}

export function generateEUCompliancePassport(
  systemId: string,
  systemName: string,
  category: string,
  hasHumanInTheLoop: boolean,
): EUCompliancePassport {
  let riskTier: RiskTier = "MINIMAL_RISK";
  let euAiActArticle = "Article 52 (Minimal/No Risk)";
  let transparencyScore = 95;

  const catLower = category.toLowerCase();
  if (
    catLower.includes("biometric") ||
    catLower.includes("social_scoring") ||
    catLower.includes("subliminal")
  ) {
    riskTier = "PROHIBITED";
    euAiActArticle = "Article 5 (Prohibited AI Practices)";
    transparencyScore = 10;
  } else if (
    catLower.includes("critical_infrastructure") ||
    catLower.includes("employment") ||
    catLower.includes("law_enforcement") ||
    catLower.includes("credit_scoring") ||
    catLower.includes("medical")
  ) {
    riskTier = "HIGH_RISK";
    euAiActArticle = "Article 6 & Annex III (High-Risk AI Systems)";
    transparencyScore = hasHumanInTheLoop ? 88 : 65;
  } else if (
    catLower.includes("chatbot") ||
    catLower.includes("deepfake") ||
    catLower.includes("content_generation")
  ) {
    riskTier = "SPECIFIC_TRANSPARENCY";
    euAiActArticle = "Article 50 (Transparency Obligations)";
    transparencyScore = 90;
  }

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);

  return {
    systemId,
    systemName,
    riskTier,
    euAiActArticle,
    transparencyScore,
    obligations: {
      fundamentalRightsAssessment: riskTier !== "PROHIBITED",
      technicalDocumentation: true,
      humanOversightMechanism: hasHumanInTheLoop,
      cybersecurityMeasures: true,
      ceMarkingReadiness: riskTier === "HIGH_RISK" ? hasHumanInTheLoop : true,
    },
    certifiedAt: now.toISOString(),
    validUntil: nextYear.toISOString(),
    status:
      riskTier === "PROHIBITED"
        ? "NON_COMPLIANT"
        : riskTier === "HIGH_RISK" && !hasHumanInTheLoop
          ? "NEEDS_AUDIT"
          : "COMPLIANT",
  };
}

export function classifyEUIncidentRisk(incident: {
  eu_act_risk_category?: string | null;
  severity?: string | null;
  category?: string | null;
}): "Unacceptable Risk" | "High Risk" | "Specific Transparency" | "Minimal" {
  if (incident.eu_act_risk_category) {
    const raw = incident.eu_act_risk_category.trim();
    if (raw.toLowerCase().includes("unacceptable") || raw.toLowerCase().includes("prohibited")) {
      return "Unacceptable Risk";
    }
    if (raw.toLowerCase().includes("high")) {
      return "High Risk";
    }
    if (raw.toLowerCase().includes("transparency") || raw.toLowerCase().includes("specific")) {
      return "Specific Transparency";
    }
    if (raw.toLowerCase().includes("minimal") || raw.toLowerCase().includes("low")) {
      return "Minimal";
    }
  }

  const sev = (incident.severity || "").toLowerCase();
  const cat = (incident.category || "").toLowerCase();

  if (
    sev === "critical" ||
    cat.includes("safety") ||
    cat.includes("security") ||
    cat.includes("autonomous") ||
    cat.includes("biometric") ||
    cat.includes("subliminal")
  ) {
    return "Unacceptable Risk";
  }
  if (
    sev === "high" ||
    cat.includes("bias") ||
    cat.includes("discrimination") ||
    cat.includes("privacy") ||
    cat.includes("legal") ||
    cat.includes("medical") ||
    cat.includes("financial") ||
    cat.includes("employment")
  ) {
    return "High Risk";
  }
  if (
    sev === "medium" ||
    cat.includes("hallucination") ||
    cat.includes("misinformation") ||
    cat.includes("deepfake") ||
    cat.includes("copyright") ||
    cat.includes("transparency") ||
    cat.includes("chatbot")
  ) {
    return "Specific Transparency";
  }
  return "Minimal";
}
