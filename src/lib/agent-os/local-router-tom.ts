import { z } from "zod";

/**
 * ENGINE TOM - Local/Edge Orchestration Router
 * Dış LLM API'leri yerine DeHost yerel model (Qwen 127.0.0.1:11434) kullanılarak
 * katı şemalar (Zod) ile niyet (intent) ayrıştıran yönlendirici motor.
 */

// Katı Pydantic/Zod Şema Sözleşmesi
export const TomIntentSchema = z.object({
  intentType: z.enum(["REFACTOR", "BUGFIX", "FEATURE", "SECURITY_AUDIT"]),
  complexity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  targetEngine: z.enum(["HEPHAESTUS", "TCSFL", "DIRECT_BYPASS"]),
  contextPayload: z.record(z.unknown()),
  estimatedTokens: z.number().optional(),
});

export type TomIntent = z.infer<typeof TomIntentSchema>;

interface AstAnalysis {
  hasCodeBlock: boolean;
  detectedLang?: string;
  hasAstMarkers: boolean;
  nestingDepth: number;
  declarationCount: number;
  isSyntaxOrLint: boolean;
  isSecurityCritical: boolean;
  isRefactor: boolean;
  isFeature: boolean;
}

function analyzePromptAst(prompt: string): AstAnalysis {
  const lower = prompt.toLowerCase();

  // Detect code blocks and language
  const codeBlockMatch = prompt.match(/```(\w+)?([\s\S]*?)```/);
  const detectedLang = codeBlockMatch ? codeBlockMatch[1] : undefined;
  const hasCodeBlock = Boolean(codeBlockMatch);

  // AST markers
  const astTokens = [
    /\bfunction\b/,
    /\bclass\b/,
    /\binterface\b/,
    /\btype\b/,
    /\bimport\b/,
    /\bexport\b/,
    /\basync\b/,
    /\bawait\b/,
    /=>/,
  ];
  let declarationCount = 0;
  for (const rx of astTokens) {
    const m = prompt.match(new RegExp(rx, "g"));
    if (m) declarationCount += m.length;
  }

  // Nesting depth approximation by braces
  let depth = 0;
  let maxDepth = 0;
  for (const ch of prompt) {
    if (ch === "{" || ch === "(" || ch === "[") {
      depth++;
      if (depth > maxDepth) maxDepth = depth;
    } else if (ch === "}" || ch === ")" || ch === "]") {
      if (depth > 0) depth--;
    }
  }

  const isSecurityCritical =
    lower.includes("cve") ||
    lower.includes("vulnerability") ||
    lower.includes("zafiyet") ||
    lower.includes("güvenlik") ||
    lower.includes("injection") ||
    lower.includes("xss") ||
    lower.includes("ssrf") ||
    lower.includes("secret") ||
    lower.includes("leak") ||
    lower.includes("token");

  const isSyntaxOrLint =
    lower.includes("syntax") ||
    lower.includes("lint") ||
    lower.includes("typo") ||
    lower.includes("format") ||
    lower.includes("whitespace") ||
    lower.includes("noktalama");

  const isRefactor =
    lower.includes("refactor") ||
    lower.includes("yeniden düzenle") ||
    lower.includes("clean") ||
    lower.includes("modularize") ||
    lower.includes("reorganize") ||
    lower.includes("dry") ||
    lower.includes("extract");

  const isFeature =
    lower.includes("feature") ||
    lower.includes("özellik") ||
    lower.includes("create") ||
    lower.includes("build") ||
    lower.includes("implement") ||
    lower.includes("ekle") ||
    lower.includes("yeni");

  return {
    hasCodeBlock,
    detectedLang,
    hasAstMarkers: declarationCount > 0,
    nestingDepth: maxDepth,
    declarationCount,
    isSyntaxOrLint,
    isSecurityCritical,
    isRefactor,
    isFeature,
  };
}

