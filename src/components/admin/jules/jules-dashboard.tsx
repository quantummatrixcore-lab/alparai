"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
    labelKey: "jules_preset_unit_tests",
    value:
      "Analyze the codebase and write comprehensive unit tests for any untested functions in src/actions/ and src/lib/. Focus on edge cases and error handling.",
  },
  {
    labelKey: "jules_preset_ts_errors",
    value:
      "Find and fix all TypeScript strict-mode errors. Use `unknown` instead of `any`. Do not skip noUncheckedIndexedAccess violations.",
  },
  {
    labelKey: "jules_preset_security_audit",
    value:
      "Run pnpm audit, identify all high/critical vulnerabilities, and fix them by updating to safe upstream versions.",
  },
  {
    labelKey: "jules_preset_a11y_fixes",
    value:
      "Audit all admin pages for WCAG 2.1 AA violations. Fix contrast ratios, missing aria-labels, and keyboard navigation gaps.",
  },
  {
    labelKey: "jules_preset_perf_fixes",
    value:
      "Convert force-dynamic pages to ISR where data permits. Add React Suspense boundaries to improve TTFB and LCP scores.",
  },
  {
    labelKey: "jules_preset_i18n_fixes",
    value:
      "Find all hardcoded English strings in UI components and move them to messages/en.json and messages/tr.json translation files.",
  },
] as const;

const STATE_COLORS: Record<string, string> = {
  COMPLETED: "text-success-400 bg-success-400/10",
  IN_PROGRESS: "text-brand-400 bg-brand-400/10",
  FAILED: "text-danger-400 bg-danger-400/10",
  PENDING: "text-warning-400 bg-warning-400/10",
};

