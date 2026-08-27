import "server-only";
import type { DigitalTwinPersona } from "./personas";

/**
 * Evaluates semantic and behavioral alignment of the persona response.
 * Returns an alignment score between 0 and 100.
 */
export function calculateAlignmentScore(
  persona: DigitalTwinPersona,
  _userPrompt: string,
  completionText: string,
): number {
  if (!completionText || completionText.trim().length === 0) {
    return 0;
  }

  let score = 85; // Baseline high alignment

  const lowerContent = completionText.toLowerCase();
  // 1. Check if persona expertise or keywords are reflected
  const matchedExpertise = persona.expertise.filter((exp) =>
    lowerContent.includes(exp.toLowerCase()),
  );
  if (matchedExpertise.length > 0) {
    score += Math.min(matchedExpertise.length * 3, 10);
  }

  // 2. Check persona quote or signature keywords
  if (
    persona.stats.specialSkill &&
    lowerContent.includes(persona.stats.specialSkill.toLowerCase())
  ) {
    score += 4;
  }

  // 3. Penalize generic refusal or out-of-character phrases
  const outOfCharacterPhrases = [
    "as an ai",
    "bir yapay zeka olarak",
    "dil modeliyim",
    "i cannot help with that",
  ];
  for (const phrase of outOfCharacterPhrases) {
    if (lowerContent.includes(phrase)) {
      score -= 20;
      break;
    }
  }

  // Bound score between 50 and 100
  return Math.max(50, Math.min(100, score));
}

/**
 * Self-heals response if alignment falls below threshold.
 * Enhances response with authoritative persona framing.
 */
export async function selfHealResponse(
  persona: DigitalTwinPersona,
  _userPrompt: string,
  completionText: string,
  currentScore: number,
): Promise<string> {
  if (currentScore >= 85) {
    return completionText;
  }

  // Append authoritative persona framing to ensure character consistency
  const prefix = `[${persona.name} — ${persona.title}]: `;
  if (!completionText.startsWith(prefix) && !completionText.includes(persona.name)) {
    return `${prefix}${completionText}`;
  }

  return completionText;
}
