import { logger } from "@/lib/utils/logger";

interface HNHit {
  points: number;
  title: string;
  author: string;
  num_comments: number;
  url: string | null;
  objectID: string;
}

export async function fetchHNStories(keyword: string): Promise<
  Array<{
    title: string;
    body: string;
    external_url: string;
    source_score: number;
  }>
> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=story`;
    const res = await fetch(url);
    if (!res.ok) {
      logger.error(`HN fetch failed: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const hits = (data?.hits || []) as HNHit[];

    // Filter items with points > 30 to make sure they are somewhat relevant/trending
    return hits
      .filter((hit) => hit.points > 30)
      .map((hit) => ({
        title: `[HN] ${hit.title}`,
        body: `Points: ${hit.points} | Author: ${hit.author} | Comments: ${hit.num_comments}\nURL: ${hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`}`,
        external_url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        source_score: hit.points || 0,
      }));
  } catch (error) {
    logger.error(
      `Error fetching HN stories for keyword ${keyword}`,
      undefined,
      error instanceof Error ? error : undefined,
    );
    return [];
  }
}
