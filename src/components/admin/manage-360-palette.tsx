"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Search,
  Shield,
  Activity,
  Users,
  Globe,
  ToggleRight,
  FileText,
  Zap,
  RotateCw,
  EyeOff,
  Flame,
  Command,
  CheckCircle,
  XCircle,
  Bell,
  DollarSign,
  Award,
  HardDrive,
  TrendingUp,
} from "lucide-react";
import { triggerExternalFetch } from "@/actions/ecosystem";
import {
  approveIncident,
  rejectIncident,
  toggleFeatureFlag,
  resolveAlarm,
  getPendingIncidents,
} from "@/actions/admin-quick-actions";

interface PendingIncident {
  id: string;
  title: string;
  status: string;
}

export function Manage360CommandPalette() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);
  const [pendingIncidents, setPendingIncidents] = useState<PendingIncident[]>([]);

  const loadPendingIncidents = useCallback(async () => {
    try {
      const items = await getPendingIncidents();
      setPendingIncidents(items);
    } catch {
      setPendingIncidents([]);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) loadPendingIncidents();
  }, [isOpen, loadPendingIncidents]);

  const showStatus = (msg: string, ok = true) => {
    setStatusMsg(msg);
    setStatusOk(ok);
    setTimeout(() => {
      setStatusMsg(null);
      setIsOpen(false);
    }, 2000);
  };

  const handleCrawlerTrigger = async () => {
    setStatusMsg("Triggering AI Scraper & Crawler…");
    const res = await triggerExternalFetch();
    showStatus(res.message, true);
  };

  const handleApprove = async (id: string) => {
    setStatusMsg("Approving incident…");
    const res = await approveIncident(id);
    showStatus(res.message, res.ok);
  };

  const handleReject = async (id: string) => {
    setStatusMsg("Rejecting incident…");
    const res = await rejectIncident(id);
    showStatus(res.message, res.ok);
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    setStatusMsg(`Toggling ${key}…`);
    const res = await toggleFeatureFlag(key, enabled);
    showStatus(res.message, res.ok);
  };

  const handleResolveAlarm = async (id: string) => {
    setStatusMsg("Resolving SLA alarm…");
    const res = await resolveAlarm(id);
    showStatus(res.message, res.ok);
  };

  const staticActions = [
    {
      id: "crawl-trigger",
      title: t("action_trigger_scraper") || "Trigger AI Scraper & Ingestion Cron",
      category: t("group_operations") || "Operations",
      icon: Zap,
      action: handleCrawlerTrigger,
    },
    {
      id: "toggle-maintenance",
      title: t("action_toggle_maintenance") || "Toggle Maintenance Mode Flag",
      category: t("group_operations") || "Operations",
      icon: ToggleRight,
      action: () => handleToggleFlag("maintenance_mode", true),
    },
    {
      id: "toggle-registration",
      title: t("action_toggle_registration") || "Toggle User Registration Flag",
      category: t("group_operations") || "Operations",
      icon: ToggleRight,
      action: () => handleToggleFlag("user_registration_open", false),
    },
    {
      id: "resolve-alarms",
      title: t("action_resolve_alarms") || "Resolve All Open SLA Alarms",
      category: t("group_operations") || "Operations",
      icon: Bell,
      action: () => handleResolveAlarm("all"),
    },
    {
      id: "moderation",
      title: t("moderation_queue") || "Moderation Queue (Approve / Reject)",
      category: t("group_navigate") || "Navigate",
      icon: Shield,
      action: () => {
        router.push("/admin/moderation");
        setIsOpen(false);
      },
    },
    {
      id: "feature-flags",
      title: t("nav_featureFlags") || "Feature Flags & Kill-Switch",
      category: t("group_navigate") || "Navigate",
      icon: ToggleRight,
      action: () => {
        router.push("/admin/feature-flags");
        setIsOpen(false);
      },
    },
    {
      id: "cost-alarm",
      title: "Cost Telemetry & Throttle Controls",
      category: t("group_navigate") || "Navigate",
      icon: DollarSign,
      action: () => {
        router.push("/admin/api-metrics");
        setIsOpen(false);
      },
    },
    {
      id: "redaction",
      title: "Redaction & Provider Privacy Queue",
      category: t("group_navigate") || "Navigate",
      icon: EyeOff,
      action: () => {
        router.push("/admin/redaction-queue");
        setIsOpen(false);
      },
    },
    {
      id: "takedown",
      title: "DSA Art. 14 Legal Takedowns",
      category: t("group_navigate") || "Navigate",
      icon: RotateCw,
      action: () => {
        router.push("/admin/takedown");
        setIsOpen(false);
      },
    },
    {
      id: "geo",
      title: t("nav_geo") || "GEO Engine Telemetry",
      category: t("group_navigate") || "Navigate",
      icon: Globe,
      action: () => {
        router.push("/admin/geo");
        setIsOpen(false);
      },
    },
    {
      id: "health",
      title: t("nav_systemHealth") || "System Health & SLO Alarms",
      category: t("group_navigate") || "Navigate",
      icon: Activity,
      action: () => {
        router.push("/admin/health");
        setIsOpen(false);
      },
    },
    {
      id: "audit",
      title: t("audit_log") || "Audit Log & System Tracing",
      category: t("group_navigate") || "Navigate",
      icon: FileText,
      action: () => {
        router.push("/admin/audit");
        setIsOpen(false);
      },
    },
    {
      id: "users",
      title: t("users") || "Users & Moderator Permissions",
      category: t("group_navigate") || "Navigate",
      icon: Users,
      action: () => {
        router.push("/admin/users");
        setIsOpen(false);
      },
    },
    {
      id: "dora",
      title: "DORA Metrics Dashboard",
      category: t("group_navigate") || "Navigate",
      icon: TrendingUp,
      action: () => {
        router.push("/admin/dora");
        setIsOpen(false);
      },
    },
    {
      id: "capacity",
      title: "Capacity & Infrastructure Monitor",
      category: t("group_navigate") || "Navigate",
      icon: HardDrive,
      action: () => {
        router.push("/admin/health");
        setIsOpen(false);
      },
    },
    {
      id: "kbenchmark",
      title: "K-BENCHMARK Model Ratings",
      category: t("group_navigate") || "Navigate",
      icon: Award,
      action: () => {
        router.push("/admin/k-benchmark");
        setIsOpen(false);
      },
    },
    {
      id: "flame",
      title: "Cost Alarm & Billing Monitor",
      category: t("group_navigate") || "Navigate",
      icon: Flame,
      action: () => {
        router.push("/admin/finance");
        setIsOpen(false);
      },
    },
  ];

  const pendingActions = pendingIncidents.flatMap((inc) => [
    {
      id: `approve-${inc.id}`,
      title: `Approve: ${inc.title.slice(0, 40)}…`,
      category: "Quick-Approve",
      icon: CheckCircle,
      action: () => handleApprove(inc.id),
    },
    {
      id: `reject-${inc.id}`,
      title: `Reject: ${inc.title.slice(0, 40)}…`,
      category: "Quick-Reject",
      icon: XCircle,
      action: () => handleReject(inc.id),
    },
  ]);

  const allActions = [...pendingActions, ...staticActions];

  const filteredActions = allActions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase()),
  );

  const categoryColors: Record<string, string> = {
    "Quick-Approve": "text-emerald-400",
    "Quick-Reject": "text-red-400",
    Operations: "text-sky-400",
    Navigate: "text-zinc-400",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open 360 Command Palette"
        className="border-brand-500/40 text-brand-300 fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border bg-zinc-900/90 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105 sm:hidden"
      >
        <Command className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-16 backdrop-blur-md">
          <div className="mx-4 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl">
            <div className="flex items-center border-b border-white/10 px-4 py-3.5">
              <Search className="h-5 w-5 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("360_command_palette_search_actions_cmd_k")}
                className="ml-3 flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                autoFocus
              />
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {t("esc")}
              </kbd>
            </div>

            {statusMsg && (
              <div
                className={`border-b px-4 py-2 text-center text-xs font-bold ${
                  statusOk
                    ? "border-brand-500/30 bg-brand-500/10 text-brand-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {statusMsg}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  {t("no_matching_360_actions_found")}
                </div>
              ) : (
                filteredActions.map((action) => {
                  const Icon = action.icon;
                  const catColor = categoryColors[action.category] ?? "text-zinc-400";
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="hover:bg-brand-500/15 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm text-zinc-200 transition-colors hover:text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-4 w-4 ${catColor}`} />
                        <span className="font-medium">{action.title}</span>
                      </div>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                        {action.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 bg-zinc-950/80 px-4 py-2.5 text-[11px] text-zinc-500">
              <span>
                {t("alpar_ai_360_manage_surface")}
                {allActions.length} {t("actions")}
              </span>
              <span className="font-mono text-zinc-400">{t("cmd_k_ctrl_k")}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
