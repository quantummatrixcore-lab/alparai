import { logger } from "@/lib/utils/logger";

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  score: number;
  permalink: string;
  created_utc: number;
}

export async function fetchRedditPosts(
  subreddit: string,
  keyword: string,
): Promise<
  Array<{
    title: string;
    body: string;
    external_url: string;
    source_score: number;
  }>
> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&sort=new&limit=10&restrict_sr=on`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ALPARAI/1.0.0 (contact@alparai.com)",
      },
    });

    if (!res.ok) {
      logger.error(`Reddit fetch failed for r/${subreddit}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const children = data?.data?.children || [];

    return children.map((child: { data: RedditPost }) => {
      const post = child.data;
      return {
        title: `[r/${subreddit}] ${post.title}`,
        body: post.selftext || `Link post: ${post.url}`,
        external_url: `https://reddit.com${post.permalink}`,
        source_score: post.score || 0,
      };
    });
  } catch (error) {
    logger.error(
      `Error fetching Reddit posts for r/${subreddit}`,
      undefined,
      error instanceof Error ? error : undefined,
    );
    return [];
  }
}
