import React, { useState } from "react";
import { Sparkles, Command, Loader2, ArrowRight } from "lucide-react";

export function CognitiveDNA() {
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWidget, setGeneratedWidget] = useState<React.ReactNode | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsGenerating(true);
    setGeneratedWidget(null);

    // Simulate Generative UI streaming latency
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedWidget(
        <div className="flex flex-col gap-3 rounded-xl border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/10 to-transparent p-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
            <span className="text-sm font-semibold text-[#00f0ff]">Generated: {query}</span>
            <span className="rounded bg-emerald-400/10 px-2 py-0.5 font-mono text-xs text-emerald-400">
              Live
            </span>
          </div>
          <div className="flex items-center justify-center py-6 text-sm text-slate-300">
            <span className="animate-pulse">
              Dynamic visual data for "{query}" rendered via Vercel AI SDK (Simulation)
            </span>
          </div>
        </div>,
      );
    }, 1500);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#27272a] bg-[#121216] transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-[#00f0ff]/5">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#27272a] bg-[#1a1a1f] p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-200">
              Cognitive DNA{" "}
              <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-normal text-indigo-400">
                Gen-UI
              </span>
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Ask the system to code a widget on the fly.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <Command className="absolute left-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              className="w-full rounded-xl border border-[#27272a] bg-[#09090b] py-2.5 pr-4 pl-10 text-sm text-slate-200 transition-all outline-none placeholder:text-slate-600 focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/50"
              placeholder="e.g. Show me the churn rate pie chart for the last 7 days..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !query.trim()}
            className="flex items-center gap-2 self-end rounded-lg border border-[#00f0ff]/20 bg-[#00f0ff]/10 px-4 py-2 text-xs font-semibold text-[#00f0ff] transition-all hover:bg-[#00f0ff]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isGenerating ? "Synthesizing UI..." : "Generate"}
          </button>
        </form>

        <div className="mt-2 flex-1">
          {generatedWidget ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">{generatedWidget}</div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#27272a] bg-[#09090b]/50">
              <span className="font-mono text-xs text-slate-500">Waiting for intent...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
