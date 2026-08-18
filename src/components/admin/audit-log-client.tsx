"use client";

import { useState, useMemo, useEffect } from "react";
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
import { MetricWidget } from "@/components/analytics/metric-widget";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SlideOverPanel } from "@/components/ui/slide-over-panel";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

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
  { value: "all", labelKey: "audit_filter_all_actions" },
  { value: "incident", labelKey: "audit_filter_incident_ops" },
  { value: "user", labelKey: "audit_filter_user_mgmt" },
  { value: "security", labelKey: "audit_filter_security_keys" },
  { value: "system", labelKey: "audit_filter_system_autopilot" },
  { value: "billing", labelKey: "audit_filter_billing_subs" },
  { value: "takedown", labelKey: "audit_filter_takedown_reqs" },
] as const;

const ENTITY_TYPES = [
  { value: "all", labelKey: "audit_filter_all_entities" },
  { value: "incident", labelKey: "audit_filter_entity_incident" },
  { value: "users", labelKey: "audit_filter_entity_user" },
  { value: "api_keys", labelKey: "audit_filter_entity_api_key" },
  { value: "takedown_requests", labelKey: "audit_filter_entity_takedown" },
  { value: "finance", labelKey: "audit_filter_entity_billing" },
  { value: "system", labelKey: "audit_filter_entity_system" },
] as const;

function AuditDetailPanel({ log, onClose }: { log: AuditLogItem; onClose: () => void }) {
  const t = useTranslations("admin");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="bg-bg-secondary/40 grid gap-4 rounded-xl border border-white/5 p-4 shadow-lg backdrop-blur-md sm:grid-cols-3">
        <div>
          <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
            {t("audit_detail_action")}
          </p>
          <Badge
            variant="danger"
            className="mt-1 font-mono text-[11px] tracking-normal normal-case"
          >
            {log.action}
          </Badge>
        </div>
        <div>
          <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
            {t("audit_detail_executed_by")}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white">
              {log.users ? log.users.full_name : t("audit_detail_system_autopilot")}
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
            {t("audit_detail_origin_ip")}
          </p>
          <p className="mt-1.5 flex items-center gap-1 font-mono text-xs text-white">
            <Globe className="text-fg-muted h-3 w-3" />
            {log.ip_hash}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 shadow-lg backdrop-blur-md">
          <h4 className="text-fg-secondary mb-2 text-xs font-bold tracking-wider uppercase">
            {t("audit_detail_target_entity")}
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-fg-muted">{t("audit_detail_entity_type")}</span>
              <span className="font-semibold text-white capitalize">{log.entity_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">{t("audit_detail_entity_id")}</span>
              <span className="font-mono text-[11px] text-white">{log.entity_id}</span>
            </div>
          </div>
        </div>
        <div className="bg-bg-secondary/40 rounded-xl border border-white/5 p-4 shadow-lg backdrop-blur-md">
          <h4 className="text-fg-secondary mb-2 text-xs font-bold tracking-wider uppercase">
            {t("audit_detail_meta_details")}
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-fg-muted">{t("audit_detail_log_uuid")}</span>
              <span className="font-mono text-[11px] text-white">{log.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">{t("audit_detail_exact_time")}</span>
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
            {t("audit_detail_payload_changes")}
          </h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("audit_detail_before_state")}
            </span>
            <div className="text-danger-300 max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-[11px] shadow-inner backdrop-blur-md">
              {log.before_data ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(log.before_data, null, 2)}
                </pre>
              ) : (
                <span className="text-fg-muted italic">{t("audit_detail_no_initial_state")}</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
              {t("audit_detail_after_state")}
            </span>
            <div className="text-success-300 max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-[11px] shadow-inner backdrop-blur-md">
              {log.after_data ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(log.after_data, null, 2)}</pre>
              ) : (
                <span className="text-fg-muted italic">{t("audit_detail_no_final_state")}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-white/5 pt-4">
        <Button onClick={onClose} variant="outline" className="bg-white/5 hover:bg-white/10">
          {t("audit_detail_close")}
        </Button>
      </div>
    </motion.div>
  );
}

