"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { resolveApiKey } from "@/lib/ai/api-keys";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchWithSsrfGuard } from "@/lib/security/ssrf";
import { logger } from "@/lib/utils/logger";

export interface FetchContentResponse {
  ok: boolean;
  title?: string;
  content?: string;
  error?: string;
}

export interface GenerateResponse {
  ok: boolean;
  drafts?: string[];
  error?: string;
}

/**
 * Fetches content from a URL.
 * Supports YouTube URLs via oEmbed (no API key required) and simple HTML scraping for other URLs.
 */
export async function fetchContentFromUrl(url: string): Promise<FetchContentResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    if (!url) {
      return { ok: false, error: "URL is required" };
    }

    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      return { ok: false, error: "Only valid HTTP/HTTPS URLs are supported" };
    }

    try {
      const ALLOWED_SOCIAL_DOMAINS = ["youtube.com", "youtu.be", "x.com", "twitter.com"];
      const isYouTube = ALLOWED_SOCIAL_DOMAINS.slice(0, 2).some((d) => url.includes(d));
      const isX = ALLOWED_SOCIAL_DOMAINS.slice(2).some((d) => url.includes(d));

      if (isYouTube) {
        const oEmbedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
        const res = await fetchWithSsrfGuard(oEmbedUrl);
        if (!res.ok) {
          throw new Error(`Failed to fetch oEmbed metadata: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        return {
          ok: true,
          title: data.title || "YouTube Video",
          content: `Title: ${data.title || ""}\nChannel: ${data.author_name || ""}\nURL: ${url}`,
        };
      } else if (isX) {
        const urlObj = new URL(url);
        let path = urlObj.pathname;
        if (path.endsWith("/")) path = path.slice(0, -1);

        const fxUrl = `https://api.fxtwitter.com${path}`;
        const res = await fetchWithSsrfGuard(fxUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch X post metadata: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.code !== 200 || !data.tweet) {
          throw new Error(data.message || "Failed to parse X post");
        }

        return {
          ok: true,
          title: `Post by @${data.tweet.author.screen_name}`,
          content: `Author: ${data.tweet.author.name} (@${data.tweet.author.screen_name})\nPost: ${data.tweet.text}\nURL: ${url}`,
        };
      } else {
        // General URL scraper
        const res = await fetchWithSsrfGuard(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const html = await res.text();
        if (html.length > 2 * 1024 * 1024) {
          throw new Error("Response size limit exceeded (2MB limit)");
        }

        // Basic HTML stripping
        let cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Limit characters to avoid huge payloads
        cleanText = cleanText.slice(0, 4000);

        // Try to extract title
        const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1]?.trim() : "Web Page";

        return {
          ok: true,
          title: title || "Scraped Page",
          content: cleanText,
        };
      }
    } catch (err: unknown) {
      logger.error("fetchContentFromUrl error:", undefined, err instanceof Error ? err : undefined);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to fetch content from the URL.",
      };
    }
  } catch (err) {
    console.error("[fetchContentFromUrl] Error:", err);
    throw err;
  }
}

/**
 * Generates three strategic, brand-consistent responses using Gemini 2.0 Flash.
 */
export async function generateStrategicResponse(
  contextText: string,
  persona: "visionary" | "diplomatic" | "punchy",
  platform: "youtube" | "linkedin" | "x" | "general",
): Promise<GenerateResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      return { ok: false, error: "UNAUTHORIZED" };
    }

    if (!contextText) {
      return { ok: false, error: "Context text is required" };
    }

    const apiKey = await resolveApiKey("google", "GEMINI_API_KEY");
    if (!apiKey) {
      return { ok: false, error: "API_KEY_NOT_FOUND" };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      // Base strategic prompts matching ALPAR AI's core mission
      const baseSystemPrompt = `
You are the strategic communications assistant and founder mind of ALPAR AI.
ALPAR AI is a community-driven audit and complaint management platform building "trust infrastructure & accountability" for AI systems.
Your comments on content should carry high intellectual depth and strategic vision as if coming directly from the founder.

RULES:
1. Ensure flawless language and clarity.
2. Never use cheap advertising or marketing speak. Phrases like "Sign up now" or "Try our platform" are strictly forbidden. Focus on thought leadership.
3. Do not force the ALPAR AI brand into every comment. Only imply it indirectly in the context of AI governance, accountability, compliance, or trust infrastructure when relevant.
4. Provide specific insights demonstrating genuine understanding of the core content. Avoid generic comments.
5. Return ONLY a JSON object containing a 3-element string array named "alternatives". Example: { "alternatives": ["comment1", "comment2", "comment3"] }
`;

      let personaPrompt = "";
      if (persona === "visionary") {
        personaPrompt = `
PERSONA: Visionary
- Formulate deep philosophical or industry analogies. Refer to historical parallels (e.g. industrial revolution, birth of the internet).
- Ask thought-provoking questions, expand the debate.
- Length: 3 to 5 sentences, rich in substance.
`;
      } else if (persona === "diplomatic") {
        personaPrompt = `
PERSONA: Diplomatic
- Academic, balanced, focused on regulation and compliance.
- Approach from ethical, legal, EU AI Act, or data privacy perspectives.
- Emphasize credibility and institutional trust.
- Length: 2 to 4 balanced sentences.
`;
      } else {
        personaPrompt = `
PERSONA: Punchy
- Maximum impact, minimum words.
- Make a striking observation in a single sentence; connect with a second short sentence if necessary.
- Craft clever, aphorism-quality statements suitable for quoting.
- Length: 1 or at most 2 sentences.
`;
      }

      let platformPrompt = "";
      if (platform === "youtube") {
        platformPrompt =
          "Platform: YouTube comment. Use a tone that engages the audience and constructively contributes to or strategically questions the speaker's argument.";
      } else if (platform === "linkedin") {
        platformPrompt =
          "Platform: LinkedIn comment. Professional, executive network quality suitable for engaging industry leaders.";
      } else if (platform === "x") {
        platformPrompt =
          "Platform: X (Twitter). Short, punchy, virally shareable for thread replies, adhering to concise messaging.";
      } else {
        platformPrompt =
          "Platform: General engagement. Intellectual comment suitable for blog posts or general articles.";
      }

      const finalPrompt = `
${baseSystemPrompt}
${personaPrompt}
${platformPrompt}

Aşağıdaki bağlamı analiz et ve kurallara uygun 3 farklı yorum alternatifi üret:

BAĞLAM:
"""
${contextText}
"""
`;

      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const rawJson = response.text();

      const parsed = JSON.parse(rawJson);
      if (parsed && Array.isArray(parsed.alternatives)) {
        return { ok: true, drafts: parsed.alternatives };
      }

      throw new Error("Invalid response format from Gemini");
    } catch (err: unknown) {
      logger.error(
        "generateStrategicResponse error:",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to generate strategic response.",
      };
    }
  } catch (err) {
    console.error("[generateStrategicResponse] Error:", err);
    throw err;
  }
}
