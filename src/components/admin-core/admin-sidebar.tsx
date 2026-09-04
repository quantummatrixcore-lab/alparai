"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";
import {
  LayoutDashboard,
  ShieldAlert,
  Scale,
  Gavel,
  ShieldCheck,
  Award,
  Share2,
  Mail,
  Search,
  Building2,
  Landmark,
  CreditCard,
  KeyRound,
  Database,
  Radio,
  GraduationCap,
  Lock,
  Sliders,
  Vote,
  Filter,
  Users,
  Globe,
  UserCheck,
  Target,
  Sparkles,
  Cpu,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeType?: "alert" | "count" | "default";
}

interface NavCluster {
  id: string;
  title: string;
  shortTitle: string;
  items: NavItem[];
}

export const AdminSidebar = memo(function AdminSidebar() {
  const t = useTranslations("admin.sidebar");
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Auto-collapse on mobile initially
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [openClusters, setOpenClusters] = useState<Record<string, boolean>>({
    "cluster-1": true,
    "cluster-2": true,
    "cluster-3": true,
    "cluster-4": true,
    "cluster-5": true,
  });

  const clusters: NavCluster[] = useMemo(
    () => [
      {
        id: "cluster-1",
        title: t("cluster1Title"),
        shortTitle: t("cluster1Short"),
        items: [
          {
            label: t("dashboard"),
            href: `/${locale}/admin`,
            icon: LayoutDashboard,
          },
          {
            label: t("incidents"),
            href: `/${locale}/admin/incidents`,
            icon: ShieldAlert,
            badge: "2.908",
            badgeType: "count",
          },
          {
            label: t("crossAudit"),
            href: `/${locale}/admin/cross-audit`,
            icon: Scale,
          },
          {
            label: t("compliance"),
            href: `/${locale}/admin/compliance`,
            icon: Gavel,
            badge: "72h SLA",
            badgeType: "alert",
          },
          {
            label: t("legalTracker"),
            href: `/${locale}/admin/legal-tracker`,
            icon: Globe,
          },
          {
            label: t("transparency"),
            href: `/${locale}/admin/transparency`,
            icon: ShieldCheck,
          },
          {
            label: t("challenges"),
            href: `/${locale}/admin/challenges`,
            icon: Award,
          },
          {
            label: t("moderation"),
            href: `/${locale}/admin/moderation`,
            icon: Filter,
          },
        ],
      },
      {
        id: "cluster-2",
        title: t("cluster2Title"),
        shortTitle: t("cluster2Short"),
        items: [
          {
            label: t("social"),
            href: `/${locale}/admin/social`,
            icon: Share2,
            badge: "8 Kanal",
            badgeType: "default",
          },
          {
            label: t("dilemmas"),
            href: `/${locale}/admin/dilemmas`,
            icon: Vote,
          },
          {
            label: t("mail"),
            href: `/${locale}/admin/mail`,
            icon: Mail,
          },
          {
            label: t("seo"),
            href: `/${locale}/admin/seo`,
            icon: Search,
          },
        ],
      },
      {
        id: "cluster-3",
        title: t("cluster3Title"),
        shortTitle: t("cluster3Short"),
        items: [
          {
            label: t("strategy"),
            href: `/${locale}/admin/strategy`,
            icon: Target,
            badge: "$48M+",
            badgeType: "default",
          },
          {
            label: t("investors"),
            href: `/${locale}/admin/investors`,
            icon: Building2,
          },
          {
            label: t("grants"),
            href: `/${locale}/admin/grants`,
            icon: Landmark,
            badge: "18.7M₺",
            badgeType: "default",
          },
          {
            label: t("finance"),
            href: `/${locale}/admin/finance`,
            icon: CreditCard,
          },
        ],
      },
      {
        id: "cluster-4",
        title: t("cluster4Title"),
        shortTitle: t("cluster4Short"),
        items: [
          {
            label: t("apiKeys"),
            href: `/${locale}/admin/api-keys`,
            icon: KeyRound,
            badge: "$94k MRR",
            badgeType: "default",
          },
          {
            label: t("dataMoat"),
            href: `/${locale}/admin/data-moat`,
            icon: Database,
          },
          {
            label: t("aiSignals"),
            href: `/${locale}/admin/ai-signals`,
            icon: Radio,
          },
          {
            label: t("innovations"),
            href: `/${locale}/admin/innovations`,
            icon: Sparkles,
          },
          {
            label: t("systemHealth"),
            href: `/${locale}/admin/system-health`,
            icon: Cpu,
          },
        ],
      },
      {
        id: "cluster-5",
        title: t("cluster5Title"),
        shortTitle: t("cluster5Short"),
        items: [
          {
            label: t("users"),
            href: `/${locale}/admin/users`,
            icon: Users,
          },
          {
            label: t("experts"),
            href: `/${locale}/admin/experts`,
            icon: UserCheck,
          },
          {
            label: t("academy"),
            href: `/${locale}/admin/academy`,
            icon: GraduationCap,
          },
          {
            label: t("vault"),
            href: `/${locale}/admin/vault`,
            icon: Lock,
          },
          {
            label: t("settings"),
            href: `/${locale}/admin/settings`,
            icon: Sliders,
          },
        ],
      },
    ],
    [t, locale],
  );

  // Auto-expand cluster of active item on load
  useEffect(() => {
    clusters.forEach((c) => {
      if (c.items.some((item) => item.href === pathname)) {
        setOpenClusters((prev) => ({ ...prev, [c.id]: true }));
      }
    });
  }, [pathname, clusters]);

  const toggleCluster = useCallback((id: string) => {
    setOpenClusters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  return (
    <>
      {/* Mobile Floating Toggle (Visible only when collapsed on mobile) */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-3 left-4 z-50 rounded-md border border-[#d0d7de] bg-[#ffffff] p-1.5 text-[#1f2328] shadow-sm md:hidden dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      <aside
        className={`${
          isCollapsed
            ? "hidden w-[60px] -translate-x-full md:flex md:translate-x-0"
            : "fixed flex w-64 translate-x-0 shadow-2xl md:sticky md:shadow-none"
        } top-0 left-0 z-50 h-screen flex-shrink-0 flex-col overscroll-contain border-r border-[#d0d7de] bg-[#f6f8fa] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none md:z-40 dark:border-[#30363d] dark:bg-[#0d1117]`}
      >
        {/* Brand Header */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#d0d7de] bg-[#f6f8fa] px-3.5 dark:border-[#30363d] dark:bg-[#0d1117]">
          {!isCollapsed ? (
            <>
              <Link href={`/${locale}/admin`} className="group flex min-w-0 items-center gap-2.5">
                <Logo size="sm" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-black tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
                    ALPAR <span className="text-cyan-600 dark:text-cyan-400">AI</span>
                  </span>
                  <span className="truncate font-sans text-[9px] font-semibold tracking-wider text-[#656d76] uppercase dark:text-[#8b949e]">
                    {t("executiveOS")}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="rounded-md p-1 text-[#656d76] transition-colors hover:bg-[#eaeef2] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc]"
                title={t("collapseMenu")}
                aria-label={t("collapseMenu")}
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d0d7de] bg-[#ffffff] p-1 text-[#656d76] transition-all hover:bg-[#f6f8fa] hover:text-[#1f2328] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc]"
                title={t("expandMenu")}
                aria-label={t("expandMenu")}
              >
                <Logo size="sm" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Clusters */}
        <div className="flex-1 scrollbar-thin scrollbar-thumb-zinc-800 space-y-3 overflow-x-hidden overflow-y-auto p-2">
          {clusters.map((cluster) => {
            const isOpen = openClusters[cluster.id] ?? true;
            const hasActiveItem = cluster.items.some((item) => item.href === pathname);

            return (
              <div key={cluster.id} className="space-y-1">
                {/* Cluster Accordion Header */}
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleCluster(cluster.id)}
                    className={`flex w-full items-center justify-between rounded px-2 py-1 font-sans text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                      hasActiveItem
                        ? "bg-[#eaeef2]/60 text-[#1f2328] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                        : "text-[#656d76] hover:bg-[#eaeef2]/40 hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:bg-[#161b22]/40 dark:hover:text-[#f0f6fc]"
                    }`}
                  >
                    <span className="truncate">{cluster.title}</span>
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3 flex-shrink-0 text-[#656d76] dark:text-[#8b949e]" />
                    ) : (
                      <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#656d76] dark:text-[#8b949e]" />
                    )}
                  </button>
                ) : (
                  <div className="mx-1 my-2 h-px bg-[#d0d7de] dark:bg-[#30363d]" />
                )}

                {/* Cluster Items List (Collapsible) */}
                {(!isCollapsed ? isOpen : true) && (
                  <div className="space-y-0.5">
                    {cluster.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={isCollapsed ? item.label : undefined}
                          className={`flex items-center ${
                            isCollapsed
                              ? "justify-center px-0 py-2"
                              : "justify-between px-2.5 py-1.5"
                          } group rounded-md text-xs font-medium transition-all ${
                            isActive
                              ? "border border-[#d0d7de] bg-[#ffffff] font-semibold text-[#0969da] shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#58a6ff] dark:shadow-none"
                              : "border border-transparent text-[#656d76] hover:bg-[#eaeef2] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:bg-[#161b22]/50 dark:hover:text-[#f0f6fc]"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : "min-w-0"}`}
                          >
                            <Icon
                              className={`h-4 w-4 flex-shrink-0 ${
                                isActive
                                  ? "text-[#0969da] dark:text-[#58a6ff]"
                                  : "text-[#656d76] group-hover:text-[#1f2328] dark:text-[#8b949e] dark:group-hover:text-[#f0f6fc]"
                              }`}
                            />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!isCollapsed && item.badge && (
                            <span
                              className={`rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-medium ${
                                item.badgeType === "alert"
                                  ? "border-[#ff8182]/40 bg-[#ffebe9] text-[#cf222e] dark:border-[#ff7b72]/40 dark:bg-[#490202] dark:text-[#ff7b72]"
                                  : item.badgeType === "count"
                                    ? "border-[#d0d7de] bg-[#eaeef2] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]"
                                    : "border-[#d0d7de] bg-[#ffffff] text-[#656d76] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className={`flex items-center border-t border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117] ${isCollapsed ? "justify-center" : "justify-between"} shrink-0 font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]`}
        >
          {!isCollapsed ? (
            <>
              <Link
                href={`/${locale}`}
                target="_blank"
                className="flex items-center gap-1.5 transition-colors hover:text-[#1f2328] dark:hover:text-[#f0f6fc]"
              >
                <span>Canlı Site</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <span className="flex items-center gap-1.5 text-[10.5px] text-[#1a7f37] dark:text-[#3fb950]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1a7f37] opacity-75 dark:bg-[#3fb950]" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1a7f37] dark:bg-[#3fb950]" />
                </span>
                %99.98 SLA
              </span>
            </>
          ) : (
            <span
              className="h-2 w-2 rounded-full bg-[#1a7f37] dark:bg-[#3fb950]"
              title="Sistem Aktif (%99.98 SLA)"
            />
          )}
        </div>
      </aside>
    </>
  );
});
