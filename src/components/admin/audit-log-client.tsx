"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { EmptyStateIllustration } from "./admin-design-kit";
import {
  Activity,
  Search,
  Layers,
  Globe,
  Clock,
  User,
  Shield,
  ShieldAlert,
  Terminal,
  Cpu,
  Key,
  ArrowRight,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MetricWidget } from "@/components/ui/metric-widget";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { useTranslations } from "next-intl";

interface UserProfile {
  email: string;
  full_name: string | null;
  role: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
  ip_hash?: string;
  users?: UserProfile | null;
}

interface AuditLogClientProps {
  initialLogs: AuditLogItem[];
  locale: string;
}

const ACTION_GROUPS = [
  { value: "all", label: "All Actions" },
  { value: "incident", label: "Incident Operations" },
  { value: "user", label: "User Management" },
  { value: "security", label: "Security & Keys" },
  { value: "system", label: "System & Autopilot" },
  { value: "billing", label: "Billing & Subscriptions" },
  { value: "takedown", label: "Takedown Requests" },
];

const ENTITY_TYPES = [
  { value: "all", label: "All Entities" },
  { value: "incident", label: "Incident" },
  { value: "users", label: "User" },
  { value: "api_keys", label: "API Key" },
  { value: "takedown_requests", label: "Takedown Request" },
  { value: "finance", label: "Billing" },
  { value: "system", label: "System" },
];

