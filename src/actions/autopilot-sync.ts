"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import {
  withAutopilot,
  syncNewsPolicy,
  type AttemptOutcome,
  type AttemptContext,
} from "@/lib/autopilot";
import { revalidatePath } from "next/cache";
import { resolveApiKey } from "@/lib/ai/api-keys";

const RSS_FEEDS = [
  { url: "https://www.technologyreview.com/feed/", source: "MIT Technology Review" },
  { url: "https://venturebeat.com/feed/", source: "VentureBeat" },
  { url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml", source: "The Verge" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", source: "Ars Technica" },
  { url: "https://webrazzi.com/feed/", source: "Webrazzi" },
];

function parseRSS(
  xmlText: string,
): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/g) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/);
    const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/);

    const cleanCDATAPrefix = (s: string) => {
      const trimmed = s.trim();
      if (trimmed.startsWith("<![CDATA[") && trimmed.endsWith("]]>")) {
        return trimmed.slice(9, -3).trim();
      }
      return trimmed;
    };

    const cleanHTML = (s: string) => {
      return s
        .replace(/<[^>]*>/g, "")
        .replace(/&lt;[^&]*&gt;/g, "")
        .trim();
    };

    if (titleMatch?.[1] && linkMatch?.[1]) {
      const title = cleanHTML(cleanCDATAPrefix(titleMatch[1]));
      const link = cleanCDATAPrefix(linkMatch[1]);
      const description = cleanHTML(cleanCDATAPrefix(descMatch?.[1] || ""));
      const pubDate = cleanCDATAPrefix(pubDateMatch?.[1] || new Date().toISOString());

      items.push({ title, link, description, pubDate });
    }
  }
  return items;
}

