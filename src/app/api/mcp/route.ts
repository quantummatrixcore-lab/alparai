import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { maskPII } from "@/lib/pii/guardian";
import type { Database } from "@/types/database";

type IncidentCategory = Database["public"]["Tables"]["incidents"]["Row"]["category"];
type IncidentSeverity = Database["public"]["Tables"]["incidents"]["Row"]["severity"];

export const runtime = "nodejs";

const MCP_SERVER_INFO = {
  name: "alpar-ai-mcp",
  version: "1.0.0",
  description:
    "ALPAR AI MCP Server — Trust infrastructure for AI accountability and safety incidents.",
};

const MCP_TOOLS = [
  {
    name: "alpar_search_incidents",
    description: "Search AI safety incidents by keyword, category, severity, or provider.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keyword for incident title or description" },
        category: {
          type: "string",
          description: "Incident category (e.g. hallucination, security, bias, privacy)",
        },
        severity: { type: "string", description: "Severity filter (low, medium, high, critical)" },
        limit: { type: "number", description: "Maximum results to return (default: 10, max: 50)" },
      },
    },
  },
  {
    name: "alpar_get_passport",
    description:
      "Retrieve an EU AI Act Article 73 compliant Incident Passport JSON for an incident ID.",
    inputSchema: {
      type: "object",
      properties: {
        incident_id: { type: "string", description: "The UUID of the incident" },
      },
      required: ["incident_id"],
    },
  },
  {
    name: "alpar_get_trust_score",
    description: "Query AI provider or model trust scores, incident counts, and safety benchmarks.",
    inputSchema: {
      type: "object",
      properties: {
        provider_slug: {
          type: "string",
          description: "Provider slug (e.g. openai, anthropic, google, meta)",
        },
      },
    },
  },
  {
    name: "alpar_submit_incident",
    description:
      "Submit a new AI safety incident report. Automatically sanitized via PII Guardian.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the incident" },
        description: { type: "string", description: "Detailed description of what occurred" },
        category: {
          type: "string",
          description: "Category (e.g. hallucination, bias, security, privacy, copyright)",
        },
        severity: { type: "string", description: "Severity (low, medium, high, critical)" },
        source_url: { type: "string", description: "URL link to evidence or public source" },
      },
      required: ["title", "description", "category"],
    },
  },
];

export async function GET() {
  return NextResponse.json({
    status: "online",
    server: MCP_SERVER_INFO,
    protocolVersion: "2024-11-05",
    tools: MCP_TOOLS.map((t) => t.name),
    endpoint: "/api/mcp",
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { jsonrpc, id, method, params } = body ?? {};

    if (jsonrpc !== "2.0" && !method) {
      return NextResponse.json({ error: "Invalid JSON-RPC request" }, { status: 400 });
    }

    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: MCP_SERVER_INFO,
          capabilities: {
            tools: {},
          },
        },
      });
    }

    if (method === "notifications/initialized") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: {} });
    }

    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: {
          tools: MCP_TOOLS,
        },
      });
    }

    if (method === "tools/call") {
      const { name, arguments: toolArgs } = params ?? {};
      const result = await handleToolCall(name, toolArgs ?? {});
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: {
          content: [
            {
              type: "text",
              text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
            },
          ],
        },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: id ?? 1,
      error: { code: -32601, message: `Method '${method}' not found` },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message },
    });
  }
}