export function JulesDashboard({ sessions, connected, defaultRepo }: JulesDashboardProps) {
  const t = useTranslations("admin");
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
      setResult({
        success: true,
        message: t("jules_msg_session_created", { id: res.session.sessionId }),
      });
      setPrompt("");
    } else {
      setResult({ success: false, message: res.error ?? t("jules_msg_unknown_error") });
    }
    setSubmitting(false);
  }

  return (
    <div className="bg-bg-tertiary text-fg-primary min-h-screen space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl flex items-center gap-3 font-bold text-white">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4285F4" opacity="0.15" />
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill="#4285F4"
              />
            </svg>
            Google Jules
            <span className="text-fg-disabled bg-bg-elevated rounded-full px-2 py-1 text-xs font-normal">
              {t("jules_agent_badge")}
            </span>
          </h1>
          <p className="text-fg-muted mt-1 text-sm">{t("jules_header_subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${connected ? "bg-success-400 animate-pulse" : "bg-danger-400"}`}
          />
          <span className="text-fg-muted text-sm">
            {connected
              ? t("jules_status_connected", { count: localSessions.length })
              : t("jules_status_not_configured")}
          </span>
        </div>
      </div>

      {!connected && (
        <div className="border-warning-500/20 bg-warning-500/5 text-warning-300 rounded-xl border p-4 text-sm">
          <strong>{t("jules_setup_required")}</strong> {t("jules_setup_desc_prefix")}
          <code className="bg-bg-elevated rounded px-1">JULES_API_KEY</code>
          {t("jules_setup_desc_suffix")}
          <a
            href="https://jules.google.com/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-warning-100 underline"
          >
            jules.google.com/settings
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* New Task Form */}
        <div className="border-border-subtle bg-bg-elevated/50 space-y-4 rounded-xl border p-6">
          <h2 className="text-fg-secondary font-semibold">{t("jules_form_title")}</h2>

          {/* Presets */}
          <div>
            <p className="text-fg-disabled mb-2 text-xs">{t("jules_quick_presets")}</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TASKS.map((task) => (
                <button
                  key={task.labelKey}
                  type="button"
                  onClick={() => setPrompt(task.value)}
                  className="border-border-strong text-fg-secondary hover:border-brand-500/50 hover:text-brand-300 bg-bg-elevated rounded-md border px-2 py-1 text-xs transition-colors"
                >
                  {t(task.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-fg-disabled mb-1 block text-xs">
                {t("jules_label_prompt")}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("jules_placeholder_prompt")}
                rows={5}
                className="border-border-strong focus:border-brand-500 bg-bg-elevated text-fg-primary w-full resize-none rounded-lg border px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-fg-disabled mb-1 block text-xs">
                  {t("jules_label_repo")}
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="owner/repo"
                  className="border-border-strong focus:border-brand-500 bg-bg-elevated text-fg-primary w-full rounded-lg border px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-fg-disabled mb-1 block text-xs">
                  {t("jules_label_branch")}
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="master"
                  className="border-border-strong focus:border-brand-500 bg-bg-elevated text-fg-primary w-full rounded-lg border px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !connected}
              className="bg-brand-600 hover:bg-brand-500 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? t("jules_btn_submitting") : t("jules_btn_submit")}
            </button>
          </form>

          {result && (
            <div
              className={`rounded-lg p-3 text-sm ${result.success ? "border-success-500/20 bg-success-500/10 text-success-300 border" : "border-danger-500/20 bg-danger-500/10 text-danger-300 border"}`}
            >
              {result.message}
            </div>
          )}
        </div>

        {/* CLI Quick Reference */}
        <div className="border-border-subtle bg-bg-elevated/50 space-y-4 rounded-xl border p-6">
          <h2 className="text-fg-secondary font-semibold">{t("jules_cli_reference_title")}</h2>
          <div className="space-y-3 font-mono text-xs">
            {[
              { descKey: "jules_cli_list_sessions", cmd: "jules remote list --session" },
              {
                descKey: "jules_cli_assign_task",
                cmd: `jules new --repo ${defaultRepo} "your task"`,
              },
              { descKey: "jules_cli_pull_result", cmd: "jules remote pull --session <id> --apply" },
              {
                descKey: "jules_cli_parallel_tasks",
                cmd: `jules new --repo ${defaultRepo} --parallel 3 "task"`,
              },
              { descKey: "jules_cli_teleport", cmd: "jules teleport <sessionId>" },
              { descKey: "jules_cli_interactive_tui", cmd: "jules" },
            ].map(({ descKey, cmd }) => (
              <div key={descKey} className="bg-bg-elevated rounded-lg p-3">
                <p className="text-fg-disabled mb-1"># {t(descKey)}</p>
                <p className="text-success-400 break-all">{cmd}</p>
              </div>
            ))}
          </div>
          <a
            href="https://jules.google.com/session/6852615041969763758"
            target="_blank"
            rel="noopener noreferrer"
            className="border-brand-500/30 text-brand-400 hover:bg-brand-500/10 block rounded-lg border py-2 text-center text-sm transition-colors"
          >
            {t("jules_open_web_ui")}
          </a>
        </div>
      </div>

      {/* Sessions List */}
      <div className="border-border-subtle bg-bg-elevated/50 rounded-xl border p-6">
        <h2 className="text-fg-secondary mb-4 font-semibold">
          {t("jules_sessions_title", { count: localSessions.length })}
        </h2>
        {localSessions.length === 0 ? (
          <div className="text-fg-disabled py-12 text-center">
            <p className="mb-3 text-4xl">🤖</p>
            <p>{t("jules_empty_sessions")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localSessions.map((session) => (
              <div
                key={session.sessionId}
                className="border-border-strong/50 bg-bg-elevated/40 flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:border-zinc-600"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-fg-secondary line-clamp-2 text-sm">{session.prompt}</p>
                  <p className="text-fg-disabled mt-1 font-mono text-xs">
                    {session.sessionId} • {new Date(session.createTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${STATE_COLORS[session.state] ?? "text-fg-muted bg-zinc-700"}`}
                  >
                    {session.state}
                  </span>
                  <a
                    href={`https://jules.google.com/session/${session.sessionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 text-xs underline"
                  >
                    {t("jules_view_session")}
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

