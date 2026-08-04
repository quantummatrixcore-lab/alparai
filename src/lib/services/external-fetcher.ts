import { createAdminClient } from "@/lib/supabase/admin";
import { fetchRedditPosts } from "@/lib/connectors/reddit";
import { fetchHNStories } from "@/lib/connectors/hackernews";
import { fetchGitHubIncidents } from "@/lib/connectors/github";
import { fetchHackerOneDisclosedReports } from "@/lib/connectors/hackerone";
import { fetchRSSFeed } from "@/lib/connectors/rss";
import { verifyExternalItem, publishVerifiedItem } from "@/lib/ai/external-verifier";
import { logger } from "@/lib/utils/logger";

const TRUSTED_ALLOWLIST = [
  "technologyreview.com",
  "technologyreview.mit.edu",
  "404media.co",
  "lastweekinai.substack.com",
  "theregister.com",
  "arstechnica.com",
  "theverge.com",
  "wired.com",
  "venturebeat.com",
];

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function runExternalFetchTask() {
  const supabase = createAdminClient();

  const redditSubs = ["ChatGPT", "artificial", "MachineLearning", "ArtificialIntelligence"];
  const redditKeywords = ["hallucination", "bias", "error", "wrong", "harm"];
  const positiveKeywords = [
    "AI breakthrough",
    "AI helps",
    "AI benefit",
    "AI healthcare",
    "AI climate",
    "AI education",
    "AI accessibility",
    "open source AI",
    "AI safety research",
    "responsible AI",
  ];
  const hnKeywords = ["hallucination", "AI mistake", "AI bias", "AI harm"];

  const rssFeeds = [
    { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/" },
    { name: "404 Media", url: "https://www.404media.co/rss/" },
    { name: "Import AI", url: "https://importai.substack.com/feed" },
    { name: "The Register", url: "https://www.theregister.com/headlines.atom" },
    {
      name: "Google News AI",
      url: "https://news.google.com/rss/search?q=artificial+intelligence+when:24h&hl=en-US&gl=US&ceid=US:en",
    },
    {
      name: "Google News AI (TR)",
      url: "https://news.google.com/rss/search?q=yapay+zeka+when:24h&hl=tr&gl=TR&ceid=TR:tr",
    },
    {
      name: "Google News AI Extended (TR)",
      url: "https://news.google.com/rss/search?q=yapay+zeka+OR+yapay+zek%C3%A2+OR+b%C3%BCy%C3%BCk+dil+modeli+when:24h&hl=tr&gl=TR&ceid=TR:tr",
    },
  ];

  const allFetched: Array<{
    source: string;
    external_url: string;
    title: string;
    body: string;
    source_score: number;
  }> = [];

  const allPositive: Array<{
    source: string;
    external_url: string;
    title: string;
    body: string;
    source_score: number;
  }> = [];

  // 1. Fetch Reddit, HN, GitHub, HackerOne, and RSS concurrently via Promise.all
  const redditFetchPromises = redditSubs.flatMap((sub) => [
    ...redditKeywords.map((kw) =>
      fetchRedditPosts(sub, kw).then((posts) => ({
        type: "fetched",
        items: posts.map((p) => ({ ...p, source: "reddit" })),
      })),
    ),
    ...positiveKeywords.slice(0, 3).map((kw) =>
      fetchRedditPosts(sub, kw).then((posts) => ({
        type: "positive",
        items: posts.map((p) => ({ ...p, source: "reddit" })),
      })),
    ),
  ]);

  const hnFetchPromises = [
    ...hnKeywords.map((kw) =>
      fetchHNStories(kw).then((stories) => ({
        type: "fetched",
        items: stories.map((s) => ({ ...s, source: "hn" })),
      })),
    ),
    ...positiveKeywords.slice(0, 3).map((kw) =>
      fetchHNStories(kw).then((stories) => ({
        type: "positive",
        items: stories.map((s) => ({ ...s, source: "hn" })),
      })),
    ),
  ];

  const ghFetchPromises = ["vulnerability", "leak"].map((kw) =>
    fetchGitHubIncidents(kw).then((issues) => ({
      type: "fetched",
      items: issues.map((g) => ({ ...g, source: "github" })),
    })),
  );

  const h1FetchPromises = ["AI", "vulnerability", "model"].map((_kw) =>
    fetchHackerOneDisclosedReports().then((reports) => ({
      type: "fetched",
      items: reports.map((r) => ({
        source: "hackerone",
        external_url: r.url,
        title: r.title,
        body: r.summary,
        source_score:
          r.severity === "critical"
            ? 100
            : r.severity === "high"
              ? 80
              : r.severity === "medium"
                ? 50
                : 20,
      })),
    })),
  );

  const rssFetchPromises = rssFeeds.map((feed) =>
    fetchRSSFeed(feed.url, feed.name).then((items) => ({
      type: "both",
      items: items.map((i) => ({ ...i, source: "rss" })),
    })),
  );

  const results = await Promise.allSettled([
    ...redditFetchPromises,
    ...hnFetchPromises,
    ...ghFetchPromises,
    ...h1FetchPromises,
    ...rssFetchPromises,
  ]);

  for (const res of results) {
    if (res.status === "fulfilled") {
      const { type, items } = res.value;
      if (type === "fetched" || type === "both") {
        allFetched.push(...items);
      }
      if (type === "positive" || type === "both") {
        allPositive.push(...items);
      }
    }
  }

  logger.info(
    `[FetchExternal] Fetched ${allFetched.length} potential incidents, ${allPositive.length} potential positive developments.`,
  );

  // --- Process positive developments directly into ecosystem_news ---
  let positiveInserted = 0;
  for (const item of allPositive) {
    const { error } = await supabase.from("ecosystem_news").insert({
      title_en: item.title,
      summary_en: item.body,
      category: "positive_development",
      severity: "low",
      status: "published",
      source: item.source,
      url: item.external_url,
      is_active: true,
      published_at: new Date().toISOString(),
    });

    if (error) {
      logger.warn("[FetchExternal] Positive insert skipped (likely duplicate)", {
        url: item.external_url,
        error: error.message,
      });
      continue;
    }
    positiveInserted++;
  }

  // --- Process negative/detection items into external_incidents_queue ---
  let insertedCount = 0;
  let aiPublishedCount = 0;
  let verificationSkippedCount = 0;

  for (const item of allFetched) {
    const isTrusted = TRUSTED_ALLOWLIST.includes(getDomain(item.external_url));
    let status = "pending";
    let verdict = null;

    if (isTrusted) {
      status = "published";
    } else {
      try {
        verdict = await verifyExternalItem(item.title, item.body);
        if (verdict.approved) {
          status = "accepted";
        }
      } catch (err) {
        logger.error("[FetchExternal] AI verification threw exception", {
          url: item.external_url,
          error: err instanceof Error ? err.message : String(err),
        });
        verificationSkippedCount++;
      }
    }

    const { error } = await supabase.from("external_incidents_queue").upsert(
      {
        source: item.source,
        external_url: item.external_url,
        title: item.title,
        body: item.body,
        source_score: item.source_score,
        status,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "external_url",
      },
    );

    if (error) {
      logger.error("[FetchExternal] Upsert failed", {
        url: item.external_url,
        error: error.message,
      });
      continue;
    }

    insertedCount++;

    if (isTrusted || verdict?.approved) {
      const published = await publishVerifiedItem({
        title: item.title,
        body: item.body,
        externalUrl: item.external_url,
        source: item.source,
        category: verdict?.category || "other",
        severity: verdict?.severity || "low",
        plausibilityScore: verdict?.plausibilityScore || 90,
      });
      if (published.success) {
        aiPublishedCount++;
      }
    }
  }

  return {
    total_fetched: allFetched.length,
    total_positive: allPositive.length,
    positive_inserted: positiveInserted,
    inserted_or_updated: insertedCount,
    ai_verified_published: aiPublishedCount,
    verification_skipped_or_failed: verificationSkippedCount,
  };
}
