import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { callWithFailover } from "@/lib/ai/openrouter-gateway";
import { selectModelByCapability } from "@/lib/audit/model-router";
import { HuggingFaceAdapter } from "@/lib/ai/adapters/huggingface";
import { VertexImagenAdapter } from "@/lib/ai/adapters/vertex-imagen";
import { logger } from "@/lib/utils/logger";

interface GeneratedContent {
  x_post: string;
  linkedin_post: string;
  image_prompt: string;
}

/**
 * Generate marketing posts and a share-card image for a newly published incident.
 */
export async function generateMarketingAssets(incidentId: string): Promise<boolean> {
  const admin = createAdminClient();

  // 1. Fetch incident details (PII-masked fields only)
  const { data: incident, error: fetchError } = await admin
    .from("incidents")
    .select("id, title_masked, description_masked, category, severity, eu_act_risk_category")
    .eq("id", incidentId)
    .single();

  if (fetchError || !incident) {
    logger.error("[ContentEngine] Incident not found for marketing generation", {
      incidentId,
      error: fetchError?.message,
    });
    return false;
  }

  const title = incident.title_masked || "AI Incident Alert";
  const description = incident.description_masked || "No description provided.";
  const category = incident.category || "unknown";
  const severity = incident.severity || "medium";
  const riskCategory = incident.eu_act_risk_category || "Minimal";

  logger.info("[ContentEngine] Starting marketing generation", { incidentId });

  // 2. Build Prompt conforming to Guardrail #10
  const systemPrompt =
    "You are a world-class Social Media Manager and Growth Hacker for ALPAR AI, the independent global rating and accountability agency for AI systems.";
  const userPrompt = `Write two social media post drafts (one for X/Twitter and one for LinkedIn) and an image generation prompt for a newly documented AI incident.

Incident Details:
Title: ${title}
Description: ${description}
Category: ${category}
Severity: ${severity}
EU AI Act Risk Category: ${riskCategory}

Rules for X/Twitter Post:
- Max 250 characters.
- Engaging, punchy, highlight the AI failure mode and the accountability gap.
- Cites the EU AI Act taxonomy alignment if applicable, but never claims compliance.
- No hashtags.

Rules for LinkedIn Post:
- Hook-first format (first line must be an engaging hook).
- In-depth, structural, professional tone.
- Links-in-comments format: end the post mentioning that the full report and evidence are in the comments/platform.
- Cites the EU AI Act taxonomy alignment if applicable, but never claims compliance.
- No hashtags.

Ensure BOTH posts strictly follow Guardrail #10:
- Use "AI Act Ready" or "aligned with the Art. 73 taxonomy" / "annex III taxonomy aligned".
- NEVER claim "AI Act Compliant", "official reporting channel", or that reporting on ALPAR fulfills a provider's legal Art. 73 duty.
- Keep the tone neutral, fact-based, and objective.

Output your response strictly as a JSON object:
{
  "x_post": "X post content text...",
  "linkedin_post": "LinkedIn post content text...",
  "image_prompt": "An artistic/conceptual high-quality 3D render representing this AI failure mode (e.g. AI medical advice safety issue, deepfake trust violation, system bias) for our brand visual. The style should be modern, clean, glassmorphic, and fit our dark slate (#0A1622) and emerald (#00FF88) color scheme. Minimal text. 8k resolution."
}
`;

  let generated: GeneratedContent | null = null;
  const startTextTime = performance.now();

  try {
    const res = await callWithFailover(
      {
        systemPrompt,
        userMessage: userPrompt,
        temperature: 0.2,
        responseFormat: "json",
      },
      await selectModelByCapability("creative_copy"),
    );
    if (res.ok && res.data?.content) {
      const parsed = JSON.parse(res.data.content);
      if (parsed.x_post && parsed.linkedin_post && parsed.image_prompt) {
        generated = parsed as GeneratedContent;
      }
    }
  } catch (err) {
    logger.error(
      "[ContentEngine] Gemini/OpenRouter text generation failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }

  const textLatencyMs = Math.round(performance.now() - startTextTime);
  // Log generation cost (DeepSeek input is ~$0.14/M, output $0.28/M tokens)
  const textCostEst = (userPrompt.length / 4 / 1_000_000) * 0.14 + (1000 / 4 / 1_000_000) * 0.28;
  logger.info("[ContentEngine] Text generation finished", {
    latencyMs: textLatencyMs,
    estimatedCostUsd: parseFloat(textCostEst.toFixed(6)),
  });

  if (!generated) {
    logger.error("[ContentEngine] Could not parse generated JSON structure");
    return false;
  }

  // 3. Generate image using Hugging Face (with Vertex as fallback)
  let imageUrl: string | null = null;
  const startImgTime = performance.now();

  try {
    if (process.env.NODE_ENV === "production" && !process.env.HF_API_KEY) {
      throw new Error("CRITICAL: HF_API_KEY is absent in production environment!");
    }

    let base64Data: string | undefined;
    let mimeTypeData: string | undefined;

    logger.info("[ContentEngine] Attempting Hugging Face image generation...");
    const hfAdapter = new HuggingFaceAdapter();
    const hfRes = await hfAdapter.generateImage(generated.image_prompt, "1:1");

    if (hfRes.ok && hfRes.base64) {
      base64Data = hfRes.base64;
      mimeTypeData = hfRes.mimeType;
      logger.info("[ContentEngine] Hugging Face image generation succeeded");
    } else {
      logger.warn("[ContentEngine] Hugging Face image generation failed, trying Vertex fallback", {
        error: hfRes.error,
      });
      const vertexAdapter = new VertexImagenAdapter();
      const vertexRes = await vertexAdapter.generateImage(generated.image_prompt, "1:1");
      if (vertexRes.ok && vertexRes.base64) {
        base64Data = vertexRes.base64;
        mimeTypeData = vertexRes.mimeType;
        logger.info("[ContentEngine] Vertex Imagen fallback image generation succeeded");
      } else {
        const errStr = !vertexRes.ok ? vertexRes.error : "No base64 data";
        logger.error("[ContentEngine] Both Hugging Face and Vertex image generation failed", {
          vertexError: errStr,
        });
      }
    }

    if (base64Data && mimeTypeData) {
      const buffer = Buffer.from(base64Data, "base64");
      const fileExt = mimeTypeData === "image/png" ? "png" : "jpg";
      const fileName = `${incidentId}/marketing-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await admin.storage
        .from("social-assets")
        .upload(fileName, buffer, {
          contentType: mimeTypeData,
          upsert: true,
        });

      if (!uploadError) {
        const { data } = admin.storage.from("social-assets").getPublicUrl(fileName);
        imageUrl = data?.publicUrl || null;
      } else {
        logger.warn("[ContentEngine] Failed to upload image to storage", {
          error: uploadError.message,
        });
      }
    }
  } catch (err) {
    logger.error(
      "[ContentEngine] Image generation threw exception",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }

  const imgLatencyMs = Math.round(performance.now() - startImgTime);
  // Imagen cost: flat $0.03 per image
  const imgCostEst = imageUrl ? 0.03 : 0.0;
  logger.info("[ContentEngine] Image generation finished", {
    latencyMs: imgLatencyMs,
    estimatedCostUsd: imgCostEst,
  });

  const totalCostUsd = parseFloat((textCostEst + imgCostEst).toFixed(5));

  // 4. Insert draft posts into social_posts table
  const insertPayloads = [
    {
      platform: "x" as const,
      status: "draft" as const,
      content_type: "incident_spotlight" as const,
      title: `Incident Spotlight: ${title}`,
      body_text: generated.x_post,
      image_prompt: generated.image_prompt,
      image_url: imageUrl,
      linked_incident_id: incidentId,
      estimated_reach: 0,
      likes: 0,
      comments_count: 0,
      shares_count: 0,
    },
  ];

  const { error: dbError } = await admin.from("social_posts").insert(insertPayloads);
  if (dbError) {
    logger.error("[ContentEngine] Failed to insert social posts into database", {
      error: dbError.message,
    });
    return false;
  }

  if (process.env.LINKEDIN_PUBLISHING_MODE === "true") {
    const { error: draftError } = await admin.from("marketing_drafts" as never).insert({
      platform: "linkedin",
      content: generated.linkedin_post,
      media_url: imageUrl,
      status: "pending_approval",
    } as never);

    if (draftError) {
      logger.error("[ContentEngine] Failed to insert LinkedIn draft into database", {
        error: draftError.message,
      });
    }
  } else {
    const { error: liError } = await admin.from("social_posts").insert({
      platform: "linkedin" as const,
      status: "draft" as const,
      content_type: "incident_spotlight" as const,
      title: `Incident Spotlight: ${title}`,
      body_text: generated.linkedin_post,
      image_prompt: generated.image_prompt,
      image_url: imageUrl,
      linked_incident_id: incidentId,
      estimated_reach: 0,
      likes: 0,
      comments_count: 0,
      shares_count: 0,
    });
    if (liError) {
      logger.error("[ContentEngine] Failed to insert LinkedIn fallback post", {
        error: liError.message,
      });
    }
  }

  logger.info("[ContentEngine] Marketing assets queued successfully", {
    incidentId,
    imageUrl,
    totalCostUsd,
  });

  return true;
}

/**
 * Generate social posts for a newly accepted ecosystem news item.
 */
export async function generateNewsSocialPosts(newsId: string): Promise<boolean> {
  const admin = createAdminClient();

  // 1. Fetch news details
  const { data: news, error: fetchError } = await admin
    .from("ecosystem_news")
    .select("id, title_en, summary_en, category, severity")
    .eq("id", newsId)
    .single();

  if (fetchError || !news) {
    logger.error("[ContentEngine] News item not found for social generation", {
      newsId,
      error: fetchError?.message,
    });
    return false;
  }

  const title = news.title_en || "AI Ecosystem News Alert";
  const summary = news.summary_en || "No summary provided.";
  const category = news.category || "news";
  const severity = news.severity || "medium";

  logger.info("[ContentEngine] Starting news social posts generation", { newsId });

  const systemPrompt =
    "You are a world-class Social Media Manager and Growth Hacker for ALPAR AI, the independent global rating and accountability agency for AI systems.";
  const userPrompt = `Write two social media post drafts (one for X/Twitter and one for LinkedIn) for a newly accepted AI ecosystem news item.

News Details:
Title: ${title}
Summary: ${summary}
Category: ${category}
Severity: ${severity}

Rules for X/Twitter Post:
- Max 250 characters.
- Engaging, punchy, highlight the news significance.
- No hashtags.

Rules for LinkedIn Post:
- Hook-first format (first line must be an engaging hook).
- In-depth, structural, professional tone.
- No hashtags.

Output your response strictly as a JSON object:
{
  "x_post": "X post content text...",
  "linkedin_post": "LinkedIn post content text..."
}
`;

  let generated: { x_post: string; linkedin_post: string } | null = null;
  const startTextTime = performance.now();

  try {
    const res = await callWithFailover(
      {
        systemPrompt,
        userMessage: userPrompt,
        temperature: 0.2,
        responseFormat: "json",
      },
      await selectModelByCapability("creative_copy"),
    );
    if (res.ok && res.data?.content) {
      const parsed = JSON.parse(res.data.content);
      if (parsed.x_post && parsed.linkedin_post) {
        generated = parsed as { x_post: string; linkedin_post: string };
      }
    }
  } catch (err) {
    logger.error(
      "[ContentEngine] Gemini/OpenRouter news text generation failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
  }

  const textLatencyMs = Math.round(performance.now() - startTextTime);
  const textCostEst = (userPrompt.length / 4 / 1_000_000) * 0.14 + (1000 / 4 / 1_000_000) * 0.28;
  logger.info("[ContentEngine] News text generation finished", {
    latencyMs: textLatencyMs,
    estimatedCostUsd: parseFloat(textCostEst.toFixed(6)),
  });

  if (!generated) {
    logger.error("[ContentEngine] Could not parse generated news JSON structure");
    return false;
  }

  const insertPayloads = [
    {
      platform: "x" as const,
      status: "draft" as const,
      content_type: "incident_spotlight" as const,
      title: `Ecosystem News: ${title}`,
      body_text: generated.x_post,
      linked_news_id: newsId,
      estimated_reach: 0,
      likes: 0,
      comments_count: 0,
      shares_count: 0,
    },
  ];

  const { error: dbError } = await admin.from("social_posts").insert(insertPayloads);
  if (dbError) {
    logger.error("[ContentEngine] Failed to insert news social posts into database", {
      error: dbError.message,
    });
    return false;
  }

  if (process.env.LINKEDIN_PUBLISHING_MODE === "true") {
    const { error: draftError } = await admin.from("marketing_drafts" as never).insert({
      platform: "linkedin",
      content: generated.linkedin_post,
      status: "pending_approval",
    } as never);

    if (draftError) {
      logger.error("[ContentEngine] Failed to insert LinkedIn news draft into database", {
        error: draftError.message,
      });
    }
  } else {
    const { error: liError } = await admin.from("social_posts").insert({
      platform: "linkedin" as const,
      status: "draft" as const,
      content_type: "incident_spotlight" as const,
      title: `Ecosystem News: ${title}`,
      body_text: generated.linkedin_post,
      linked_news_id: newsId,
      estimated_reach: 0,
      likes: 0,
      comments_count: 0,
      shares_count: 0,
    });
    if (liError) {
      logger.error("[ContentEngine] Failed to insert LinkedIn news fallback post", {
        error: liError.message,
      });
    }
  }

  logger.info("[ContentEngine] News social posts queued successfully", {
    newsId,
    totalCostUsd: parseFloat(textCostEst.toFixed(5)),
  });

  return true;
}
