"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShieldAlert,
  Import,
  BarChart3,
  BrainCircuit,
  Cpu,
  Sparkles,
  Globe,
  Users,
  Lock,
  BookOpen,
  FileText,
  Award,
  Share2,
  TrendingUp,
  Radio,
  Activity,
  DollarSign,
  Server,
  Plug,
  CreditCard,
  Mail,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Settings,
  Shield,
  Compass,
  Target,
  Grid2X2,
  Map,
  AlertTriangle,
  ClipboardList,
  Building2,
  Calculator,
  Zap,
  Gauge,
  Newspaper,
  Clock,
  Eraser,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import { Wordmark } from "../layout/wordmark";
import { LanguageSwitcher } from "../layout/language-switcher";
import { Logo } from "../layout/logo";

interface SidebarUserShape {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "user" | "moderator" | "admin" | "ceo" | "advisor" | "instructor";
}

export function AdminSidebar({ user }: { user: SidebarUserShape }) {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-sidebar-collapsed") === "true";
    }
    return false;
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("admin-sidebar-expanded-groups");
        if (saved) return JSON.parse(saved);
      } catch (_e) {
        // Fallback to default
      }
    }
    return {
      overview: true,
      operations: true,
      intelligence: true,
      strategy: true,
      governance: true,
      growth: true,
      system: true,
    };
  });

  // Preserve & Restore nav scroll position on pathname change
  useEffect(() => {
    if (typeof window !== "undefined" && navRef.current) {
      const savedScroll = sessionStorage.getItem("admin-sidebar-scroll");
      if (savedScroll) {
        navRef.current.scrollTop = Number(savedScroll);
      }
    }
  }, [pathname]);

  const handleNavScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem("admin-sidebar-scroll", String(navRef.current.scrollTop));
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [group]: !prev[group] };
      if (typeof window !== "undefined") {
        localStorage.setItem("admin-sidebar-expanded-groups", JSON.stringify(next));
      }
      return next;
    });
  };

  const overviewItems = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, active: pathname === "/admin" },
  ];

  const operationsItems = [
    {
      href: "/admin/moderation",
      label: t("moderation_queue"),
      icon: ShieldAlert,
      active: pathname.startsWith("/admin/moderation"),
    },
    {
      href: "/admin/ecosystem",
      label: t("nav_ecosystem"),
      icon: Import,
      active: pathname.startsWith("/admin/ecosystem"),
    },
    {
      href: "/admin/import",
      label: t("nav_import"),
      icon: Import,
      active: pathname.startsWith("/admin/import"),
    },
    {
      href: "/admin/takedown",
      label: t("nav_takedown") || "Takedowns",
      icon: ShieldAlert,
      active: pathname.startsWith("/admin/takedown"),
    },
  ];

  const intelligenceItems = [
    {
      href: "/admin/k-benchmark",
      label: t("nav_kBenchmark"),
      icon: BarChart3,
      active: pathname.startsWith("/admin/k-benchmark"),
    },
    {
      href: "/admin/cross-audit-dashboard",
      label: t("nav_cross_audit_dashboard"),
      icon: BarChart3,
      active: pathname.startsWith("/admin/cross-audit-dashboard"),
    },
    {
      href: "/admin/analysis",
      label: t("nav_audit_analysis"),
      icon: BrainCircuit,
      active: pathname.startsWith("/admin/analysis"),
    },
    {
      href: "/admin/signals",
      label: t("nav_signals"),
      icon: Radio,
      active: pathname.startsWith("/admin/signals"),
    },
    {
      href: "/admin/slo-dashboard",
      label: t("nav_slo_dashboard"),
      icon: Gauge,
      active: pathname.startsWith("/admin/slo-dashboard"),
    },
    {
      href: "/admin/api-metrics",
      label: t("nav_api_metrics"),
      icon: Zap,
      active: pathname.startsWith("/admin/api-metrics"),
    },
    {
      href: "/admin/ai-pulse",
      label: t("nav_ai_pulse"),
      icon: Newspaper,
      active: pathname.startsWith("/admin/ai-pulse"),
    },
    {
      href: "/admin/autopilot",
      label: t("autopilot"),
      icon: Cpu,
      active: pathname === "/admin/autopilot",
    },
    {
      href: "/admin/autopilot/analytics",
      label: t("nav_autopilot_analytics") || t("autopilot_analytics") || "Autopilot Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/admin/autopilot/analytics"),
    },
    {
      href: "/admin/ai-orchestrator",
      label: t("nav_ai_orchestrator") || "AI Orchestrator",
      icon: BrainCircuit,
      active: pathname.startsWith("/admin/ai-orchestrator"),
    },
    {
      href: "/admin/jules",
      label: t("nav_jules") || "Google Jules",
      icon: Cpu,
      active: pathname.startsWith("/admin/jules"),
    },
    {
      href: "/admin/expert-analysis",
      label: t("nav_expert_analysis") || t("nav__expert_analysis") || "Expert Analysis",
      icon: Sparkles,
      active: pathname.startsWith("/admin/expert-analysis"),
    },
    {
      href: "/admin/dual-channel-scoring",
      label: t("nav_dual_channel") || "Dual Channel",
      icon: Activity,
      active: pathname.startsWith("/admin/dual-channel-scoring"),
    },
    {
      href: "/admin/innovations",
      label: t("innovations"),
      icon: Sparkles,
      active: pathname.startsWith("/admin/innovations"),
    },
    {
      href: "/admin/geo",
      label: t("nav_geo"),
      icon: Globe,
      active: pathname.startsWith("/admin/geo"),
    },
  ];

  const strategyItems = [
    {
      href: "/admin/master-plan",
      label: t("nav_masterPlan"),
      icon: FileText,
      active: pathname.startsWith("/admin/master-plan"),
    },
    {
      href: "/admin/strategy",
      label: t("strategy_overview"),
      icon: Target,
      active: pathname === "/admin/strategy",
    },
    {
      href: "/admin/strategy/swot",
      label: t("strategy_swot"),
      icon: Grid2X2,
      active: pathname.startsWith("/admin/strategy/swot"),
    },
    {
      href: "/admin/strategy/roadmap",
      label: t("strategy_roadmap"),
      icon: Map,
      active: pathname.startsWith("/admin/strategy/roadmap"),
    },
    {
      href: "/admin/strategy/risks",
      label: t("strategy_risks"),
      icon: AlertTriangle,
      active: pathname.startsWith("/admin/strategy/risks"),
    },
    {
      href: "/admin/strategy/questionnaire",
      label: t("questionnaire_title"),
      icon: ClipboardList,
      active: pathname.startsWith("/admin/strategy/questionnaire"),
    },
    {
      href: "/admin/strategy/state-support",
      label: t("strategy_state_support"),
      icon: Building2,
      active: pathname.startsWith("/admin/strategy/state-support"),
    },
    {
      href: "/admin/strategy/valuation",
      label: t("strategy_valuation"),
      icon: Calculator,
      active: pathname.startsWith("/admin/strategy/valuation"),
    },
  ];

  const governanceItems = [
    {
      href: "/admin/users",
      label: t("users"),
      icon: Users,
      active: pathname.startsWith("/admin/users"),
    },
    {
      href: "/admin/dsar",
      label: t("nav_dsar"),
      icon: Lock,
      active: pathname.startsWith("/admin/dsar"),
    },
    {
      href: "/admin/audit",
      label: t("audit_log"),
      icon: FileText,
      active: pathname.startsWith("/admin/audit"),
    },
    {
      href: "/admin/redaction-queue",
      label: t("nav_redaction_queue"),
      icon: Eraser,
      active: pathname.startsWith("/admin/redaction-queue"),
    },
    {
      href: "/admin/advisory-board",
      label: t("nav_advisoryBoard"),
      icon: Award,
      active: pathname.startsWith("/admin/advisory-board"),
    },
  ];

  const growthItems = [
    {
      href: "/admin/outreach",
      label: t("nav_email_outreach"),
      icon: Mail,
      active: pathname.startsWith("/admin/outreach"),
    },
    {
      href: "/admin/linkedin",
      label: t("nav_linkedin"),
      icon: Users,
      active: pathname.startsWith("/admin/linkedin"),
    },
    {
      href: "/admin/grants",
      label: t("nav_grants"),
      icon: Building2,
      active: pathname.startsWith("/admin/grants"),
    },
    {
      href: "/admin/platforms",
      label: t("nav_platforms"),
      icon: Globe,
      active: pathname.startsWith("/admin/platforms"),
    },
    {
      href: "/admin/social",
      label: t("nav_social_posts"),
      icon: Share2,
      active: pathname.startsWith("/admin/social"),
    },
    {
      href: "/admin/marketing",
      label: t("nav_marketing"),
      icon: TrendingUp,
      active: pathname.startsWith("/admin/marketing"),
    },
    {
      href: "/admin/investors",
      label: t("nav_investors"),
      icon: DollarSign,
      active: pathname.startsWith("/admin/investors"),
    },
    {
      href: "/admin/experts",
      label: t("nav_experts"),
      icon: Users,
      active: pathname.startsWith("/admin/experts"),
    },
    {
      href: "/admin/launch-signal",
      label: t("launch_signal_title"),
      icon: Radio,
      active: pathname.startsWith("/admin/launch-signal"),
    },
  ];

  const systemItems = [
    {
      href: "/admin/health",
      label: t("nav_systemHealth"),
      icon: Activity,
      active: pathname.startsWith("/admin/health"),
    },
    {
      href: "/admin/billing",
      label: t("nav_subscriptions"),
      icon: CreditCard,
      active: pathname.startsWith("/admin/billing"),
    },
    {
      href: "/admin/finance",
      label: t("nav_infra_costs"),
      icon: BarChart3,
      active: pathname.startsWith("/admin/finance"),
    },
    {
      href: "/admin/resources",
      label: t("nav_resourceEfficiency"),
      icon: Server,
      active: pathname.startsWith("/admin/resources"),
    },
    {
      href: "/admin/api-management",
      label: t("nav_apiManagement") || "API Hub",
      icon: Zap,
      active: pathname.startsWith("/admin/api-management"),
    },
    {
      href: "/api-docs",
      label: t("nav_publicApiDocs"),
      icon: BookOpen,
      active: pathname.startsWith("/api-docs"),
    },
    {
      href: "/admin/integrations",
      label: t("nav_integrations"),
      icon: Plug,
      active: pathname.startsWith("/admin/integrations"),
    },
    {
      href: "/admin/feature-flags",
      label: t("nav_featureFlags"),
      icon: ToggleRight,
      active: pathname.startsWith("/admin/feature-flags"),
    },
    {
      href: "/admin/crons",
      label: t("nav_crons"),
      icon: Clock,
      active: pathname.startsWith("/admin/crons"),
    },
    {
      href: "/admin/cron-health",
      label: t("nav_cron_health") || "Cron Health",
      icon: Activity,
      active: pathname.startsWith("/admin/cron-health"),
    },
    {
      href: "/admin/startup-health",
      label: t("nav_startup_health") || "Startup Health",
      icon: Activity,
      active: pathname.startsWith("/admin/startup-health"),
    },
    {
      href: "/admin/api-keys",
      label: t("nav_api_keys") || "API Keys",
      icon: Lock,
      active: pathname.startsWith("/admin/api-keys"),
    },
    {
      href: "/admin/providers",
      label: t("nav_ai_providers") || "AI Providers",
      icon: Cpu,
      active: pathname.startsWith("/admin/providers"),
    },
    {
      href: "/admin/settings",
      label: t("nav_settings") || "Settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
    {
      href: "/admin/codebase-hygiene",
      label: t("nav_codebase_hygiene") || "Codebase Hygiene",
      icon: Shield,
      active: pathname.startsWith("/admin/codebase-hygiene"),
    },
    {
      href: "/admin/modular-architecture",
      label: t("nav_modular_arch") || "Modular Arch.",
      icon: Grid2X2,
      active: pathname.startsWith("/admin/modular-architecture"),
    },
  ];

  const showOperations = user.role === "ceo" || user.role === "admin" || user.role === "moderator";
  const showIntelligence = user.role === "ceo" || user.role === "admin";
  const showStrategy = user.role === "ceo" || user.role === "admin";
  const showGovernance = user.role === "ceo" || user.role === "admin";
  const showGrowth = user.role === "ceo" || user.role === "admin" || user.role === "advisor";
  const showSystem = user.role === "ceo" || user.role === "admin";

  const renderNavGroup = (
    id: string,
    title: string,
    GroupIcon: React.ElementType,
    groupItems: Array<{
      href: string;
      label: string;
      icon: React.ElementType;
      active: boolean;
    }>,
  ) => {
    if (groupItems.length === 0) return null;
    const isExpanded = expandedGroups[id];

    if (isCollapsed) {
      return (
        <div className="mt-4 flex flex-col items-center space-y-2 border-b border-white/5 px-2 pb-4 last:border-0 last:pb-0">
          {groupItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  item.active
                    ? "text-brand-300 bg-brand-500/15 border-brand-500/30 border"
                    : "text-fg-secondary hover:text-fg-primary hover:bg-white/5",
                )}
              >
                {item.active && (
                  <motion.div
                    layoutId={`sidebar-active-pill-${id}`}
                    className="bg-brand-500/15 border-brand-500 pointer-events-none absolute inset-0 rounded-xl border-l-2 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]"
                    transition={{ type: "spring" as const, stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5 transition-colors duration-300",
                    item.active
                      ? "text-brand-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]"
                      : "text-fg-muted group-hover:text-fg-primary drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]",
                  )}
                />
                <span className="bg-bg-secondary border-border-subtle pointer-events-none absolute left-14 z-50 hidden rounded-lg border px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-xl group-hover:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mt-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
        <button
          onClick={() => toggleGroup(id)}
          className="group text-fg-secondary hover:text-fg-primary flex w-full items-center justify-between px-4 py-2 transition-colors duration-200"
        >
          <div className="flex items-center gap-2.5">
            <GroupIcon className="text-brand-400 group-hover:text-brand-300 h-4.5 w-4.5 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-colors duration-200" />
            <span className="text-fg-primary text-[10px] font-black tracking-wider uppercase">
              {title}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="text-fg-muted group-hover:text-fg-primary h-3.5 w-3.5 transition-colors duration-200" />
          ) : (
            <ChevronRight className="text-fg-muted group-hover:text-fg-primary h-3.5 w-3.5 transition-colors duration-200" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-1.5 px-2">
            {groupItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                    item.active ? "text-brand-300" : "text-fg-secondary hover:text-fg-primary",
                  )}
                >
                  {item.active && (
                    <motion.div
                      layoutId="admin-sidebar-active-pill"
                      className="bg-brand-500/15 border-brand-500 pointer-events-none absolute inset-0 rounded-xl border-l-2 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]"
                      transition={{ type: "spring" as const, stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative z-10 h-4 w-4 transition-colors duration-300",
                      item.active
                        ? "text-brand-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]"
                        : "text-fg-muted group-hover:text-fg-primary drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]",
                    )}
                  />
                  <span className="relative z-10 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Top Header Bar - Visible only on mobile/tablet */}
      <header className="bg-bg-secondary/40 fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 px-6 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="text-fg-secondary hover:text-fg-primary rounded-xl p-2 transition hover:bg-white/5"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/admin" className="flex items-center gap-3">
            <Wordmark className="text-xl" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher className="h-8" />
          <div className="border-brand-500/20 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border shadow-[0_0_8px_rgba(168,85,247,0.15)]">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-brand-300 text-xs font-bold">
                {getInitials(user.fullName ?? user.email)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "bg-bg-secondary/95 fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 ease-in-out",
          isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full",
          "lg:bg-bg-secondary/40 lg:static lg:flex lg:h-screen lg:translate-x-0 lg:shadow-none",
          isCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-6">
          <Link
            href="/admin"
            className="group flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            {isCollapsed ? (
              <Logo size="sm" />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="border-brand-500/30 bg-brand-500/10 flex h-8 w-8 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(168,85,247,0.25)] transition duration-300 group-hover:scale-105">
                  <Logo size="sm" />
                </div>
                <Wordmark className="text-xl tracking-tight" />
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-fg-muted rounded-xl p-1.5 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={toggleCollapse}
            className="text-fg-muted hidden rounded-xl p-1.5 transition hover:bg-white/5 hover:text-white lg:block"
            title={t("toggle_sidebar_ctrl_b")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          ref={navRef}
          onScroll={handleNavScroll}
          className="scrollbar-hide flex-1 overflow-y-auto py-4"
        >
          <div className="space-y-1">
            {renderNavGroup("overview", t("nav_group_overview"), Activity, overviewItems)}
          </div>
          {showOperations &&
            renderNavGroup("operations", t("nav_group_operations"), Shield, operationsItems)}
          {showIntelligence &&
            renderNavGroup(
              "intelligence",
              t("nav_group_intelligence"),
              BrainCircuit,
              intelligenceItems,
            )}
          {showStrategy &&
            renderNavGroup("strategy", t("nav_group_strategy"), Compass, strategyItems)}
          {showGovernance &&
            renderNavGroup("governance", t("nav_group_governance"), Shield, governanceItems)}
          {showGrowth && renderNavGroup("growth", t("nav_group_growth"), TrendingUp, growthItems)}
          {showSystem && renderNavGroup("system", t("nav_group_system"), Settings, systemItems)}
        </nav>

        {/* User Profile Footer */}
        <div className="border-border-subtle bg-bg-secondary/60 border-t p-4 backdrop-blur-md">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="border-brand-500/20 group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-brand-300 text-xs font-bold">
                    {getInitials(user.fullName ?? user.email)}
                  </span>
                )}
                <span className="bg-bg-secondary border-border-subtle pointer-events-none absolute left-14 z-50 hidden rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap text-white shadow-xl group-hover:block">
                  {user.fullName || user.email} ({user.role})
                </span>
              </div>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-danger-400 hover:bg-danger-500/10 group relative rounded-xl p-2 transition"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="bg-bg-secondary border-border-subtle pointer-events-none absolute left-14 z-50 hidden rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap text-white shadow-xl group-hover:block">
                    {tAuth("signOut") ?? "Sign Out"}
                  </span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="border-brand-500/20 relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-brand-300 text-sm font-bold">
                      {getInitials(user.fullName ?? user.email)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {user.fullName || user.email.split("@")[0]}
                  </p>
                  <p className="text-fg-muted truncate text-xs capitalize">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  className="text-fg-muted hover:bg-bg-tertiary/60 hover:text-fg-primary flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {tNav("home")}
                </Link>
                <LanguageSwitcher className="h-7 text-xs" />
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-danger-400 hover:bg-danger-500/10 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition"
                    title={tAuth("signOut") ?? "Sign Out"}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
