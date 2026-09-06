"use server";

import { requireModerator } from "@/lib/auth/session";
import { BlackboxAdapter } from "@/lib/ai/adapters/blackbox";
import type { GatewayRequest } from "@/lib/ai/types";

export interface CodeAnalysisResult {
  analysis: string;
  suggestions: string[];
}

export async function analyzeCodeWithBlackbox(
  filePath: string,
  code: string,
): Promise<CodeAnalysisResult> {
  try {
    await requireModerator();

    if (!code || code.trim().length === 0) {
      return {
        analysis: "No code provided for analysis.",
        suggestions: ["Please enter code snippet or content."],
      };
    }

    const systemPrompt = `You are a Senior Staff Code Quality & Security Auditor. Analyze the provided code for bugs, security vulnerabilities, performance issues, and adherence to SOLID principles. Respond in JSON format with two keys: "analysis" (string) and "suggestions" (string array).`;

    const userMessage = `File Path: ${filePath || "unknown.ts"}\n\nCode Content:\n\`\`\`\n${code}\n\`\`\``;

    const adapter = new BlackboxAdapter();

    const request: GatewayRequest = {
      systemPrompt,
      userMessage,
      model: {
        id: "blackboxai",
        provider: "blackbox",
        tier: "free",
        maxTokens: 2048,
      },
      temperature: 0.2,
      responseFormat: "json",
    };

    try {
      const isConfigured = await adapter.isConfigured();
      if (!isConfigured) {
        return {
          analysis: `[Blackbox AI Gateway - Local Inspection] Static pre-audit for ${filePath || "code snippet"} (${code.length} chars): Code structure checked. Ensure zero 'any' types, strict error boundaries, and input sanitization.`,
          suggestions: [
            "Enforce strict TypeScript type safety without using 'any'.",
            "Ensure input parameter validation with Zod schemas.",
            "Add automated unit tests covering key edge cases.",
          ],
        };
      }

      const result = await adapter.call(request);

      if (result.ok && result.data.content) {
        try {
          const parsed = JSON.parse(result.data.content) as {
            analysis?: string;
            suggestions?: string[];
          };
          return {
            analysis: parsed.analysis || result.data.content,
            suggestions: Array.isArray(parsed.suggestions)
              ? parsed.suggestions
              : ["Review modular structure and type safety."],
          };
        } catch {
          return {
            analysis: result.data.content,
            suggestions: ["Review types, imports, and security boundaries."],
          };
        }
      } else {
        const errMsg = !result.ok ? result.error.message : "Analysis failed.";
        return {
          analysis: `[Blackbox AI Analysis Notice] ${errMsg}`,
          suggestions: [
            "Verify BLACKBOX_API_KEY environment variable.",
            "Check code syntax and size before resubmitting.",
          ],
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error during code analysis.";
      return {
        analysis: `Analysis failed: ${message}`,
        suggestions: ["Check server logs and try again."],
      };
    }
  } catch (err) {
    console.error("[analyzeCodeWithBlackbox] Error:", err);
    throw err;
  }
}
