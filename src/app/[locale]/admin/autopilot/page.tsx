import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { Activity, ShieldCheck, Workflow } from "lucide-react";
import { WorkerTickButton } from "@/components/admin/autopilot-tick-button";
import { AutopilotWorkerToggles } from "@/components/admin/autopilot-worker-toggles";

export async function generateMetadata() {
  return { title: "Autopilot" };
}

const formatMs = (ms: number) => `${ms.toFixed(0)} ms`;

const formatTime = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 19).replace("T", " ");
};

export default async function AdminAutopilotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/autopilot`);
  if (user.role !== "admin" && user.role !== "ceo") redirect(`/${locale}`);

  const t = await getTranslations({ locale, namespace: "autopilot" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const result = await getAdminAutopilotSnapshot(100);
  if (!result.ok || !result.snapshot) {
    return (
      <Container className="py-10">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fg-muted">{result.error ?? tCommon("unknown_error")}</p>
          </CardContent>
        </Card>
      </Container>
    );
  }
  const {
    runs,
    stats,
    breakers,
    policies,
    queue,
    workerConfigs,
    globalKillSwitch,
    cronLogs,
    activeEngines,
    dailyTokens,
  } = result.snapshot;

  return (
    <Container className="space-y-8 py-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-fg-primary inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <Activity className="text-brand-400 h-6 w-6" />
            {t("admin_title")}
          </h1>
          <p className="text-fg-muted mt-1 text-sm">{t("admin_subtitle")}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={"/admin"} className="text-fg-muted hover:text-brand-400">
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            {t("dashboard")}
          </Link>
          <span className="text-fg-muted">·</span>
          <Link href={"/admin/moderation"} className="text-fg-muted hover:text-brand-400">
            {t("moderation")}
          </Link>
        </nav>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={t("stats_total")} value={stats.total} />
        <Stat label={t("stats_succeeded")} value={stats.succeeded} accent="ok" />
        <Stat label={t("stats_failed")} value={stats.failed} accent="danger" />
        <Stat label={t("stats_replayed")} value={stats.replayed} />
        <Stat label={t("stats_retried")} value={stats.retried} accent="warn" />
        <Stat label={t("stats_cost")} value={`$${stats.estimatedCostUSD.toFixed(4)}`} accent="ok" />
        <Stat label={t("stats_tokens")} value={stats.totalTokens.toLocaleString()} />
        <Stat label={t("stats_p50")} value={formatMs(stats.p50DurationMs)} />
        <Stat label={t("stats_p95")} value={formatMs(stats.p95DurationMs)} />
        <Stat label={t("stats_avg_latency")} value={formatMs(stats.avgLatencyMs)} />
        <Stat label={t("stats_daily_tokens")} value={dailyTokens.toLocaleString()} />
      </div>

      {/* Workers Management Component */}
      <AutopilotWorkerToggles workerConfigs={workerConfigs} globalKillSwitch={globalKillSwitch} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Workflow className="text-brand-400 h-5 w-5" />
              {t("section_breakers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-border-subtle divide-y">
              {Object.entries(breakers).map(([name, snap]) => (
                <li key={name} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-fg-secondary font-mono">{name}</span>
                  <span className="inline-flex items-center gap-3">
                    <BreakerPill state={snap?.state ?? "closed"} />
                    <span className="text-fg-muted">
                      {t("breaker_failures")}: {snap?.failures ?? 0}
                    </span>
                    {snap?.openedAt ? (
                      <span className="text-fg-muted">
                        {t("breaker_cooldown")}: {formatTime(new Date(snap.openedAt).toISOString())}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("section_policies")}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Autopilot Policies Table</caption>
              <thead className="text-fg-muted">
                <tr>
                  <th className="py-2 font-medium">{t("policy_action")}</th>
                  <th className="py-2 font-medium">{t("policy_on_exhaust")}</th>
                  <th className="py-2 font-medium">{t("policy_attempts")}</th>
                  <th className="py-2 font-medium">{t("policy_budget")}</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.action} className="border-border-subtle border-t">
                    <td className="text-fg-secondary py-2 font-mono">{p.action}</td>
                    <td className="py-2">{p.onExhaust}</td>
                    <td className="py-2">{p.attempts}</td>
                    <td className="py-2">
                      {p.budgetMs} ms · {p.budgetTokens} tok
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Engines Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("engines_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Active Engines Status Table</caption>
                <thead className="text-fg-muted">
                  <tr>
                    <th className="py-2 font-medium">{t("engines_col_name")}</th>
                    <th className="py-2 font-medium">{t("engines_col_type")}</th>
                    <th className="py-2 font-medium">{t("engines_col_status")}</th>
                    <th className="py-2 font-medium">{t("engines_col_heartbeat")}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEngines.map((engine) => (
                    <tr key={engine.id} className="border-border-subtle border-t">
                      <td className="text-fg-secondary py-2 font-mono">{engine.name}</td>
                      <td className="py-2 font-mono text-xs">{engine.type}</td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            engine.status === "healthy"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : engine.status === "degraded"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                                : engine.status === "down"
                                  ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                                  : "text-fg-secondary border-white/10 bg-white/5"
                          }`}
                        >
                          {engine.status}
                        </span>
                      </td>
                      <td className="text-fg-muted py-2 text-xs">
                        {engine.lastHeartbeat ? formatTime(engine.lastHeartbeat) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cron Job Logs Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("cron_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {cronLogs.length === 0 ? (
              <p className="text-fg-muted text-sm">{t("cron_empty")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Cron Job Run Logs Table</caption>
                  <thead className="text-fg-muted">
                    <tr>
                      <th className="py-2 font-medium">{t("cron_col_name")}</th>
                      <th className="py-2 font-medium">{t("cron_col_status")}</th>
                      <th className="py-2 font-medium">{t("cron_col_started")}</th>
                      <th className="py-2 font-medium">{t("cron_col_error")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronLogs.map((log) => (
                      <tr key={log.id} className="border-border-subtle border-t">
                        <td className="text-fg-secondary py-2 font-mono text-xs">
                          {log.cron_name}
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              log.status === "success"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : log.status === "failed"
                                  ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                                  : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="text-fg-muted py-2 text-xs">{formatTime(log.started_at)}</td>
                        <td
                          className="text-fg-muted max-w-[20ch] truncate py-2 text-xs"
                          title={log.error_message || ""}
                        >
                          {log.error_message || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("section_queue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <p className="text-fg-secondary text-sm">
              {queue.available ? t("queue_available") : t("queue_unavailable")} · {t("queue_size")}:{" "}
              {queue.size}
            </p>
            <WorkerTickButton />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("section_runs")}</CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-fg-muted text-sm">{t("empty_runs")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Autopilot Active Runs Table</caption>
                <thead className="text-fg-muted">
                  <tr>
                    <th className="py-2 font-medium">{t("run_id")}</th>
                    <th className="py-2 font-medium">{t("run_action")}</th>
                    <th className="py-2 font-medium">{t("run_status")}</th>
                    <th className="py-2 font-medium">{t("run_attempts")}</th>
                    <th className="py-2 font-medium">{t("run_duration")}</th>
                    <th className="py-2 font-medium">{t("run_updated")}</th>
                    <th className="py-2 font-medium">{t("run_error")}</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-border-subtle border-t">
                      <td className="text-fg-muted py-2 font-mono text-xs">
                        {r.idempotency_key.slice(0, 14)}…
                      </td>
                      <td className="text-fg-secondary py-2 font-mono">{r.action}</td>
                      <td className="py-2">
                        <RunStatusPill status={r.status} />
                      </td>
                      <td className="py-2">{r.attempts}</td>
                      <td className="py-2">{formatMs(r.duration_ms)}</td>
                      <td className="text-fg-muted py-2">{formatTime(r.updated_at)}</td>
                      <td
                        className="text-fg-muted max-w-[24ch] truncate py-2"
                        title={r.last_error ?? ""}
                      >
                        {r.last_error ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "ok" | "warn" | "danger";
}) {
  const colour =
    accent === "ok"
      ? "text-emerald-400"
      : accent === "warn"
        ? "text-amber-500"
        : accent === "danger"
          ? "text-rose-400"
          : "text-fg-primary";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-fg-muted text-xs whitespace-nowrap">{label}</p>
        <p className={`mt-1 truncate text-lg font-bold sm:text-xl ${colour}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function BreakerPill({ state }: { state: "closed" | "open" | "half_open" }) {
  const colour =
    state === "closed"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : state === "half_open"
        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
        : "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colour}`}>{state}</span>
  );
}

function RunStatusPill({ status }: { status: string }) {
  const colour =
    status === "ok" || status === "succeeded"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : status === "replayed"
        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
        : status === "circuit_open" || status === "exhausted"
          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          : status === "budget_exceeded"
            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            : "bg-white/5 text-fg-secondary border border-white/10";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colour}`}>{status}</span>
  );
}
