/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../helpers/setup";
import { fetchRSSFeed } from "@/lib/connectors/rss";

describe("fetchRSSFeed with retry backoff", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should return results on a successful first attempt", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => `
        <rss>
          <channel>
            <item>
              <title>AI is transforming the world</title>
              <link>https://theregister.com/ai-story</link>
              <description>A story about AI and LLM</description>
            </item>
          </channel>
        </rss>
      `,
    });

    const promise = fetchRSSFeed("https://theregister.com/feed", "The Register");
    const results = await promise;

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("[The Register] AI is transforming the world");
  });

  it("should retry up to 3 times on failure and succeed when fetch succeeds", async () => {
    // 2 failed attempts, then 1 success
    mockFetch
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <rss>
            <channel>
              <item>
                <title>New Claude model released</title>
                <link>https://theregister.com/claude</link>
                <description>Claude 4 details</description>
              </item>
            </channel>
          </rss>
        `,
      });

    const promise = fetchRSSFeed("https://theregister.com/feed", "The Register");

    // Fast-forward through delays
    await vi.runAllTimersAsync();

    const results = await promise;
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("[The Register] New Claude model released");
  });

  it("should fail and return empty array after all retries are exhausted", async () => {
    mockFetch.mockRejectedValue(new Error("Persistent Network Error"));

    const promise = fetchRSSFeed("https://theregister.com/feed", "The Register");

    await vi.runAllTimersAsync();

    const results = await promise;
    expect(mockFetch).toHaveBeenCalledTimes(4); // initial + 3 retries
    expect(results).toHaveLength(0);
  });
});
