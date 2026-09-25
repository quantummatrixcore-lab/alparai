"use server";

export interface ComplianceResult {
  score: number;
  risks: string[];
  recommendations: string[];
}

export async function analyzeCompliance(text: string): Promise<ComplianceResult> {
  try {
    const lowerText = text.toLowerCase();
    const risks: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Article 5: Prohibited Practices (Subliminal manipulation, biometric scraping, social scoring)
    if (
      lowerText.includes("subliminal") ||
      lowerText.includes("social scoring") ||
      lowerText.includes("facial scraping") ||
      lowerText.includes("emotion recognition")
    ) {
      score -= 50;
      risks.push("CRITICAL: Potential Article 5 violation detected (Prohibited AI Practice).");
      recommendations.push("Immediately eliminate subliminal manipulation, social scoring, or unauthorized biometric scraping.");
    }

    // Article 6 & Annex III: High-Risk Classification
    if (
      lowerText.includes("critical infrastructure") ||
      lowerText.includes("recruitment") ||
      lowerText.includes("hr scoring") ||
      lowerText.includes("credit scoring") ||
      lowerText.includes("law enforcement")
    ) {
      score -= 25;
      risks.push("HIGH RISK: AI System touches Annex III High-Risk domain.");
      recommendations.push("Implement Article 9 Risk Management System and Article 14 Human Oversight controls.");
    }

    // Article 50: Transparency & Watermarking
    if (
      (lowerText.includes("synthetic") || lowerText.includes("deepfake") || lowerText.includes("generated content")) &&
      !lowerText.includes("c2pa") &&
      !lowerText.includes("watermark")
    ) {
      score -= 20;
      risks.push("Article 50 Transparency Warning: Synthetic media generation without machine-readable C2PA watermarks.");
      recommendations.push("Embed cryptographic C2PA watermarks and explicit user transparency notices.");
    }

    // Liability & Warranty Disclaimers
    if (
      lowerText.includes("liability") ||
      lowerText.includes("warrant") ||
      lowerText.includes("sorumluluk")
    ) {
      score -= 15;
      risks.push("Limitation of Liability or Warranty Disclaimer detected which might conflict with Article 73.");
      recommendations.push("Ensure liability caps do not exclude fundamental rights violations.");
    }

    // Privacy & Data Governance (GDPR / KVKK)
    if (
      lowerText.includes("data") &&
      !lowerText.includes("gdpr") &&
      !lowerText.includes("kvkk") &&
      !lowerText.includes("privacy")
    ) {
      score -= 15;
      risks.push("Data processing mentioned without reference to GDPR / KVKK privacy standards.");
      recommendations.push("Explicitly reference GDPR / KVKK compliance and data minimization principles.");
    }

    // Structural Completeness
    if (text.trim().length < 100) {
      score -= 30;
      risks.push("Terms of Service or policy document is suspiciously short (<100 characters).");
      recommendations.push("Provide comprehensive documentation covering AI transparency and risk governance.");
    }

    if (score === 100) {
      recommendations.push("Zero EU AI Act or GDPR compliance risks detected in preliminary automated analysis.");
    }

    return {
      score: Math.max(0, score),
      risks,
      recommendations,
    };
  } catch (err) {
    console.error("[analyzeCompliance] Error:", err);
    throw err;
  }
}
