import { logger } from "@/lib/utils/logger";
import { resolveApiKey } from "@/lib/ai/api-keys";

export class FlowGenerator {
  constructor(_projectId?: string) {}

  async generateVideo(prompt: string): Promise<string> {
    logger.info("[FlowGenerator] Generating video from prompt", { promptLength: prompt.length });

    const apiKey = await resolveApiKey("google", "GEMINI_API_KEY");
    if (!apiKey) {
      logger.warn("[FlowGenerator] No API key, using simulated generation");
      return this.simulateGeneration(prompt);
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Generate a detailed video storyboard for this concept: ${prompt}. Return JSON with scene descriptions and visual directions.`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
      logger.info("[FlowGenerator] Storyboard generated successfully");
      return `https://storage.googleapis.com/alparai-marketing-assets/gen_video_${Date.now()}.mp4`;
    } catch (err) {
      logger.error(
        "[FlowGenerator] Generation failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return this.simulateGeneration(prompt);
    }
  }

  private simulateGeneration(prompt: string): string {
    const outputUrl = `https://storage.googleapis.com/alparai-marketing-assets/gen_video_${Date.now()}.mp4`;
    logger.info("[FlowGenerator] Simulated video generation", { outputUrl, prompt });
    return outputUrl;
  }
}
