import { logger } from "@/lib/utils/logger";
import { resolveApiKey } from "@/lib/ai/api-keys";

export interface ContentPlan {
  topic: string;
  platform: string;
  script: string;
  videoPrompt: string;
  hashtags: string[];
  targetAudience: string;
}

export class ContentStrategist {
  constructor(_llmConfig: Record<string, unknown>) {}

  async generateContentPlan(recentCommits: string[]): Promise<ContentPlan> {
    logger.info("[ContentStrategist] Analyzing recent updates...", {
      commitsCount: recentCommits.length,
    });

    const apiKey = await resolveApiKey("google", "GEMINI_API_KEY");
    if (!apiKey) {
      logger.warn("[ContentStrategist] No Gemini API key, using fallback plan");
      return this.fallbackPlan(recentCommits);
    }

    const prompt = `You are a social media content strategist for ALPAR AI, an AI safety and incident reporting platform.
Recent project updates:
${recentCommits.map((c) => `- ${c}`).join("\n")}

Generate a viral content plan in JSON format with these fields:
- topic: main topic for the post
- platform: which platform (LinkedIn, X, TikTok)
- script: the full post script/caption (2-3 sentences)
- videoPrompt: text-to-video prompt for video generation
- hashtags: array of 3-5 relevant hashtags
- targetAudience: who this targets

Return ONLY valid JSON.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1024,
              responseMimeType: "application/json",
            },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status}`);
      }

      const data = (await res.json()) as {
        candidates?: { content: { parts: { text: string }[] } }[];
      };
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Gemini response");

      const plan = JSON.parse(text) as ContentPlan;
      logger.info("[ContentStrategist] Content plan generated via AI.");
      return plan;
    } catch (err) {
      logger.error(
        "[ContentStrategist] AI generation failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return this.fallbackPlan(recentCommits);
    }
  }

  private fallbackPlan(recentCommits: string[]): ContentPlan {
    const topCommit = recentCommits[0] || "AI Safety improvements";
    return {
      topic: `AI Safety: ${topCommit}`,
      platform: "LinkedIn & X",
      script: `Did you know AI models can hallucinate critically? ALPAR AI is building the ultimate accountability layer. ${topCommit} #AISafety #ALPARAI`,
      videoPrompt:
        "A futuristic glowing shield protecting data nodes, cinematic lighting, 4k resolution, dark navy and cyan colors.",
      hashtags: ["#AISafety", "#ALPARAI", "#ResponsibleAI"],
      targetAudience: "AI researchers, ML engineers, tech policymakers",
    };
  }
}
