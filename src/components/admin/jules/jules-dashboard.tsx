"use client";

import { useState } from "react";
import { createJulesSession } from "@/actions/admin/jules";

interface JulesSession {
  name: string;
  sessionId: string;
  state: string;
  createTime: string;
  prompt: string;
}

interface JulesDashboardProps {
  sessions: JulesSession[];
  connected: boolean;
  defaultRepo: string;
}

const PRESET_TASKS = [
  {
    label: "Write missing unit tests",
    value:
      "Analyze the codebase and write comprehensive unit tests for any untested functions in src/actions/ and src/lib/. Focus on edge cases and error handling.",
  },
  {
    label: "Fix TypeScript errors",
    value:
      "Find and fix all TypeScript strict-mode errors. Use `unknown` instead of `any`. Do not skip noUncheckedIndexedAccess violations.",
  },
  {
    label: "Dependency security audit",
    value:
      "Run pnpm audit, identify all high/critical vulnerabilities, and fix them by updating to safe upstream versions.",
  },
  {
    label: "Accessibility fixes",
    value:
      "Audit all admin pages for WCAG 2.1 AA violations. Fix contrast ratios, missing aria-labels, and keyboard navigation gaps.",
  },
  {
    label: "Performance: ISR + Suspense",
    value:
      "Convert force-dynamic pages to ISR where data permits. Add React Suspense boundaries to improve TTFB and LCP scores.",
  },
  {
    label: "i18n completeness",
    value:
      "Find all hardcoded English strings in UI components and move them to messages/en.json and messages/tr.json translation files.",
  },
];

const STATE_COLORS: Record<string, string> = {
  COMPLETED: "text-green-400 bg-green-400/10",
  IN_PROGRESS: "text-blue-400 bg-blue-400/10",
  FAILED: "text-red-400 bg-red-400/10",
  PENDING: "text-yellow-400 bg-yellow-400/10",
};

export function JulesDashboard({ sessions, connected, defaultRepo }: JulesDashboardProps) {
  const [prompt, setPrompt] = useState("");
  const [repo, setRepo] = useState(defaultRepo);
  const [branch, setBranch] = useState("master");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [localSessions, setLocalSessions] = useState<JulesSession[]>(sessions);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !repo.trim()) return;
    setSubmitting(true);
    setResult(null);

    const res = await createJulesSession({ prompt, repo, branch });
    if (res.success && res.session) {
      setLocalSessions((prev) => [res.session!, ...prev]);
      setResult({ success: true, message: `Session created: ${res.session.sessionId}` });
      setPrompt("");
    } else {
      setResult({ success: false, message: res.error ?? "Unknown error" });
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen space-y-8 bg-zinc-950 p-6 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.15" />
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill="#4285F4"
              />
            </svg>
            Google Jules
            <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs font-normal text-zinc-500">
              AI Coding Agent
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Assign autonomous coding tasks to Jules — runs in a secure Google Cloud VM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${connected ? "animate-pulse bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-sm text-zinc-400">
            {connected ? `Connected • ${localSessions.length} sessions` : "API key not configured"}
          </span>
        </div>
      </div>

      {!connected && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300">
          <strong>Setup required:</strong> Add{" "}
          <code className="rounded bg-zinc-800 px-1">JULES_API_KEY</code> to your environment
          variables. Get your API key at{" "}
          <a
            href="https://jules.google.com/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-100"
          >
            jules.google.com/settings
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* New Task Form */}
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-200">Assign New Task</h2>

          {/* Presets */}
          <div>
            <p className="mb-2 text-xs text-zinc-500">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TASKS.map((task) => (
                <button
                  key={task.label}
                  type="button"
                  onClick={() => setPrompt(task.value)}
                  className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition-colors hover:border-blue-500/50 hover:text-blue-300"
                >
                  {task.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Task Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what Jules should do..."
                rows={5}
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Repository</label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="owner/repo"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="master"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !connected}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Creating session…" : "Assign to Jules →"}
            </button>
          </form>

          {result && (
            <div
              className={`rounded-lg p-3 text-sm ${result.success ? "border border-green-500/20 bg-green-500/10 text-green-300" : "border border-red-500/20 bg-red-500/10 text-red-300"}`}
            >
              {result.message}
            </div>
          )}
        </div>

        {/* CLI Quick Reference */}
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-200">CLI Reference</h2>
          <div className="space-y-3 font-mono text-xs">
            {[
              { desc: "List sessions", cmd: "jules remote list --session" },
              { desc: "Assign task", cmd: `jules new --repo ${defaultRepo} "your task"` },
              { desc: "Pull result", cmd: "jules remote pull --session <id> --apply" },
              {
                desc: "3 parallel tasks",
                cmd: `jules new --repo ${defaultRepo} --parallel 3 "task"`,
              },
              { desc: "Teleport to session", cmd: "jules teleport <sessionId>" },
              { desc: "Interactive TUI", cmd: "jules" },
            ].map(({ desc, cmd }) => (
              <div key={desc} className="rounded-lg bg-zinc-800 p-3">
                <p className="mb-1 text-zinc-500"># {desc}</p>
                <p className="break-all text-green-400">{cmd}</p>
              </div>
            ))}
          </div>
          <a
            href="https://jules.google.com/session/6852615041969763758"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-blue-500/30 py-2 text-center text-sm text-blue-400 transition-colors hover:bg-blue-500/10"
          >
            Open Jules Web UI →
          </a>
        </div>
      </div>

      {/* Sessions List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 font-semibold text-zinc-200">
          Active Sessions ({localSessions.length})
        </h2>
        {localSessions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="mb-3 text-4xl">🤖</p>
            <p>No Jules sessions yet. Assign your first task above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localSessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-start justify-between gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-4 transition-colors hover:border-zinc-600"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-zinc-200">{session.prompt}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-500">
                    {session.sessionId} • {new Date(session.createTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${STATE_COLORS[session.state] ?? "bg-zinc-700 text-zinc-400"}`}
                  >
                    {session.state}
                  </span>
                  <a
                    href={`https://jules.google.com/session/${session.sessionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 underline hover:text-blue-300"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
