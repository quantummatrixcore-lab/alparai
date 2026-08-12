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
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "ceo")) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  if (!url) {
    return { ok: false, error: "URL is required" };
  }

  try {
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const isX = url.includes("x.com") || url.includes("twitter.com");

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
}

/**
 * Generates three strategic, brand-consistent responses using Gemini 2.0 Flash.
 */
export async function generateStrategicResponse(
  contextText: string,
  persona: "visionary" | "diplomatic" | "punchy",
  platform: "youtube" | "linkedin" | "x" | "general",
): Promise<GenerateResponse> {
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
Sen ALPAR AI'ın stratejik iletişim asistanı ve kurucu zihnisin. 
ALPAR AI, yapay zeka sistemleri için "güven ve hesap verilebilirlik altyapısı" (trust infrastructure & accountability) kuran, topluluk odaklı bir denetim ve şikayet yönetim platformudur.
İçeriklere yapacağın yorumlar doğrudan kurucunun ağzından çıkmış gibi, yüksek düzeyde entelektüel derinliğe ve stratejik vizyona sahip olmalıdır.

KURALLAR:
1. Türkçe dil kurallarına mükemmel uyum sağla.
2. Ucuz reklam veya pazarlama dili asla kullanma. "Hemen üye olun", "Platformumuzu deneyin" gibi kalıplar yasaktır. Düşünce liderliği (thought leadership) odaklı ol.
3. ALPAR AI markasını her yorumda gözümüze sokma. Sadece gerekirse, yapay zekanın denetimi, hesap verebilirliği, KVKK/etik uyumu veya güven altyapısı bağlamında dolaylı olarak hissettir.
4. Orijinal içeriğin özünü gerçekten anladığını gösteren spesifik tespitlerde bulun. Jenerik yorumlardan kaçın.
5. Sadece JSON formatında, "alternatives" adında 3 elemanlı bir string dizisi içeren bir nesne döndür. Örnek: { "alternatives": ["yorum1", "yorum2", "yorum3"] }
`;

    let personaPrompt = "";
    if (persona === "visionary") {
      personaPrompt = `
PERSONA: Vizyoner (Visionary)
- Derin felsefi veya sektörel analojiler kur. Tarihsel paralelliklere başvur (örn. sanayi devrimi, internetin doğuşu).
- Ufuk açıcı sorular sor, tartışmayı genişlet.
- Uzunluk: 3 ila 5 cümle arasında, doyurucu.
`;
    } else if (persona === "diplomatic") {
      personaPrompt = `
PERSONA: Diplomatik (Diplomatic)
- Akademik, dengeli, regülasyon ve uyumluluk odaklı ol.
- Etik, hukuki boyutlar, AB Yapay Zeka Yasası (AI Act) veya KVKK perspektifinden yaklaş.
- Güvenilirlik ve kurumsal saygınlığı ön plana çıkar.
- Uzunluk: 2 ila 4 dengeli cümle.
`;
    } else {
      personaPrompt = `
PERSONA: Vurucu (Punchy)
- Maksimum etki, minimum kelime.
- Bir tek cümleyle çarpıcı bir tespit yap, gerekirse ikinci kısa cümleyle bağla.
- Zekice tasarlanmış, tırnak içinde paylaşılabilecek aforizma kalitesinde cümleler olsun.
- Uzunluk: 1 veya en fazla 2 cümle.
`;
    }

    let platformPrompt = "";
    if (platform === "youtube") {
      platformPrompt =
        "Platform: YouTube yorumu. İzleyici kitlesine hitap eden, videodaki konuşmacının argümanına yapıcı katkı sunan veya onu stratejik olarak sorgulayan bir üslup kullan.";
    } else if (platform === "linkedin") {
      platformPrompt =
        "Platform: LinkedIn yorumu. Profesyonel, sektörel liderleri etiketlemeye veya onlarla diyalog kurmaya uygun, kurumsal network kalitesinde.";
    } else if (platform === "x") {
      platformPrompt =
        "Platform: X (Twitter). Kısa, hızlı yayılabilecek, mention zincirlerine (threads) girebilecek nitelikte, karakter sınırlarına dikkat eden.";
    } else {
      platformPrompt =
        "Platform: Genel etkileşim. Blog yazıları veya genel makalelere yapılabilecek entelektüel yorum.";
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
}
