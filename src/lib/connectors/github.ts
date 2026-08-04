import { logger } from "@/lib/utils/logger";

interface GitHubIssueItem {
  title: string;
  body: string | null;
  html_url: string;
  comments: number;
  created_at: string;
  user: {
    login: string;
  } | null;
}

export async function fetchGitHubIncidents(keyword: string): Promise<
  Array<{
    title: string;
    body: string;
    external_url: string;
    source_score: number;
  }>
> {
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(keyword)}+label:security,vulnerability,ai-safety&sort=created&order=desc&per_page=10`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ALPARAI-Incident-Monitor/1.0 (contact@alparai.com)",
      },
    });

    if (!res.ok) {
      logger.error(`GitHub API fetch failed for keyword '${keyword}': ${res.statusText}`);
      return [];
    }

    const data = (await res.json()) as { items?: GitHubIssueItem[] };
    const items = data.items || [];

    return items.map((item) => ({
      title: `[GitHub] ${item.title}`,
      body: item.body || `GitHub issue by @${item.user?.login || "anonymous"}`,
      external_url: item.html_url,
      source_score: item.comments || 0,
    }));
  } catch (error) {
    logger.error(
      `Error fetching GitHub incidents for '${keyword}'`,
      undefined,
      error instanceof Error ? error : undefined,
    );
    return [];
  }
}
