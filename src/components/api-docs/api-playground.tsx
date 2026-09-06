"use client";

import { useState } from "react";
import { Play, Copy, Check, Terminal, Sparkles, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EndpointSpec {
  method: string;
  path: string;
  summary: string;
  description: string;
  params?: { name: string; type: string; default?: string; description: string }[];
}

const PUBLIC_ENDPOINTS: EndpointSpec[] = [
  {
    method: "GET",
    path: "/api/v1/stats",
    summary: "Platform Statistics",
    description: "Returns total incidents, tracked providers, and average trust score.",
  },
  {
    method: "GET",
    path: "/api/v1/leaderboard",
    summary: "Provider Leaderboard",
    description: "Ranked list of AI providers by trust score and incident response rate.",
  },
  {
    method: "GET",
    path: "/api/v1/providers",
    summary: "AI Providers List",
    description: "All tracked AI providers with SLA, uptime, MTTR and verification status.",
  },
  {
    method: "GET",
    path: "/api/v1/incidents",
    summary: "Published Incidents",
    description: "Paginated list of published AI accountability incidents.",
    params: [
      { name: "limit", type: "number", default: "5", description: "Number of items (max 50)" },
      { name: "category", type: "string", default: "", description: "Filter by incident category" },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/playbooks",
    summary: "EU AI Act Playbooks (I12)",
    description: "Compliance playbooks and mitigation guidance for AI risk governance.",
  },
  {
    method: "GET",
    path: "/api/v1/provenance",
    summary: "AI Provenance & C2PA Feed (I18)",
    description: "Cryptographic media authenticity and watermark detection feeds.",
  },
  {
    method: "GET",
    path: "/api/v1/eu-ai-act",
    summary: "EU AI Act Mapping (I18)",
    description: "EU AI Act risk tier breakdown and regulatory compliance status.",
  },
];

export function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointSpec>(PUBLIC_ENDPOINTS[0]!);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    limit: "5",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleParamChange = (name: string, value: string) => {
    setQueryParams((prev) => ({ ...prev, [name]: value }));
  };

  const getFullUrl = () => {
    let url = selectedEndpoint.path;
    if (selectedEndpoint.params && selectedEndpoint.params.length > 0) {
      const activeParams = selectedEndpoint.params
        .map((p) => {
          const val = queryParams[p.name] ?? p.default ?? "";
          return val ? `${encodeURIComponent(p.name)}=${encodeURIComponent(val)}` : null;
        })
        .filter(Boolean);

      if (activeParams.length > 0) {
        url += `?${activeParams.join("&")}`;
      }
    }
    return url;
  };

  const handleRunTest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);

    const targetUrl = getFullUrl();
    const startTime = Date.now();

    try {
      const res = await fetch(targetUrl);
      const latency = Date.now() - startTime;
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseData(
        JSON.stringify(
          {
            _meta: {
              status: res.status,
              latency_ms: latency,
              headers: {
                "content-type": res.headers.get("content-type"),
                "x-ratelimit-remaining": res.headers.get("x-ratelimit-remaining") || "60",
              },
            },
            body: json,
          },
          null,
          2,
        ),
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setResponseStatus(500);
      setResponseData(
        JSON.stringify({ error: "Failed to execute request", message: errorMsg }, null, 2),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const curl = `curl -X ${selectedEndpoint.method} "https://alparai.com${getFullUrl()}"`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-success-500/20 bg-bg-primary rounded-xl border p-6 shadow-2xl">
      <div className="border-border-subtle mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-success-400 h-5 w-5" />
            <h2 className="text-lg font-bold text-white">
              Interactive API Playground (Try-It-Out)
            </h2>
          </div>
          <p className="text-fg-muted mt-1 text-xs">
            Execute real-time API queries against ALPAR AI public REST endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCurl}
            className="text-fg-secondary border-border-subtle bg-[#0D1B2A] text-xs hover:bg-white/10"
          >
            {copied ? (
              <Check className="text-success-400 mr-1 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {copied ? "Copied cURL" : "Copy cURL"}
          </Button>

          <Button
            size="sm"
            onClick={handleRunTest}
            disabled={loading}
            className="bg-success-500 hover:bg-success-400 font-semibold text-slate-950"
          >
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            {loading ? "Executing..." : "Execute Test Request"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Endpoint Selector & Query Params */}
        <div className="min-w-0 space-y-4 lg:col-span-5">
          <label className="text-fg-secondary block text-xs font-semibold">Select Endpoint</label>
          <div className="space-y-2">
            {PUBLIC_ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path;
              return (
                <button
                  key={ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setResponseStatus(null);
                    setResponseData(null);
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? "border-success-500/50 bg-success-500/10 text-white shadow-lg"
                      : "text-fg-muted border-border-subtle/50 hover:border-border-strong hover:text-fg-primary bg-[#0D1B2A]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-success-400 font-mono font-bold">{ep.method}</span>
                    <span className="text-fg-muted truncate font-mono text-[11px]">{ep.path}</span>
                  </div>
                  <div className="text-fg-primary mt-1 text-xs font-medium">{ep.summary}</div>
                </button>
              );
            })}
          </div>

          {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
            <div className="border-border-subtle mt-4 rounded-lg border bg-[#0D1B2A] p-4">
              <h4 className="text-fg-primary mb-3 text-xs font-semibold">Query Parameters</h4>
              <div className="space-y-3">
                {selectedEndpoint.params.map((param) => (
                  <div key={param.name}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-success-300 font-mono">{param.name}</span>
                      <span className="text-fg-disabled">{param.type}</span>
                    </div>
                    <input
                      type="text"
                      value={queryParams[param.name] ?? param.default ?? ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description}
                      className="focus:border-success-500 border-border-subtle bg-bg-primary w-full rounded border px-3 py-1.5 font-mono text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live HTTP Console */}
        <div className="flex min-w-0 flex-col lg:col-span-7">
          <div className="text-fg-secondary flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Terminal className="text-success-400 h-4 w-4" />
              Live Response Inspector
            </span>
            {responseStatus !== null && (
              <span
                className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? "bg-success-500/20 text-success-400"
                    : "bg-danger-500/20 text-danger-400"
                }`}
              >
                HTTP {responseStatus}
              </span>
            )}
          </div>

          <div className="border-border-subtle mt-2 flex-1 rounded-lg border bg-[#060D15] p-4 font-mono text-xs">
            <div className="text-fg-muted border-border-subtle mb-2 border-b pb-2 text-[11px]">
              <span className="text-success-400">{selectedEndpoint.method}</span>{" "}
              https://alparai.com
              {getFullUrl()}
            </div>

            {loading ? (
              <div className="text-fg-muted flex h-64 items-center justify-center">
                <Server className="text-success-400 mr-2 h-5 w-5 animate-pulse" />
                Executing HTTP GET against production API...
              </div>
            ) : responseData ? (
              <pre className="text-success-300 max-h-[420px] overflow-auto">{responseData}</pre>
            ) : (
              <div className="text-fg-disabled flex h-64 flex-col items-center justify-center text-center">
                <Terminal className="text-fg-secondary mb-2 h-8 w-8" />
                <p>Click &quot;Execute Test Request&quot; above to run live query.</p>
                <p className="mt-1 text-[10px]">
                  No API key or credentials required for public endpoints.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
