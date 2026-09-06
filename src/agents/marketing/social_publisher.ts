import { logger } from "@/lib/utils/logger";

interface PublishResult {
  platform: string;
  success: boolean;
  postUrl?: string;
  url?: string;
  error?: string;
}

export class SocialPublisher {
  private killSwitch: boolean;

  constructor() {
    this.killSwitch = process.env.MARKETING_AUTOPILOT !== "enabled";
    if (this.killSwitch) {
      logger.warn("[SocialPublisher] DORMANT MODE ACTIVE — no external API calls will be made");
    }
  }

  async publish(videoUrl: string, caption: string, platforms: string[]): Promise<PublishResult[]> {
    if (process.env.MARKETING_AUTOPILOT !== "enabled") {
      return platforms.map((p) => ({
        platform: p,
        success: true,
        postUrl: `https://simulated/${p}/dormant-guard`,
      }));
    }
    logger.info("[SocialPublisher] Publishing to platforms", { platforms, videoUrl });

    const results: PublishResult[] = [];

    for (const platform of platforms) {
      try {
        const result = await this.publishToPlatform(platform, videoUrl, caption);
        results.push(result);
      } catch (err) {
        logger.error(
          `[SocialPublisher] ${platform} publish failed`,
          undefined,
          err instanceof Error ? err : undefined,
        );
        results.push({ platform, success: false, error: String(err) });
      }
    }

    return results;
  }

  private async publishToPlatform(
    platform: string,
    videoUrl: string,
    caption: string,
  ): Promise<PublishResult> {
    logger.info(`[SocialPublisher] Publishing to ${platform}...`);

    switch (platform.toLowerCase()) {
      case "linkedin":
        return this.publishLinkedIn(videoUrl, caption);
      case "x":
      case "twitter":
        return this.publishX(videoUrl, caption);
      case "tiktok":
        return this.publishTikTok(videoUrl, caption);
      default:
        logger.warn(`[SocialPublisher] Unknown platform: ${platform}, simulating`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          platform,
          success: true,
          postUrl: `https://${platform}.com/simulated/${Date.now()}`,
        };
    }
  }

  private async publishLinkedIn(videoUrl: string, caption: string): Promise<PublishResult> {
    const token = process.env.LINKEDIN_ACCESS_TOKEN;
    if (!token) {
      logger.warn("[SocialPublisher] LINKEDIN_ACCESS_TOKEN not set, simulating");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        platform: "linkedin",
        success: true,
        postUrl: `https://linkedin.com/feed/update/simulated/${Date.now()}`,
      };
    }

    try {
      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || ""}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: caption },
              shareMediaCategory: "VIDEO",
              media: [{ status: "READY", media: videoUrl }],
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`LinkedIn API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as { id?: string };
      logger.info("[SocialPublisher] Published to LinkedIn", { id: data.id });
      return {
        platform: "linkedin",
        success: true,
        postUrl: `https://linkedin.com/feed/update/${data.id}`,
      };
    } catch (err) {
      logger.error(
        "[SocialPublisher] LinkedIn publish failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return { platform: "linkedin", success: false, error: String(err) };
    }
  }

  private async publishX(videoUrl: string, caption: string): Promise<PublishResult> {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
      logger.warn("[SocialPublisher] X_BEARER_TOKEN not set, simulating");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { platform: "x", success: true, postUrl: `https://x.com/simulated/${Date.now()}` };
    }

    try {
      const res = await fetch("https://api.x.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: caption + "\n\n" + videoUrl }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`X API error ${res.status}`);
      const data = (await res.json()) as { data?: { id: string } };
      return {
        platform: "x",
        success: true,
        postUrl: `https://x.com/i/web/status/${data.data?.id}`,
      };
    } catch (err) {
      logger.error(
        "[SocialPublisher] X publish failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return { platform: "x", success: false, error: String(err) };
    }
  }

  private async publishTikTok(videoUrl: string, caption: string): Promise<PublishResult> {
    const token = process.env.TIKTOK_ACCESS_TOKEN;
    if (!token) {
      logger.warn("[SocialPublisher] TIKTOK_ACCESS_TOKEN not set, simulating");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { platform: "tiktok", success: true };
    }

    try {
      const res = await fetch("https://open.tiktokapis.com/v2/video/upload/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ source: videoUrl, description: caption }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`TikTok API error ${res.status}`);
      return { platform: "tiktok", success: true };
    } catch (err) {
      logger.error(
        "[SocialPublisher] TikTok publish failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
      return { platform: "tiktok", success: false, error: String(err) };
    }
  }
}