export function AuditLogClient({ initialLogs, locale }: AuditLogClientProps) {
  const t = useTranslations("admin");
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        return <AlertTriangle className="text-warning-400 h-4 w-4" />;
      case "users":
        return <User className="text-accent-400 h-4 w-4" />;
      case "api_keys":
        return <Key className="text-success-400 h-4 w-4" />;
      case "takedown_requests":
        return <ShieldAlert className="text-danger-400 h-4 w-4" />;
      case "finance":
        return <Layers className="text-brand-400 h-4 w-4" />;
      default:
        return <Cpu className="text-brand-400 h-4 w-4" />;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  if (!isMounted) {
    return (
      <div className="bg-bg-secondary/40 flex h-96 w-full items-center justify-center rounded-2xl border border-white/5 backdrop-blur-xl">
        <Activity className="text-brand-400 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* 360Â° Observe: Log Volume Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl"
      >
        <div className="bg-brand-500/5 absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl" />
        <h3 className="mb-6 text-sm font-bold tracking-wide text-white">
          {t("audit_chart_title")}
        </h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "rgba(10,10,10,0.9)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#F3F4F6", fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "4px" }}
                />
                <Bar
                  dataKey="count"
                  name={t("audit_chart_total_actions")}
                  fill="url(#colorTotal)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="security"
                  name={t("audit_chart_security_events")}
                  fill="url(#colorSecurity)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyStateIllustration
              title={t("audit_chart_empty_title")}
              description={t("audit_chart_empty_desc")}
              icon={Activity}
            />
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-4">
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
        <div className="bg-bg-secondary/40 group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/5 p-5 shadow-lg backdrop-blur-xl">
          <div className="bg-brand-500/10 group-hover:bg-brand-500/20 absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full blur-xl transition-all" />
          <div className="z-10 flex items-center gap-4">
            <Terminal className="text-brand-400 h-6 w-6" strokeWidth={1.5} />
            <div>
              <p className="text-fg-muted mb-1 text-[10px] font-bold tracking-wider uppercase">
                {t("audit_realtime_feed")}
              </p>
              <p className="text-lg font-bold text-white">
                {totalCount > 0 ? t("audit_active") || "Active" : t("audit_no_data") || "No Data"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="text-fg-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t("audit_search_placeholder") || "Search by action, actor, IP..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-bg-secondary/60 focus:border-brand-500/50 w-full rounded-xl border-white/10 pl-10 text-sm backdrop-blur-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SegmentedControl
            options={ACTION_GROUPS.map((g) => ({ value: g.value, label: t(g.labelKey) }))}
            value={filterAction}
            onChange={setFilterAction}
          />
          <SegmentedControl
            options={ENTITY_TYPES.map((e) => ({ value: e.value, label: t(e.labelKey) }))}
            value={filterEntity}
            onChange={setFilterEntity}
          />
        </div>
      </motion.div>

      {/* Main Audit Logs Table Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-bg-secondary/40 overflow-hidden rounded-2xl border-white/5 shadow-xl backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-fg-muted border-b border-white/5 bg-white/5 text-xs font-semibold tracking-wider uppercase">
                    <th className="p-4 pl-6">{t("audit_col_time_id") || "Time / ID"}</th>
                    <th className="p-4">{t("audit_col_actor") || "Actor"}</th>
                    <th className="p-4">{t("audit_col_action") || "Action"}</th>
                    <th className="p-4">{t("audit_col_target") || "Target Entity"}</th>
                    <th className="p-4">{t("audit_col_ip") || "IP Location"}</th>
                    <th className="p-4 pr-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredLogs.map((log, i) => (
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i % 10) * 0.05 }}
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="group cursor-pointer transition-colors duration-150 hover:bg-white/[0.04]"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex flex-col">
                            <span className="group-hover:text-brand-400 flex items-center gap-1.5 font-mono text-xs text-white transition-colors">
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
                              <div className="group-hover:border-brand-500/30 group-hover:bg-brand-500/10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors">
                                <User className="text-fg-secondary group-hover:text-brand-400 h-3.5 w-3.5 transition-colors" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white">
                                  {log.users.full_name || t("audit_unknown_staff")}
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
                              <div className="border-brand-500/20 bg-brand-500/10 flex h-7 w-7 items-center justify-center rounded-full border">
                                <Cpu className="text-brand-400 h-3.5 w-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-brand-300 text-xs font-semibold">
                                  {t("audit_system_label")}
                                </span>
                                <span className="text-brand-400/80 text-[10px]">
                                  {t("audit_autopilot_guard")}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-brand-500/30 bg-brand-500/5 text-brand-400 px-1.5 py-0 text-[9px]"
                              >
                                {t("audit_core_badge")}
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
                          <span className="text-fg-muted flex items-center gap-1.5 font-mono text-xs transition-colors group-hover:text-white">
                            <Globe className="text-fg-muted group-hover:text-brand-400 h-3.5 w-3.5 shrink-0 transition-colors" />
                            {log.ip_hash}
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-white/10 bg-white/5 px-2.5 text-[11px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-white/10"
                          >
                            {t("audit_inspect_button")}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
      </motion.div>

      <SlideOverPanel
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={t("audit_event_details")}
      >
        {selectedLog && <AuditDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />}
      </SlideOverPanel>
    </motion.div>
  );
}
