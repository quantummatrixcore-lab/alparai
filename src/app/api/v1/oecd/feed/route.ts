import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Fetch only published incidents
    const { data: incidents, error } = await supabase
      .from("incidents")
      .select(
        `
        id,
        title_masked,
        description_masked,
        category,
        severity,
        location_country,
        incident_date,
        created_at,
        ai_provider_id
      `,
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch AI Providers to map slugs/names
    const { data: providers } = await supabase.from("ai_providers").select("id, name, slug");

    const providerMap = new Map((providers || []).map((p) => [p.id, p]));

    // Map to OECD Classification dimensions
    const oecdFeed = (incidents || []).map((inc) => {
      const provider = inc.ai_provider_id ? providerMap.get(inc.ai_provider_id) : null;
      const providerName = provider?.name || "Unknown Provider";

      // 1. People & Planet Mapping
      let peoplePlanet = "Societal and Economic Context";
      if (["harassment", "manipulation", "bias"].includes(inc.category || "")) {
        peoplePlanet = "Impact on Human Rights & Well-being";
      } else if (["privacy", "security"].includes(inc.category || "")) {
        peoplePlanet = "Impact on Security & Privacy";
      }

      // 2. Business Model Mapping (Application Domain)
      let businessModel = "General Application";
      if (inc.category === "hallucination") {
        businessModel = "Information Services & Search";
      } else if (inc.category === "bias") {
        businessModel = "Human Resources & Decision Support";
      } else if (inc.category === "security") {
        businessModel = "IT & Cyber Security";
      }

      // 3. AI System Mapping (Technology Type)
      const aiSystem = "Generative AI System / Large Language Model";

      // 4. Data & Input Mapping
      let dataInput = "Conversational Prompts / Natural Language Input";
      if (inc.category === "copyright") {
        dataInput = "Training Corpus / Intellectual Property Data";
      } else if (inc.category === "privacy") {
        dataInput = "Personal Identifiable Information (PII)";
      }

      // 5. Action & Output Mapping
      let actionOutput = "Conversational Output / Text Generation";
      if (["high", "critical"].includes(inc.severity || "")) {
        actionOutput = "High-severity incorrect output / System failure";
      }

      return {
        incident_id: inc.id,
        title: inc.title_masked,
        description: inc.description_masked,
        severity: inc.severity,
        category: inc.category,
        location_country: inc.location_country || "Global",
        incident_date: inc.incident_date,
        created_at: inc.created_at,
        oecd_classification: {
          people_planet: peoplePlanet,
          business_model: `${providerName} - ${businessModel}`,
          ai_system: aiSystem,
          data_input: dataInput,
          action_output: actionOutput,
        },
      };
    });

    return NextResponse.json(
      {
        feed_format: "ALPAR-OECD-v1",
        generated_at: new Date().toISOString(),
        count: oecdFeed.length,
        incidents: oecdFeed,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
