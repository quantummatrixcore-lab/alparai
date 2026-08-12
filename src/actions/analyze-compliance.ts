"use server";

export interface ComplianceResult {
  score: number;
  risks: string[];
  recommendations: string[];
}

export async function analyzeCompliance(text: string): Promise<ComplianceResult> {
  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lowerText = text.toLowerCase();
  const risks: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  if (
    lowerText.includes("liability") ||
    lowerText.includes("warrant") ||
    lowerText.includes("sorumluluk")
  ) {
    score -= 30;
    risks.push(
      "Limitation of Liability or Warranty Disclaimer detected which might conflict with Article 73.",
    );
    recommendations.push("Ensure liability caps do not exclude fundamental rights violations.");
  }

  if (lowerText.includes("data") && !lowerText.includes("gdpr") && !lowerText.includes("privacy")) {
    score -= 20;
    risks.push("Data processing mentioned without reference to privacy standards.");
    recommendations.push("Explicitly reference GDPR and data minimization principles.");
  }

  if (text.length < 100) {
    score -= 50;
    risks.push("Terms of Service is suspiciously short.");
    recommendations.push("Provide comprehensive terms covering AI transparency obligations.");
  }

  if (score === 100) {
    recommendations.push("No obvious Article 73 violations found in this preliminary analysis.");
  }

  return {
    score: Math.max(0, score),
    risks,
    recommendations,
  };
}
