"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Filter,
} from "lucide-react";
import {
  getPendingAttributionIncidents,
  resolveProviderAttributionAction,
  getAttributionRateMetrics,
  type PendingAttributionIncident,
  type AttributionMetrics,
} from "@/actions/admin/provider-attribution";

const POPULAR_PROVIDERS = [
  { slug: "openai", name: "OpenAI" },
  { slug: "anthropic", name: "Anthropic" },
  { slug: "google", name: "Google DeepMind" },
  { slug: "meta", name: "Meta AI" },
  { slug: "microsoft", name: "Microsoft" },
  { slug: "xai", name: "xAI" },
  { slug: "mistral", name: "Mistral AI" },
  { slug: "stability", name: "Stability AI" },
  { slug: "deepseek", name: "DeepSeek" },
  { slug: "alibaba", name: "Alibaba Cloud / Qwen" },
  { slug: "baidu", name: "Baidu / Ernie" },
  { slug: "amazon", name: "Amazon (Titan / Bedrock)" },
  { slug: "cohere", name: "Cohere" },
  { slug: "perplexity", name: "Perplexity AI" },
  { slug: "character-ai", name: "Character.ai" },
  { slug: "runway", name: "Runway" },
  { slug: "pika", name: "Pika Labs" },
  { slug: "apple", name: "Apple" },
  { slug: "nvidia", name: "NVIDIA" },
  { slug: "other", name: "Other / Unlisted" },
];

export default function ProviderReviewTriagePage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [incidents, setIncidents] = useState<PendingAttributionIncident[]>([]);
  const [metrics, setMetrics] = useState<AttributionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<Record<string, string>>({});
  const [decisiveKeywords, setDecisiveKeywords] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<{ id: string; text: string; success: boolean } | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    try {
      const [incRes, metRes] = await Promise.all([
        getPendingAttributionIncidents(100, 0),
        getAttributionRateMetrics(),
      ]);
      setIncidents(incRes.incidents);
      setMetrics(metRes);
    } catch (err) {
      console.error("Failed to load review queue data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = (incidentId: string) => {
    const slug = selectedProviders[incidentId] || "openai";
    const keyword = decisiveKeywords[incidentId]?.trim();

    startTransition(async () => {
      const res = await resolveProviderAttributionAction({
        incidentId,
        providerSlug: slug,
        decisiveKeyword: keyword || undefined,
      });

      if (res.ok) {
        setIncidents((prev) => prev.filter((inc) => inc.id !== incidentId));
        setActionMessage({
          id: incidentId,
          text: `Assigned to ${slug}${res.learned ? ` — Learned alias '${keyword}' into dictionary!` : ""}`,
          success: true,
        });
        if (metrics) {
          setMetrics({
            ...metrics,
            pendingReviewCount: Math.max(0, metrics.pendingReviewCount - 1),
            humanResolvedCount: metrics.humanResolvedCount + 1,
          });
        }
      } else {
        setActionMessage({
          id: incidentId,
          text: res.error || "Failed to resolve attribution.",
          success: false,
        });
      }
    });
  };

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.import_external_id && inc.import_external_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Provider Attribution Review Queue</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Human-in-the-loop triage desk for incidents flagged with <code className="text-amber-300">needs_provider_review</code>.
            Decisive keywords dynamically train the committed alias dictionary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href={`/${locale}/admin/incidents`}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            Back to Incidents Desk
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.pendingReviewCount}</div>
            <div className="text-xs text-zinc-500 mt-0.5">Awaiting triage</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Auto-Resolution Rate</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.autoResolutionRatePct}%</div>
            <div className="text-xs text-zinc-500 mt-0.5">Alias + Model pipeline</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Deterministic Hits</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{metrics.aliasResolvedCount}</div>
            <div className="text-xs text-zinc-500 mt-0.5">Via 47-provider dictionary</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Human Trained</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">{metrics.humanResolvedCount}</div>
            <div className="text-xs text-zinc-500 mt-0.5">Appended via learning loop</div>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search pending incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div className="text-xs text-zinc-400 font-medium">
          Showing {filteredIncidents.length} of {incidents.length} pending items
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
            actionMessage.success
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
              : "bg-red-950/40 border-red-800/60 text-red-300"
          }`}
        >
          {actionMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {actionMessage.text}
        </div>
      )}

      {/* Triage Incident Cards */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-sm">Loading review queue...</div>
      ) : filteredIncidents.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <div className="text-base font-semibold text-zinc-200">Zero Pending Provider Reviews</div>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            All imported incidents have been attributed deterministically via alias map or sovereign model judge.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((inc) => {
            const currentProvider = selectedProviders[inc.id] || "openai";
            const currentKeyword = decisiveKeywords[inc.id] || "";

            return (
              <div
                key={inc.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700/80 transition space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Needs Provider Review
                      </span>
                      {inc.incident_source && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
                          {inc.incident_source}
                        </span>
                      )}
                      {inc.import_external_id && (
                        <span className="text-xs text-zinc-500 font-mono">ID: {inc.import_external_id}</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">{inc.title}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">{inc.description}</p>
                    {inc.source_url && (
                      <a
                        href={inc.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {inc.source_url}
                      </a>
                    )}
                  </div>
                </div>

                {/* Triage Controls */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
                    {/* Provider Selector */}
                    <div className="sm:w-56">
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Target Provider</label>
                      <select
                        value={currentProvider}
                        onChange={(e) =>
                          setSelectedProviders((prev) => ({ ...prev, [inc.id]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      >
                        {POPULAR_PROVIDERS.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name} ({p.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Decisive Keyword Input (Learning Loop) */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Decisive Keyword <span className="text-zinc-500">(Auto-appends to alias dictionary)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. claude-3, gpt-4o, sora-turbo"
                        value={currentKeyword}
                        onChange={(e) =>
                          setDecisiveKeywords((prev) => ({ ...prev, [inc.id]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>

                  {/* Submit / Action Buttons */}
                  <div className="sm:self-end flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(inc.id)}
                      disabled={isPending}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Assign
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export const runtime = "nodejs";
