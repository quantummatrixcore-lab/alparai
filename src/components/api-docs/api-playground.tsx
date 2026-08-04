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
    <div className="rounded-xl border border-emerald-500/20 bg-[#0A1622] p-6 shadow-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Interactive API Playground (Try-It-Out)
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Execute real-time API queries against ALPAR AI public REST endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCurl}
            className="border-white/10 bg-[#0D1B2A] text-xs text-slate-300 hover:bg-white/10"
          >
            {copied ? (
              <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {copied ? "Copied cURL" : "Copy cURL"}
          </Button>

          <Button
            size="sm"
            onClick={handleRunTest}
            disabled={loading}
            className="bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            {loading ? "Executing..." : "Execute Test Request"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Endpoint Selector & Query Params */}
        <div className="min-w-0 space-y-4 lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-300">Select Endpoint</label>
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
                      ? "border-emerald-500/50 bg-emerald-500/10 text-white shadow-lg"
                      : "border-white/5 bg-[#0D1B2A] text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-400">{ep.method}</span>
                    <span className="truncate font-mono text-[11px] text-slate-400">{ep.path}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-200">{ep.summary}</div>
                </button>
              );
            })}
          </div>

          {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#0D1B2A] p-4">
              <h4 className="mb-3 text-xs font-semibold text-slate-200">Query Parameters</h4>
              <div className="space-y-3">
                {selectedEndpoint.params.map((param) => (
                  <div key={param.name}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-emerald-300">{param.name}</span>
                      <span className="text-slate-500">{param.type}</span>
                    </div>
                    <input
                      type="text"
                      value={queryParams[param.name] ?? param.default ?? ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description}
                      className="w-full rounded border border-white/10 bg-[#08121C] px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live HTTP Console */}
        <div className="flex min-w-0 flex-col lg:col-span-7">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-emerald-400" />
              Live Response Inspector
            </span>
            {responseStatus !== null && (
              <span
                className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                HTTP {responseStatus}
              </span>
            )}
          </div>

          <div className="mt-2 flex-1 rounded-lg border border-white/10 bg-[#060D15] p-4 font-mono text-xs">
            <div className="mb-2 border-b border-white/10 pb-2 text-[11px] text-slate-400">
              <span className="text-emerald-400">{selectedEndpoint.method}</span>{" "}
              https://alparai.com
              {getFullUrl()}
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center text-slate-400">
                <Server className="mr-2 h-5 w-5 animate-pulse text-emerald-400" />
                Executing HTTP GET against production API...
              </div>
            ) : responseData ? (
              <pre className="max-h-[420px] overflow-auto text-emerald-300">{responseData}</pre>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
                <Terminal className="mb-2 h-8 w-8 text-slate-600" />
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
