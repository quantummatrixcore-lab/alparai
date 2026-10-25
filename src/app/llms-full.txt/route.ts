import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/dehost/admin";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

interface IncidentFeedItem {
  id: string;
  title: string;
  description: string;
  category?: string | null;
  severity?: string | null;
  incident_date?: string | null;
  source_url?: string | null;
}

export async function GET() {
  let incidents: IncidentFeedItem[] = [];
  try {
    const admin = createAdminClient();
    const res = await admin
      .from("incidents")
      .select("id, title, description, category, severity, incident_date, source_url")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    if (res.data) incidents = res.data as unknown as IncidentFeedItem[];
  } catch {
    // Fallback in environments without direct database secrets
    incidents = [];
  }

  let fullContent = `# ALPAR AI — Full Incident Feed (LLM Full Dump)

`;

  for (const inc of incidents ?? []) {
    fullContent += `## Incident ${inc.id}
- **Title**: ${inc.title}
- **Category**: ${inc.category ?? "N/A"}
- **Severity**: ${inc.severity ?? "N/A"}
- **Date**: ${inc.incident_date ?? "N/A"}
- **Source**: ${inc.source_url ?? "N/A"}
- **Description**: ${inc.description}

---

`;
  }

  return new NextResponse(fullContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
export const runtime = "nodejs";
