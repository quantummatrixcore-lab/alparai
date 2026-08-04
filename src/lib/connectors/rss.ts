import { logger } from "@/lib/utils/logger";
import { GoogleDecoder } from "google-news-url-decoder";

const decoder = new GoogleDecoder();

function cleanCdata(str: string): string {
  if (!str) return "";
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 2000,
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return res;
    }
    if (retries === 0) {
      return res;
    }
    logger.warn(
      `RSS fetch non-ok status ${res.status} for ${url}, retrying in ${delayMs}ms. Retries left: ${retries}`,
    );
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    logger.warn(
      `RSS fetch error for ${url}, retrying in ${delayMs}ms. Retries left: ${retries}`,
      error instanceof Error ? { error: error.message } : undefined,
    );
  }
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return fetchWithRetry(url, options, retries - 1, delayMs * 2);
}

export async function fetchRSSFeed(
  feedUrl: string,
  sourceName: string,
): Promise<
  Array<{
    title: string;
    body: string;
    external_url: string;
    source_score: number;
  }>
> {
  try {
    const res = await fetchWithRetry(feedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ALPARAI/1.0.0 (contact@alparai.com)",
      },
    });

    if (!res.ok) {
      logger.error(`RSS fetch failed for ${sourceName}: ${res.statusText}`);
      return [];
    }

    const xmlText = await res.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const matches = xmlText.match(itemRegex) || [];

    const results: Array<{
      title: string;
      body: string;
      external_url: string;
      source_score: number;
    }> = [];

    for (const item of matches) {
      const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);

      const title = decodeHtmlEntities(cleanCdata(titleMatch ? titleMatch[1] || "" : ""));
      let link = cleanCdata(linkMatch ? linkMatch[1] || "" : "");
      const desc = decodeHtmlEntities(cleanCdata(descMatch ? descMatch[1] || "" : ""));

      // Only check if it contains AI keywords (English and Turkish)
      const lowerTitle = title.toLowerCase();
      const lowerDesc = desc.toLowerCase();
      const hasKeywords = [
        "ai ",
        "artificial intelligence",
        "llm",
        "gpt",
        "claude",
        "gemini",
        "copilot",
        "hallucination",
        "machine learning",
        "yapay zeka",
        "yapay zekâ",
        "yapı zekâ",
        "büyük dil modeli",
        "halüsinasyon",
        "önyargı",
        "veri ihlali",
        "mahremiyet",
        "grok",
        "chatgpt",
      ].some((kw) => lowerTitle.includes(kw) || lowerDesc.includes(kw));

      if (link && title && hasKeywords) {
        if (link.includes("news.google.com")) {
          try {
            const decoded = await decoder.decode(link);
            if (decoded.status && decoded.decoded_url) {
              link = decoded.decoded_url;
            }
          } catch (e) {
            logger.warn(
              `Failed to decode Google News URL: ${link}`,
              e instanceof Error ? { error: e.message } : undefined,
            );
          }
        }
        results.push({
          title: `[${sourceName}] ${title}`,
          body: desc || "No description provided.",
          external_url: link,
          source_score: 0,
        });
      }
    }

    return results;
  } catch (error) {
    logger.error(
      `Error fetching RSS feed for ${sourceName}`,
      undefined,
      error instanceof Error ? error : undefined,
    );
    return [];
  }
}
