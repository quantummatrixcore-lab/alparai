import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const admin = createAdminClient();

  const { data: incidents } = await admin
    .from("incidents")
    .select("id, title, description, category, severity, incident_date, source_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

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