async function classifyAndTranslateNewsWithGemini(
  title: string,
  description: string,
): Promise<{
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  title_en: string;
  title_tr: string;
  summary_en: string;
  summary_tr: string;
} | null> {
  const apiKey = await resolveApiKey("google", "GOOGLE_API_KEY");
  if (!apiKey) {
    logger.error("No Google API Key found for news sync Gemini call");
    return null;
  }

  const prompt = `You are a professional AI technology news editor for ALPAR AI.
Analyze the following RSS news item (it could be in English or Turkish):
Title: "${title}"
Description: "${description}"

Perform these tasks:
1. Classify the category: Must be one of: "regulation", "incident", "research", "security", "news".
2. Classify the severity: Must be one of: "critical", "high", "medium", "low".
3. Write a clean, professional version of the title in English (maximum 80 characters) and put it in "title_en". If the original title is in Turkish, translate it accurately to English.
4. Write a clean, professional version of the title in Turkish (maximum 80 characters) and put it in "title_tr". If the original title is in English, translate it accurately to Turkish.
5. Write a concise English summary of the news (maximum 180 characters) and put it in "summary_en".
6. Write a concise Turkish summary of the news (maximum 180 characters) and put it in "summary_tr".

Return ONLY a valid JSON object matching this schema (do not output markdown ticks, triple backticks or extra explanations):
{
  "category": "category_string",
  "severity": "severity_string",
  "title_en": "title_in_english",
  "title_tr": "title_in_turkish",
  "summary_en": "summary_in_english",
  "summary_tr": "summary_in_turkish"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error("Gemini API call failed", { status: response.status });
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      logger.error("Gemini API returned empty text");
      return null;
    }

    const parsed = JSON.parse(text);
    return {
      category: parsed.category || "news",
      severity: ["critical", "high", "medium", "low"].includes(parsed.severity)
        ? parsed.severity
        : "medium",
      title_en: parsed.title_en || title,
      title_tr: parsed.title_tr || title,
      summary_en: parsed.summary_en || "",
      summary_tr: parsed.summary_tr || "",
    };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error(
      "Error calling Gemini API for news sync",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return null;
  }
}

async function runNewsSyncWork(
  ctx: AttemptContext,
): Promise<AttemptOutcome<{ processed: number; added: number }>> {
  void ctx;
  const admin = createAdminClient();
  let added = 0;
  let processed = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        logger.warn(`Failed to fetch RSS feed: ${feed.url}`, { status: res.status });
        continue;
      }
      const xml = await res.text();
      const items = parseRSS(xml).slice(0, 5); // Process top 5 recent items per feed to avoid overload

      for (const item of items) {
        processed++;
        // Check if URL already exists
        const { data: existing } = await admin
          .from("ecosystem_news")
          .select("id")
          .eq("url", item.link)
          .maybeSingle();

        if (existing) {
          continue;
        }

        // Call Gemini to classify & translate
        const aiResult = await classifyAndTranslateNewsWithGemini(item.title, item.description);
        if (!aiResult) {
          continue;
        }

        // Parse pubDate
        let publishedAt = new Date();
        try {
          publishedAt = new Date(item.pubDate);
          if (isNaN(publishedAt.getTime())) {
            publishedAt = new Date();
          }
        } catch {
          publishedAt = new Date();
        }

        const { error: insertError } = await admin.from("ecosystem_news").insert({
          title_en: aiResult.title_en,
          title_tr: aiResult.title_tr,
          summary_en: aiResult.summary_en,
          summary_tr: aiResult.summary_tr,
          url: item.link,
          source: feed.source,
          category: aiResult.category,
          severity: aiResult.severity,
          published_at: publishedAt.toISOString(),
          is_active: true,
          is_featured: false,
        });

        if (insertError) {
          logger.error(`Failed to insert news item: ${item.link}`, { error: insertError.message });
        } else {
          added++;
        }
      }
    } catch (err) {
      const isTimeout =
        err instanceof Error &&
        (err.name === "TimeoutError" ||
          err.name === "AbortError" ||
          err.message.toLowerCase().includes("timeout"));
      if (isTimeout) {
        logger.warn(`RSS feed fetch timeout: ${feed.url}`);
      } else {
        logger.error(
          `Error processing RSS feed: ${feed.url}`,
          undefined,
          err instanceof Error ? err : undefined,
        );
      }
    }
  }

  return { kind: "success", value: { processed, added } };
}

export async function syncNewsAction(): Promise<{ ok: boolean; added?: number }> {
  const timestamp = new Date().toISOString().slice(0, 13); // hourly idempotency key
  const idempotencyKey = `news-sync:${timestamp}`;

  const result = await withAutopilot<{ processed: number; added: number }>(
    syncNewsPolicy,
    [idempotencyKey],
    (ctx) => runNewsSyncWork(ctx),
    { context: { userId: null, ipHash: null, clientIdempotencyKey: idempotencyKey } },
  );

  if (result.kind === "ok") {
    try {
      revalidatePath("/");
      revalidatePath("/incidents");
    } catch (e) {
      console.error("Ignored error:", e);
    }
    return { ok: true, added: result.value.added };
  }

  if (result.kind === "replayed") {
    return { ok: true, added: 0 };
  }

  return { ok: false };
}

export async function checkAndTriggerNewsSyncPassive(): Promise<void> {
  const admin = createAdminClient();
  try {
    // Check the last successful run of syncNews
    const { data: lastRun } = await admin
      .from("autopilot_runs")
      .select("created_at")
      .eq("action", "syncNews")
      .eq("status", "succeeded")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    const lastRunTime = lastRun ? new Date(lastRun.created_at).getTime() : 0;

    if (lastRunTime < sixHoursAgo) {
      // Trigger asynchronously so it does not block the render/request
      void syncNewsAction().catch((err) => {
        logger.error(
          "Background passive news sync failed",
          undefined,
          err instanceof Error ? err : undefined,
        );
      });
    }
  } catch (err) {
    logger.error(
      "Failed to check last news sync time",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }
}
