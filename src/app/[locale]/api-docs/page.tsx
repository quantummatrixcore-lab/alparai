import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Code2, Shield, Zap, Globe, ArrowLeft } from "lucide-react";
import { ApiPlayground } from "@/components/api-docs/api-playground";
import { getGlobalMetrics, type GlobalMetrics } from "@/lib/services/metrics-service";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "api_docs" });
  return {
    title: t("meta_title"),
    description: t("meta_desc"),
  };
}

const getEndpoints = (metrics: GlobalMetrics) =>
  [
    {
      method: "GET",
      path: "/api/v1/stats",
      summary: "Platform Statistics",
      description:
        "Returns aggregate platform stats: total incidents, providers tracked, average trust score and incident breakdown by category.",
      example: `curl https://alparai.com/api/v1/stats`,
      response: `{
  "data": {
    "total_incidents": ${metrics.totalIncidents},
    "total_providers": ${metrics.totalProviders},
    "average_trust_score": ${metrics.averageTrustScore},
    "by_category": {
      "misinformation": 38,
      "privacy": 29,
      "bias": 21
    }
  },
  "meta": { "generated_at": "2026-07-23T16:00:00.000Z" }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/leaderboard",
      summary: "Provider Leaderboard",
      description:
        "Returns all tracked AI providers ranked by trust score, with response rate and incident count.",
      example: `curl https://alparai.com/api/v1/leaderboard`,
      response: `{
  "data": [
    {
      "rank": 1,
      "id": "...",
      "slug": "openai",
      "name": "OpenAI",
      "is_verified": true,
      "trust_score": 82,
      "incident_count": 14,
      "response_count": 11,
      "response_rate": 78
    }
  ],
  "meta": { "total": ${metrics.totalProviders}, "generated_at": "2026-07-23T16:00:00.000Z" }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/providers",
      summary: "AI Providers List",
      description:
        "Returns tracked AI providers with SLA, uptime, MTTR metrics and verification status.",
      example: `curl https://alparai.com/api/v1/providers`,
      response: `{
  "data": [
    {
      "id": "...",
      "name": "Anthropic",
      "slug": "anthropic",
      "trust_score": 88,
      "sla_uptime_pct": 99.95,
      "sla_mttr_hours": 1.2
    }
  ],
  "meta": { "count": ${metrics.totalProviders} }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/incidents",
      summary: "Published Incidents",
      description:
        "Paginated list of published AI accountability incidents. Filter by category, severity, provider, and media_type.",
      example: `curl "https://alparai.com/api/v1/incidents?limit=10&offset=0"`,
      response: `{
  "data": [
    {
      "id": "...",
      "title": "...",
      "category": "misinformation",
      "severity": "high",
      "media_type": "text",
      "synthid_detected": false
    }
  ],
  "meta": { "total": ${metrics.totalIncidents}, "limit": 10, "offset": 0 }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/incidents/:id",
      summary: "Single Incident Detail",
      description:
        "Full details of a specific incident including PII-scrubbed evidence and provider response.",
      example: `curl https://alparai.com/api/v1/incidents/00000000-0000-0000-0000-000000000000`,
      response: `{
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "title": "...",
    "description": "...",
    "category": "bias",
    "severity": "medium"
  }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/incidents/:id/passport",
      summary: "EU AI Act Art. 73 Passport Export",
      description:
        "Export structured Passport compliant with EU AI Act Article 73 serious incident reporting.",
      example: `curl https://alparai.com/api/v1/incidents/00000000-0000-0000-0000-000000000000/passport`,
      response: `{
  "passport": {
    "article_73_compliance": true,
    "incident_id": "00000000-0000-0000-0000-000000000000",
    "eu_ai_act_classification": "High-Risk AI System Breach",
    "reporting_deadline_days": 15
  }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/slopsquatting",
      summary: "Slopsquatting Feed",
      description: "Tracks AI-hallucinated package names for dependency-confusion defense.",
      example: `curl "https://alparai.com/api/v1/slopsquatting?ecosystem=npm&limit=20"`,
      response: `{
  "count": 1,
  "reports": [
    {
      "id": "...",
      "package_name": "express-auth-ai-guard",
      "ecosystem": "npm",
      "confirmed_real": false,
      "hallucinated_by_model_id": "gpt-4"
    }
  ],
  "_meta": { "ecosystem": "npm", "limit": 20 }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/regulators",
      summary: "Regulator Feed API (EU AI Office / AISI)",
      description:
        "Machine-readable feed for EU AI Office, UK AISI, US AISI. Supports JSON and RSS 2.0 formats.",
      example: `curl "https://alparai.com/api/v1/regulators?authority=eu-ai-office&format=json"`,
      response: `{
  "authority": "eu-ai-office",
  "compliance_framework": "EU AI Act Art. 73",
  "count": 10,
  "incidents": [...]
}`,
    },
    {
      method: "POST",
      path: "/api/mcp",
      summary: "ALPAR MCP Server (JSON-RPC 2.0)",
      description:
        "Model Context Protocol endpoint for AI agent tools: alpar_search_incidents, alpar_get_passport, etc.",
      example: `curl -X POST https://alparai.com/api/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"alpar_search_incidents","arguments":{"query":"bias"}},"id":1}'`,
      response: `{
  "jsonrpc": "2.0",
  "result": { "content": [{ "type": "text", "text": "..." }] },
  "id": 1
}`,
    },
    {
      method: "GET",
      path: "/api/v1/playbooks",
      summary: "Vertical Sector Playbooks",
      description:
        "Sector-specific compliance intake & risk playbooks for Health (HIPAA/FDA), Legal, and Finance.",
      example: `curl "https://alparai.com/api/v1/playbooks?sector=health"`,
      response: `{
  "count": 1,
  "playbooks": [
    {
      "id": "...",
      "sector": "health",
      "title": "Healthcare AI Diagnostic Risk Playbook",
      "framework": "FDA SaMD & HIPAA"
    }
  ],
  "_meta": { "sector": "health", "limit": 20 }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/jailbreaks",
      summary: "Prompt Injection Museum",
      description:
        "Curated, PII-masked red-team library of reproducible jailbreaks and prompt injections.",
      example: `curl "https://alparai.com/api/v1/jailbreaks?technique=prompt_injection"`,
      response: `{
  "count": 1,
  "jailbreaks": [
    {
      "id": "...",
      "title": "Indirect Prompt Injection via Web Summarization",
      "technique": "prompt_injection",
      "severity": "critical",
      "reproducible": true
    }
  ],
  "_meta": { "technique": "prompt_injection", "limit": 20 }
}`,
    },
    {
      method: "POST",
      path: "/api/v1/provenance",
      summary: "Content Provenance Inspection",
      description: "Verify digital C2PA manifest signatures and SynthID watermark signals.",
      example: `curl -X POST https://alparai.com/api/v1/provenance -H "Content-Type: application/json" -d '{"manifest_url":"https://c2pa.org/sample.jpg"}'`,
      response: `{
  "provenance": {
    "c2pa_detected": true,
    "synthid_detected": false,
    "verification_status": "verified_synthetic",
    "alpar_provenance_seal": "ALPAR AI Content Integrity Guardian v1.0"
  }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/trust-ranking",
      summary: "AI Vendor Trust Score Ranking",
      description:
        "Public ranking index based on incident frequency, SLA MTTR, and provider response rate.",
      example: `curl https://alparai.com/api/v1/trust-ranking`,
      response: `{
  "count": 0,
  "rankings": [],
  "status": "pending_first_measurement",
  "generated_at": "2026-07-23T16:00:00.000Z"
}`,
    },
    {
      method: "GET",
      path: "/api/v1/bench-tr",
      summary: "BENCH-TR Turkish LLM Evaluation",
      description:
        "Evaluation benchmark dataset for Turkish language accuracy, bias avoidance, and grammar.",
      example: `curl https://alparai.com/api/v1/bench-tr`,
      response: `{
  "count": 4,
  "evaluations": [
    {
      "model_name": "gemini-1.5-flash",
      "provider_slug": "google",
      "tr_grammar_score": 100,
      "tr_bias_score": 100,
      "tr_factuality_pct": 100,
      "eval_dataset_ver": "v1.0-TR-free-tier"
    }
  ],
  "benchmark": "BENCH-TR (Turkish LLM Evaluation Benchmark)"
}`,
    },
    {
      method: "POST",
      path: "/api/v1/whistleblower",
      summary: "Anonymous Whistleblower Disclosure",
      description:
        "Zero-knowledge anonymous disclosure channel for AI lab employees. PII-scrubbed.",
      example: `curl -X POST https://alparai.com/api/v1/whistleblower -H "Content-Type: application/json" -d '{"lab_name":"LabX","breach_description":"Safety evaluation bypass"}'`,
      response: `{
  "message": "Whistleblower disclosure submitted securely",
  "receipt": {
    "submission_id": "...",
    "receipt_hash": "a1b2c3...",
    "anonymity_status": "Zero-Knowledge Hashed & PII Scrubbed"
  }
}`,
    },
    {
      method: "GET",
      path: "/api/v1/litigation/export",
      summary: "Litigation Chain-of-Custody Export",
      description:
        "Court-admissible PII-scrubbed evidence package with SHA256 integrity hash for legal proceedings.",
      example: `curl "https://alparai.com/api/v1/litigation/export?incident_id=00000000-0000-0000-0000-000000000000"`,
      response: `{
  "litigation_package": {
    "package_id": "LIT-00000000",
    "court_admissible_notice": "PII-masked cryptographic chain-of-custody evidence package",
    "chain_of_custody": {
      "sha256_integrity_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  }
}`,
    },
    {
      method: "POST",
      path: "/api/v1/extract",
      summary: "URL Evidence Extractor",
      description: "Extracts metadata and archives content from external incident URL links.",
      example: `curl -X POST https://alparai.com/api/v1/extract -H "Content-Type: application/json" -d '{"url":"https://example.com/incident-article"}'`,
      response: `{
  "title": "Article Title",
  "domain": "example.com",
  "archived_url": "https://alparai.com/archive/..."
}`,
    },
    {
      method: "POST",
      path: "/api/v1/risk/audit",
      summary: "EU AI Act Risk Classifier",
      description:
        "Classifies an AI system description according to EU AI Act Risk Tiers (Unacceptable, High, Minimal).",
      example: `curl -X POST https://alparai.com/api/v1/risk/audit -H "Content-Type: application/json" -d '{"system_description":"Biometric identification in public spaces"}'`,
      response: `{
  "risk_tier": "unacceptable_risk",
  "article_reference": "EU AI Act Article 5",
  "compliance_requirements": ["Prohibited AI System"]
}`,
    },
    {
      method: "GET",
      path: "/api/v1/oecd/feed",
      summary: "OECD AI Incident Taxonomy Feed",
      description:
        "Exports published incidents formatted per OECD AI Incident Reporting framework.",
      example: `curl https://alparai.com/api/v1/oecd/feed`,
      response: `{
  "oecd_framework_ver": "2026.1",
  "incidents": [...]
}`,
    },
    {
      method: "GET",
      path: "/api/v1/incidents/export",
      summary: "Incidents Bulk CSV / JSON Export",
      description: "Bulk data export of all published incidents for academic and policy research.",
      example: `curl "https://alparai.com/api/v1/incidents/export?format=json"`,
      response: `{
  "export_version": "1.0",
  "total_records": 142,
  "data": [...]
}`,
    },
  ] as const;

export default async function ApiDocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "api_docs" });
  const metrics = await getGlobalMetrics();
  const endpoints = getEndpoints(metrics);

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* Hero */}
      <div className="bg-bg-secondary border-border-subtle/50 border-b pt-4 pb-12 md:pt-8 md:pb-16">
        <Container>
          <Link
            href="/press-kit"
            className="text-fg-muted mb-6 inline-flex items-center gap-1.5 text-xs hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("back_to_press")}
          </Link>
          <div className="max-w-2xl">
            <span className="mb-3 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold tracking-wider text-blue-400 uppercase">
              {t("open_api_badge")}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t("title")}
            </h1>
            <p className="text-fg-muted mt-4 text-lg leading-relaxed">{t("description")}</p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="mb-10">
          <ApiPlayground />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-6">
            <h2 className="text-lg font-bold text-white">{t("endpoints_title")}</h2>

            {endpoints.map((ep) => (
              <Card key={ep.path} className="bg-bg-secondary border-border-subtle/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-wrap items-center gap-3">
                    <span className="border-success-500/20 rounded border bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-black text-emerald-400">
                      {ep.method}
                    </span>
                    <code className="font-mono text-sm font-semibold text-white">{ep.path}</code>
                    <span className="text-fg-muted text-sm font-normal">{ep.summary}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-fg-muted text-sm">{ep.description}</p>

                  <div>
                    <p className="text-fg-muted mb-1.5 text-[10px] font-bold tracking-wider uppercase">
                      {t("example_request")}
                    </p>
                    <pre className="bg-bg-tertiary border-border-subtle/50 overflow-x-auto rounded-lg border p-3 font-mono text-xs text-emerald-300">
                      {ep.example}
                    </pre>
                  </div>

                  <div>
                    <p className="text-fg-muted mb-1.5 text-[10px] font-bold tracking-wider uppercase">
                      {t("example_response")}
                    </p>
                    <pre className="bg-bg-tertiary border-border-subtle/50 text-fg-primary overflow-x-auto rounded-lg border p-3 font-mono text-xs">
                      {ep.response}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sticky sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="bg-bg-secondary border-border-subtle/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  {t("rate_limits")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-muted space-y-3 text-xs">
                <div className="border-border-subtle/50 flex items-center justify-between border-b pb-2">
                  <span className="text-fg-primary font-semibold">{t("free_tier")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("requests_per_day")}</span>
                  <span className="font-bold text-white">10,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("burst_limit")}</span>
                  <span className="font-bold text-white">50</span>
                </div>
                <div className="border-border-subtle/50 mt-3 flex items-center justify-between border-t border-b pt-3 pb-2">
                  <span className="text-fg-primary font-semibold">{t("enterprise_tier")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("requests_per_day")}</span>
                  <span className="font-bold text-white">100,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("sla")}</span>
                  <span className="font-bold text-white">99.99%</span>
                </div>
                <p className="border-border-subtle/50 border-t pt-3 text-[10px] leading-relaxed">
                  {t("rate_limit_note")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-bg-secondary border-border-subtle/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Globe className="h-4 w-4 text-blue-400" />
                  {t("cors_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-muted space-y-2 text-xs">
                <p>{t("cors_desc")}</p>
                <pre className="bg-bg-tertiary border-border-subtle/50 text-fg-primary rounded border p-2 font-mono text-[10px]">
                  Access-Control-Allow-Origin: *
                </pre>
              </CardContent>
            </Card>

            <Card className="bg-bg-secondary border-border-subtle/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  {t("base_url")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-muted text-xs">
                <pre className="bg-bg-tertiary border-border-subtle/50 rounded border p-2 font-mono text-[10px] text-emerald-300">
                  https://alparai.com/api/v1
                </pre>
                <p className="mt-2">{t("base_url_desc")}</p>
              </CardContent>
            </Card>

            <Card className="bg-bg-secondary border-border-subtle/50">
              <CardContent className="p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-white">
                  <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                  {t("questions")}
                </p>
                <a
                  href="mailto:press@alparai.com"
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  press@alparai.com
                </a>
                <p className="text-fg-muted mt-1 text-[10px]">{t("research_contact_desc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
