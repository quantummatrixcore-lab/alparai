import { logger } from "@/lib/utils/logger";
import { ContentStrategist } from "./content_strategist";
import { FlowGenerator } from "./flow_generator";
import { SocialPublisher } from "./social_publisher";

export class MarketingOrchestrator {
  private strategist: ContentStrategist;
  private flowGen: FlowGenerator;
  private publisher: SocialPublisher;

  constructor() {
    this.strategist = new ContentStrategist({ model: "gemini-3.5-flash" });
    this.flowGen = new FlowGenerator();
    this.publisher = new SocialPublisher();
  }

  /**
   * Main entrypoint for the autonomous marketing pipeline.
   * Spark agent triggers this on a schedule (e.g. daily/weekly).
   */
  async runCampaign() {
    // prettier-ignore
    if (process.env.MARKETING_AUTOPILOT !== "enabled") { logger.info("[MarketingOrchestrator] simulated."); return; }
    logger.info("=== Starting Autonomous Marketing Campaign ===");

    // 1. Get recent updates (to be fetched from database)
    const recentUpdates: string[] = [];

    // 2. Generate plan
    const plan = await this.strategist.generateContentPlan(recentUpdates);

    // 3. Generate video via Google Flow
    const videoUrl = await this.flowGen.generateVideo(plan.videoPrompt);

    // 4. Publish to social media
    const platforms = ["LinkedIn", "X", "TikTok"];
    await this.publisher.publish(videoUrl, plan.script, platforms);

    logger.info("=== Campaign Successfully Completed ===");
  }
}

// If run directly
if (require.main === module) {
  const orchestrator = new MarketingOrchestrator();
  orchestrator
    .runCampaign()
    .catch((err) =>
      logger.error(
        "Orchestrator failed",
        undefined,
        err instanceof Error ? err : new Error(String(err)),
      ),
    );
}
