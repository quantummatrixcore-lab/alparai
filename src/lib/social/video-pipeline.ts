import "server-only";
import { VertexVeoAdapter } from "@/lib/ai/adapters/vertex-veo";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export interface VideoPipelineResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  promptUsed?: string;
}

export async function generateWeeklyVideoSummary(): Promise<VideoPipelineResult> {
  const supabase = createAdminClient();
  const veo = new VertexVeoAdapter();

  try {
    logger.info("[VideoPipeline] Starting weekly summary video production...");

    // 1. Fetch top incidents from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: incidents, error: dbError } = await supabase
      .from("incidents")
      .select("id, title, description, severity")
      .eq("status", "published")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("severity", { ascending: false })
      .limit(3);

    if (dbError) {
      throw dbError;
    }

    if (!incidents || incidents.length === 0) {
      logger.info(
        "[VideoPipeline] No new incidents in the last 7 days, fallback to top incidents.",
      );
      // Fallback: get top incidents overall
      const { data: fallbackIncidents } = await supabase
        .from("incidents")
        .select("id, title, description, severity")
        .eq("status", "published")
        .order("severity", { ascending: false })
        .limit(3);

      if (fallbackIncidents && fallbackIncidents.length > 0) {
        incidents.push(...fallbackIncidents);
      }
    }

    // 2. Build descriptive video prompt based on incidents
    const titles = incidents.map((i) => i.title).join(", ");
    const prompt = `A cinematic, high-technology data visualization representing AI accountability audits and safety risks. Holographic screens showing charts, server rooms with flashing lights, and abstract neural networks representing system vulnerabilities. Text overlays describing AI incidents: ${titles.slice(0, 100)}. Professional cinematic lighting, 4k, smooth camera pan.`;

    logger.info("[VideoPipeline] Prompt generated for Veo:", { prompt });

    // 3. Call Veo Video Generation (or use fallback mock if key missing)
    let videoUrl = "";
    const isConfigured = await veo.isConfigured();
    if (isConfigured) {
      const response = await veo.generateVideo(prompt, "16:9", 5);
      if (response.ok) {
        // Upload base64 video to Supabase Storage bucket 'social-assets'
        const buffer = Buffer.from(response.base64, "base64");
        const filename = `weekly-summary-${Date.now()}.mp4`;

        const { error: uploadError } = await supabase.storage
          .from("social-assets")
          .upload(filename, buffer, {
            contentType: "video/mp4",
            cacheControl: "3600",
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("social-assets")
          .getPublicUrl(filename);

        videoUrl = publicUrlData.publicUrl;
        logger.info("[VideoPipeline] Video uploaded successfully to storage:", { videoUrl });
      } else {
        logger.warn("[VideoPipeline] Veo API failed, using default fallback video asset:", {
          error: response.error,
        });
        videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // standard mock fallback mp4
      }
    } else {
      logger.info("[VideoPipeline] Vertex API Key not set locally, using mock video fallback.");
      videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    }

    // 4. Save video meta to social_assets DB table
    const { error: insertError } = await supabase.from("social_posts").insert({
      title: "Weekly AI Incident Video Summary",
      body_text: `Weekly AI incident digest video: ${titles}. Watch to learn about recent AI security vulnerabilities. #AIAccountability #AISafety`,
      content_type: "weekly_report",
      status: "draft",
      video_url: videoUrl,
      platform: "linkedin",
    });

    if (insertError) {
      logger.error(
        "[VideoPipeline] Failed to insert social post into DB:",
        insertError as unknown as Record<string, unknown>,
      );
    }

    return {
      success: true,
      videoUrl,
      promptUsed: prompt,
    };
  } catch (err: unknown) {
    logger.error("[VideoPipeline] Pipeline run failed:", err as Record<string, unknown>);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to run video production pipeline",
    };
  }
}