/**
 * Gelen kullanıcı isteğini (prompt) ayrıştırıp hedef motoru belirler.
 * DeHost yerel LLM (127.0.0.1:11434) çağrısı + gelişmiş AST/niyet sınıflandırması içerir.
 */
export async function routeRequestLocal(prompt: string): Promise<TomIntent> {
  console.info(`[TOM Router] Analyzing prompt: ${prompt.slice(0, 50)}...`);
  const estimatedTokens = Math.max(10, Math.ceil(prompt.length / 4));
  const ast = analyzePromptAst(prompt);

  // 1. DeHost Yerel LLM (127.0.0.1:11434 / 127.0.0.1:8899) Çağrısı
  try {
    const systemPrompt = `You are ENGINE TOM, an autonomous AST and Intent Router for sovereign software development.
Analyze the user prompt and return ONLY a valid JSON object with the following schema:
{
  "intentType": "REFACTOR" | "BUGFIX" | "FEATURE" | "SECURITY_AUDIT",
  "complexity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "targetEngine": "HEPHAESTUS" | "TCSFL" | "DIRECT_BYPASS",
  "contextPayload": { "requiresCodeSynth": boolean, "astValidationRequired": boolean, "reasoning": string },
  "estimatedTokens": number
}`;

    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5-coder:7b",
        prompt: prompt,
        system: systemPrompt,
        format: "json",
        stream: false,
        options: { temperature: 0.1, num_predict: 120 },
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.response) {
        const parsedJson = JSON.parse(data.response);
        const validated = TomIntentSchema.safeParse(parsedJson);
        if (validated.success) {
          console.info("[TOM Router] Local LLM classification successful");
          return validated.data;
        }
      }
    }
  } catch (_llmErr) {
    // Local LLM offline or timed out, seamlessly proceed to advanced AST classifier
  }

  // 2. Gelişmiş Deterministik AST ve Niyet Sınıflandırması
  if (ast.isSecurityCritical) {
    return {
      intentType: "SECURITY_AUDIT",
      complexity: "CRITICAL",
      targetEngine: "HEPHAESTUS",
      contextPayload: {
        requiresCodeSynth: true,
        astValidationRequired: true,
        securityClassification: "CRITICAL_AUDIT",
        hasAstMarkers: ast.hasAstMarkers,
        detectedLang: ast.detectedLang,
      },
      estimatedTokens,
    };
  }

  if (ast.isSyntaxOrLint) {
    return {
      intentType: "BUGFIX",
      complexity: "LOW",
      targetEngine: "DIRECT_BYPASS",
      contextPayload: {
        requiresCodeSynth: false,
        astValidationRequired: false,
        bypassReason: "TCSFL_SYNTAX_SHORTCIRCUIT",
      },
      estimatedTokens,
    };
  }

  if (ast.isRefactor) {
    const complexity = ast.declarationCount > 3 || ast.nestingDepth > 3 ? "HIGH" : "MEDIUM";
    return {
      intentType: "REFACTOR",
      complexity,
      targetEngine: "HEPHAESTUS",
      contextPayload: {
        requiresCodeSynth: true,
        astValidationRequired: true,
        declarationCount: ast.declarationCount,
        nestingDepth: ast.nestingDepth,
      },
      estimatedTokens,
    };
  }

  if (ast.isFeature || ast.declarationCount > 0) {
    return {
      intentType: "FEATURE",
      complexity: ast.nestingDepth > 4 ? "CRITICAL" : "HIGH",
      targetEngine: "HEPHAESTUS",
      contextPayload: {
        requiresCodeSynth: true,
        astValidationRequired: true,
        detectedLang: ast.detectedLang,
      },
      estimatedTokens,
    };
  }

  // Varsayılan TCSFL Hata/Mantık Hattı
  return {
    intentType: "BUGFIX",
    complexity: "MEDIUM",
    targetEngine: "TCSFL",
    contextPayload: {
      requiresCodeSynth: true,
      astValidationRequired: true,
    },
    estimatedTokens,
  };
}