async function handleToolCall(name: string, args: Record<string, unknown>) {
  const supabase = createAdminClient();

  if (name === "alpar_search_incidents") {
    const { query, category, severity, limit = 10 } = args;
    let req = supabase
      .from("incidents")
      .select(
        "id, title_masked, description_masked, category, severity, status, incident_date, created_at, source_url",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(Math.min(Number(limit) || 10, 50));

    if (category && typeof category === "string") {
      req = req.eq("category", category as IncidentCategory);
    }
    if (severity && typeof severity === "string") {
      req = req.eq("severity", severity as IncidentSeverity);
    }
    if (query && typeof query === "string") {
      req = req.or(`title_masked.ilike.%${query}%,description_masked.ilike.%${query}%`);
    }

    const { data, error } = await req;
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, incidents: data };
  }

  if (name === "alpar_get_passport") {
    const { incident_id } = args;
    if (!incident_id || typeof incident_id !== "string") {
      throw new Error("incident_id parameter is required");
    }

    const { data: incident, error } = await supabase
      .from("incidents")
      .select(
        `
        id, title_masked, description_masked, category, severity, status,
        incident_date, created_at, updated_at, language, location_country, source_url,
        eu_act_risk_category, eu_act_serious_incident_class,
        eu_act_high_risk_system_category, eu_act_reporting_deadline_days,
        cross_audit_truth_score, cross_audit_confidence, cross_audit_reasoning, cross_audit_model,
        views_count, upvotes_count, shares_count, comments_count,
        ai_providers:ai_provider_id ( name, slug ),
        ai_models:ai_model_id ( name )
      `,
      )
      .eq("id", incident_id)
      .maybeSingle();

    if (error || !incident) throw new Error("Incident not found");

    const data = incident as Record<string, unknown>;
    const providers = data.ai_providers as { name: string; slug: string } | null;
    const models = data.ai_models as { name: string } | null;

    return {
      meta: {
        generated_at: new Date().toISOString(),
        passport_version: "1.0",
        alpar_provenance: "ALPAR AI Trust Infrastructure",
        compliance_framework: "EU AI Act Article 73",
      },
      incident: {
        id: data.id,
        title: data.title_masked,
        description: data.description_masked,
        category: data.category,
        severity: data.severity,
        status: data.status,
        incident_date: data.incident_date,
        created_at: data.created_at,
        source_url: data.source_url,
      },
      provider: providers ? { name: providers.name, slug: providers.slug } : null,
      model: models ? { name: models.name } : null,
      eu_ai_act: {
        risk_category: data.eu_act_risk_category,
        serious_incident_class: data.eu_act_serious_incident_class,
        high_risk_system_category: data.eu_act_high_risk_system_category,
        reporting_deadline_days: data.eu_act_reporting_deadline_days,
      },
      assessment: {
        truth_score: data.cross_audit_truth_score,
        confidence: data.cross_audit_confidence,
        reasoning: data.cross_audit_reasoning,
        model: data.cross_audit_model,
      },
    };
  }

  if (name === "alpar_get_trust_score") {
    const { provider_slug } = args;
    let query = supabase.from("ai_providers").select("id, name, slug, created_at");
    if (provider_slug && typeof provider_slug === "string") {
      query = query.eq("slug", provider_slug);
    }
    const { data: providers, error } = await query;
    if (error) throw new Error(error.message);

    const results = [];
    for (const p of providers ?? []) {
      const { count } = await supabase
        .from("incidents")
        .select("id", { count: "exact", head: true })
        .eq("ai_provider_id", p.id);

      results.push({
        name: p.name,
        slug: p.slug,
        total_incidents: count ?? 0,
        trust_level: (count ?? 0) > 10 ? "needs_audit" : "verified",
      });
    }

    return { providers: results };
  }

  if (name === "alpar_submit_incident") {
    const { title, description, category, severity = "medium", source_url } = args;
    if (!title || !description || !category) {
      throw new Error("title, description, and category are required");
    }

    const titleMasked = maskPII(String(title)).masked;
    const descMasked = maskPII(String(description)).masked;

    const { data, error } = await supabase
      .from("incidents")
      .insert({
        title: titleMasked,
        description: descMasked,
        title_masked: titleMasked,
        description_masked: descMasked,
        category: String(category) as IncidentCategory,
        severity: String(severity) as IncidentSeverity,
        status: "pending_review",
        source_url: source_url ? String(source_url) : null,
      })
      .select("id, created_at, status")
      .single();

    if (error) throw new Error(error.message);

    return {
      message: "Incident submitted successfully for verification",
      incident: data,
    };
  }

  throw new Error(`Tool '${name}' not implemented`);
}
