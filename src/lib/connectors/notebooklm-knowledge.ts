import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export interface NotebookSourcePack {
  title: string;
  category: "compliance" | "methodology" | "incidents" | "governance";
  content: string;
  wordCount: number;
  generatedAt: string;
}

/**
 * Generates a structured NotebookLM Knowledge Pack containing ALPAR AI platform docs,
 * EU AI Act Article 73 compliance rules, K-BENCHMARK methodology, and public incident summaries.
 */
export async function buildNotebookLMKnowledgePack(): Promise<NotebookSourcePack[]> {
  const db = createAdminClient();
  const now = new Date().toISOString();
  const packs: NotebookSourcePack[] = [];

  // Pack 1: EU AI Act Article 73 & Compliance Engine
  const complianceContent = `
# ALPAR AI — EU AI Act Article 73 & Trust Infrastructure Specification

## Overview
ALPAR AI serves as the independent trust infrastructure for AI accountability under EU AI Act Article 73 (Serious Incident Reporting).
- **Target Date**: August 2, 2026 (EU AI Act enforcement window).
- **Core Purpose**: Independent verification, HALLUCINATION / BIAS / PRIVACY logging, and K-BENCHMARK scoring.
- **Data Protection**: Zero-knowledge logging, PII Guardian masking prior to DB insertion.
- **License**: AGPL-3.0.
`.trim();

  packs.push({
    title: "EU AI Act Article 73 Compliance Specification",
    category: "compliance",
    content: complianceContent,
    wordCount: complianceContent.split(/\s+/).length,
    generatedAt: now,
  });

  // Pack 2: Verified Incident Summaries (top 50 incidents for RAG grounding)
  try {
    const { data: incidents } = await db
      .from("incidents")
      .select("id, title, description, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (incidents && incidents.length > 0) {
      const incidentText = incidents
        .map(
          (inc: { id: string; title: string; description?: string }, idx: number) =>
            `### Incident #${idx + 1}: ${inc.title}\n- **ID**: ${inc.id}\n- **Description**: ${inc.description ?? "No description provided"}\n`,
        )
        .join("\n---\n\n");

      const incidentPackContent = `# ALPAR AI — Live Verified AI Incident Database Index\n\n${incidentText}`;
      packs.push({
        title: "Live Verified AI Incident Database Index",
        category: "incidents",
        content: incidentPackContent,
        wordCount: incidentPackContent.split(/\s+/).length,
        generatedAt: now,
      });
    }
  } catch (err) {
    logger.error(
      "Failed to build NotebookLM incident pack",
      {},
      err instanceof Error ? err : undefined,
    );
  }

  return packs;
}
