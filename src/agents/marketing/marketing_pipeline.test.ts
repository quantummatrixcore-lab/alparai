import { describe, it, expect, beforeEach } from "vitest";
import { ContentStrategist } from "./content_strategist";
import { FlowGenerator } from "./flow_generator";
import { SocialPublisher } from "./social_publisher";

describe("Autonomous Marketing Pipeline", () => {
  it("Strategist should generate a valid content plan", async () => {
    const strategist = new ContentStrategist({});
    const plan = await strategist.generateContentPlan(["Test commit"]);

    expect(plan).toHaveProperty("topic");
    expect(plan).toHaveProperty("videoPrompt");
  });

  it("FlowGenerator should return a video URL", async () => {
    const flowGen = new FlowGenerator("test-project");
    const url = await flowGen.generateVideo("Test prompt");

    expect(url).toContain(".mp4");
    expect(url).toContain("https://storage.googleapis.com");
  });

  it("SocialPublisher should return PublishResult array", async () => {
    const publisher = new SocialPublisher();
    const results = await publisher.publish("https://test.com/video.mp4", "Test caption", [
      "TestPlatform",
    ]);

    expect(Array.isArray(results)).toBe(true);
    expect(results[0]?.platform).toBeDefined();
    expect(results[0]?.success).toBeDefined();
  });
});

describe("SocialPublisher — Dormant Guard (Madde 90)", () => {
  const ORIGINAL_AUTOPILOT = process.env.MARKETING_AUTOPILOT;

  beforeEach(() => {
    process.env.MARKETING_AUTOPILOT = ORIGINAL_AUTOPILOT;
  });

  it("should block all external API calls when dormant guard is active", async () => {
    process.env.MARKETING_AUTOPILOT = "disabled";
    const publisher = new SocialPublisher();
    const results = await publisher.publish("https://test.com/video.mp4", "Test caption", [
      "linkedin",
      "x",
      "tiktok",
    ]);

    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.success).toBe(true);
      expect(r.postUrl).toContain("dormant-guard");
    }
  });

  it("should allow normal publish when dormant guard is bypassed", async () => {
    process.env.MARKETING_AUTOPILOT = "enabled";
    const publisher = new SocialPublisher();
    const results = await publisher.publish("https://test.com/video.mp4", "Test caption", [
      "unknown-platform",
    ]);

    expect(results).toHaveLength(1);
    expect(results[0]?.success).toBe(true);
    expect(results[0]?.postUrl).toContain("simulated");
  });
});
