import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const admin = createAdminClient();

  const { count } = await admin
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const content = `# ALPAR AI — Trust Infrastructure for AI Accountability

> Independent public AI incident registry and AI risk assessor ("Moody's for AI"). Compliant with EU AI Act Art. 73.

## Overview
ALPAR AI indexes, verifies, and analyzes AI incidents worldwide. Our public dataset tracks provider failures, safety breaches, algorithmic harms, and compliance risks across major AI models.

## Statistics
- Total Published Incidents: ${count ?? 0}
- Standard: EU AI Act Article 73 Reporting Framework
- License: AGPL-3.0

## Core Documentation & Resources
- [Incidents Registry](https://www.alparai.com/en/incidents): Verified public AI incidents database
- [Submit Incident](https://www.alparai.com/en/submit): Report an AI safety breach or failure
- [K-Benchmark](https://www.alparai.com/en/k-benchmark): AI model risk and compliance evaluation framework
- [Legal Imprint](https://www.alparai.com/legal/imprint): Organization legal and operator contact details
- [Full Text Feed](https://www.alparai.com/llms-full.txt): Complete raw incident data feed for LLMs

## Data Access
Public API and RSS feeds available. All incidents include structured JSON-LD (ClaimReview & Dataset) schema tags.
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