function AuditDetailPanel({ log, onClose }: { log: AuditLogItem; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-white/5 bg-neutral-950/40 p-4 sm:grid-cols-3">
        <div>
          <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">Action</p>
          <Badge
            variant="danger"
            className="mt-1 font-mono text-[11px] tracking-normal normal-case"
          >
            {log.action}
          </Badge>
        </div>
        <div>
          <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
            Executed By
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white">
              {log.users ? log.users.full_name : "SYSTEM AUTOPILOT"}
            </span>
            {log.users && (
              <Badge variant="brand" className="px-1 py-0 text-[9px]">
                {log.users.role}
              </Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
            Origin IP
          </p>
          <p className="mt-1.5 flex items-center gap-1 font-mono text-xs text-white">
            <Globe className="text-fg-muted h-3 w-3" />
            {log.ip_hash}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-neutral-950/20 p-4">
          <h4 className="text-fg-secondary mb-2 text-xs font-bold tracking-wider uppercase">
            Target Entity
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-fg-muted">Entity Type:</span>
              <span className="font-semibold text-white capitalize">{log.entity_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Entity ID:</span>
              <span className="font-mono text-[11px] text-white">{log.entity_id}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-neutral-950/20 p-4">
          <h4 className="text-fg-secondary mb-2 text-xs font-bold tracking-wider uppercase">
            Meta Details
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-fg-muted">Log UUID:</span>
              <span className="font-mono text-[11px] text-white">{log.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Exact Time:</span>
              <span className="font-mono text-[11px] text-white">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="text-brand-400 h-4 w-4" />
          <h4 className="text-xs font-bold tracking-wider text-white uppercase">
            State Payload Changes
          </h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              Before State
            </span>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-neutral-950 p-4 font-mono text-[11px] text-rose-300">
              {log.before_data ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(log.before_data, null, 2)}
                </pre>
              ) : (
                <span className="text-fg-muted italic">No initial state (Created Entity)</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              After State
            </span>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-neutral-950 p-4 font-mono text-[11px] text-emerald-300">
              {log.after_data ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(log.after_data, null, 2)}</pre>
              ) : (
                <span className="text-fg-muted italic">No final state (Deleted Entity)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-white/5 pt-4">
        <Button onClick={onClose} variant="outline">
          Close Inspector
        </Button>
      </div>
    </div>
  );
}

export function AuditLogClient({ initialLogs, locale }: AuditLogClientProps) {
  const t = useTranslations("admin");
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Statistics calculation
  const totalCount = logs.length;
  const securityCount = logs.filter(
    (l) => l.action.startsWith("security") || l.action.includes("key"),
  ).length;
  const systemCount = logs.filter((l) => !l.users).length;

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.users?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.users?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.ip_hash || "").toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === "all" || log.action.startsWith(filterAction);
    const matchesEntity = filterEntity === "all" || log.entity_type === filterEntity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Action badge color helper
  const getActionBadgeVariant = (action: string) => {
    if (
      action.includes("ban") ||
      action.includes("delete") ||
      action.includes("revoke") ||
      action.includes("override")
    ) {
      return "danger";
    }
    if (action.includes("publish") || action.includes("approve") || action.includes("accept")) {
      return "success";
    }
    if (action.includes("rotate") || action.includes("whitelist") || action.includes("assign")) {
      return "warning";
    }
    if (action.startsWith("security")) {
      return "brand";
    }
    return "default";
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "incident":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "users":
        return <User className="h-4 w-4 text-cyan-400" />;
      case "api_keys":
        return <Key className="h-4 w-4 text-emerald-400" />;
      case "takedown_requests":
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case "finance":
        return <Layers className="h-4 w-4 text-purple-400" />;
      default:
        return <Cpu className="h-4 w-4 text-blue-400" />;
    }
  };

  // Generate chart data from logs (group by day or hour depending on span, simple day grouping for now)
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    const grouped = logs.reduce(
      (acc, log) => {
        const date = new Date(log.created_at);
        const day = format(date, "MMM dd");
        if (!acc[day]) acc[day] = { date: day, count: 0, security: 0 };
        acc[day].count += 1;
        if (log.action.startsWith("security") || log.action.includes("key")) {
          acc[day].security += 1;
        }
        return acc;
      },
      {} as Record<string, { date: string; count: number; security: number }>,
    );

    // Sort by actual date ascending
    return Object.values(grouped).reverse(); // assuming logs are descending originally
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* 360° Observe: Log Volume Chart */}
      <div className="rounded-xl border border-white/5 bg-neutral-950/40 p-6">
        <h3 className="text-fg-primary mb-6 text-sm font-bold tracking-wide">
          Log Volume (Last Activity)
        </h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#0E1622",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#F3F4F6", fontSize: "12px" }}
                  labelStyle={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "4px" }}
                />
                <Bar
                  dataKey="count"
                  name="Total Actions"
                  fill="#00D2FF"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="security"
                  name="Security Events"
                  fill="#00FF88"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyStateIllustration
              title="No Log Data"
              description="There are no audit logs to visualize in the current timeframe."
              icon={Activity}
            />
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricWidget
          icon={Activity}
          label={t("audit_total_actions") || "Total Actions"}
          value={totalCount}
        />
        <MetricWidget
          icon={ShieldAlert}
          label={t("audit_security_logs") || "Security Logs"}
          value={securityCount}
        />
        <MetricWidget
          icon={Cpu}
          label={t("audit_autopilot_runs") || "Autopilot Runs"}
          value={systemCount}
        />
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-950/40 p-4">
          <div className="flex items-center gap-4">
            <Terminal className="text-fg-muted h-5 w-5" strokeWidth={1.5} />
            <div>
              <p className="text-fg-muted text-xs font-medium">Real-time Feed</p>
              <p className="text-fg-primary text-sm font-bold">
                {totalCount > 0 ? t("audit_active") || "Active" : t("audit_no_data") || "No Data"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-fg-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t("audit_search_placeholder") || "Search by action, actor, IP..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-white/5 bg-neutral-950/40 pl-10 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            options={ACTION_GROUPS.map((g) => ({ value: g.value, label: g.label }))}
            value={filterAction}
            onChange={setFilterAction}
          />
          <SegmentedControl
            options={ENTITY_TYPES.map((e) => ({ value: e.value, label: e.label }))}
            value={filterEntity}
            onChange={setFilterEntity}
          />
        </div>
      </div>

      {/* Main Audit Logs Table Card */}
      <Card className="overflow-hidden border-white/10 bg-neutral-900/60 shadow-xl backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-fg-muted border-b border-white/5 bg-neutral-950/20 text-xs font-semibold tracking-wider uppercase">
                  <th className="p-4 pl-6">{t("audit_col_time_id") || "Time / ID"}</th>
                  <th className="p-4">{t("audit_col_actor") || "Actor"}</th>
                  <th className="p-4">{t("audit_col_action") || "Action"}</th>
                  <th className="p-4">{t("audit_col_target") || "Target Entity"}</th>
                  <th className="p-4">{t("audit_col_ip") || "IP Location"}</th>
                  <th className="p-4 pr-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-white/[0.02]"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 font-mono text-xs text-white">
                          <Clock className="text-fg-muted h-3 w-3" />
                          {new Date(log.created_at).toLocaleTimeString(locale, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span className="text-fg-muted mt-0.5 font-mono text-[10px]">
                          {log.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {log.users ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                            <User className="text-fg-secondary h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white">
                              {log.users.full_name || "Unknown Staff"}
                            </span>
                            <span className="text-fg-muted text-[10px]">{log.users.email}</span>
                          </div>
                          <Badge
                            variant={log.users.role === "ceo" ? "danger" : "brand"}
                            className="px-1.5 py-0 text-[9px]"
                          >
                            {log.users.role}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/10">
                            <Cpu className="h-3.5 w-3.5 text-purple-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-purple-300">SYSTEM</span>
                            <span className="text-[10px] text-purple-400/80">Autopilot Guard</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-purple-500/30 bg-purple-500/5 px-1.5 py-0 text-[9px] text-purple-400"
                          >
                            Core
                          </Badge>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={getActionBadgeVariant(log.action)}
                        className="font-mono text-[10px] tracking-normal normal-case"
                      >
                        {log.action}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity_type)}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-white capitalize">
                            {log.entity_type.replace("_", " ")}
                          </span>
                          <span className="text-fg-muted font-mono text-[10px]">
                            {log.entity_id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-fg-muted flex items-center gap-1.5 font-mono text-xs">
                        <Globe className="text-fg-muted h-3.5 w-3.5 shrink-0" />
                        {log.ip_hash}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-[11px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      >
                        Inspect
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-fg-muted p-16 text-center">
                      <Shield className="text-fg-muted/30 mx-auto mb-3 h-8 w-8" />
                      {totalCount === 0
                        ? t("audit_empty_state") ||
                          "No audit logs found. Actions will appear here as they occur."
                        : t("audit_no_match") ||
                          "No matching audit logs found. Try adjusting your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SlideOverPanel
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details"
      >
        {selectedLog && <AuditDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </SlideOverPanel>
    </div>
  );
}
