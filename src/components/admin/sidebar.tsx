"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Cpu,
  Gauge,
  Globe,
  Grid2X2,
  Radio,
  Server,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Settings,
  LayoutDashboard,
  Import,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Compass,
  Building2,
  Mail,
  Crown,
  Video,
  FileText,
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
      href: "/admin/ai-hub",
      label: "AI Hub",
      icon: Cpu,
      active: pathname.startsWith("/admin/ai-hub"),
    },
    {
      href: "/admin/analytics-hub",
      label: "Analytics Hub",
      icon: BrainCircuit,
      active: pathname.startsWith("/admin/analytics-hub"),
    },
    {
      href: "/admin/metrics-hub",
      label: "Metrics Hub",
      icon: Gauge,
      active: pathname.startsWith("/admin/metrics-hub"),
    },
    {
      href: "/admin/vendor-portal",
      label: t("nav_vendor_portal") || "Vendor Portal",
      icon: Server,
      active: pathname.startsWith("/admin/vendor-portal"),
    },
    {
      href: "/admin/cross-audit-dashboard",
      label: t("nav_cross_audit_dashboard"),
      icon: BarChart3,
      active: pathname.startsWith("/admin/cross-audit-dashboard"),
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
      href: "/admin/strategy",
      label: t("strategy_overview"),
      icon: Target,
      active: pathname.startsWith("/admin/strategy"),
    },
  ];

  const governanceItems = [
    {
      href: "/admin/users",
      label: t("governance_hub") || "Governance Hub",
      icon: Building2,
      active:
        pathname.startsWith("/admin/users") ||
        pathname.startsWith("/admin/dsar") ||
        pathname.startsWith("/admin/audit") ||
        pathname.startsWith("/admin/redaction-queue") ||
        pathname.startsWith("/admin/advisory-board"),
    },
    {
      href: "/admin/legal-tracker",
      label: t("nav_legal_tracker") || "Legal Tracker",
      icon: ShieldAlert,
      active: pathname.startsWith("/admin/legal-tracker"),
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
      href: "/admin/seo-performance",
      label: t("nav_seo") || "SEO & Performance",
      icon: Activity,
      active: pathname.startsWith("/admin/seo-performance"),
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
      label: "System Hub",
      icon: Activity,
      active:
        pathname.startsWith("/admin/health") ||
        pathname.startsWith("/admin/startup-health") ||
        pathname.startsWith("/admin/crons") ||
        pathname.startsWith("/admin/api-management") ||
        pathname.startsWith("/admin/integrations") ||
        pathname.startsWith("/admin/api-keys") ||
        pathname.startsWith("/admin/finance") ||
        pathname.startsWith("/admin/billing") ||
        pathname.startsWith("/admin/resources") ||
        pathname.startsWith("/admin/settings") ||
        pathname.startsWith("/admin/feature-flags") ||
        pathname.startsWith("/admin/providers"),
    },
    {
      href: "/api-docs",
      label: t("nav_publicApiDocs"),
      icon: BookOpen,
      active: pathname.startsWith("/api-docs"),
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
    {
      href: "/admin/advisor",
      label: t("nav_gazi") || "GAZİ (Advisor)",
      icon: Sparkles,
      active: pathname.startsWith("/admin/advisor"),
    },
  ];

  const founderItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin" || pathname === "/en/admin",
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
        <div className="border-border-subtle/50 mt-4 flex flex-col items-center space-y-2 border-b px-2 pb-4 last:border-0 last:pb-0">
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
                    className="bg-brand-500/20 border-brand-500 pointer-events-none absolute inset-0 rounded-xl border-l-2 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]"
                    transition={{ type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 }}
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
      <div className="border-border-subtle/50 mt-4 border-b pb-4 last:border-0 last:pb-0">
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
                      className="bg-brand-500/20 border-brand-500 pointer-events-none absolute inset-0 rounded-xl border-l-2 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]"
                      transition={{
                        type: "spring" as const,
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8,
                      }}
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
      <header className="bg-bg-secondary/40 border-border-subtle/50 fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl sm:px-6 lg:hidden">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-label={tNav("open_menu")}
            className="text-fg-secondary hover:text-fg-primary shrink-0 rounded-xl p-2 transition hover:bg-white/5"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/admin" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Wordmark className="truncate text-lg sm:text-xl" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="h-8" />
          <div className="border-brand-500/20 relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-[0_0_8px_rgba(168,85,247,0.15)]">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName || "User Avatar"}
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
          "bg-bg-secondary/40 dark:bg-bg-tertiary/30 border-border-subtle fixed inset-y-0 left-0 z-50 flex flex-col border-r shadow-[4px_0_24px_rgba(0,0,0,0.5),_inset_0_1px_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/5 backdrop-blur-2xl backdrop-contrast-125 backdrop-saturate-150 transition-all duration-300 ease-in-out",
          isOpen
            ? "w-72 max-w-[calc(100vw-3rem)] translate-x-0"
            : "w-72 max-w-[calc(100vw-3rem)] -translate-x-full",
          "lg:static lg:flex lg:h-screen lg:max-w-none lg:translate-x-0 lg:shadow-none",
          isCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="border-border-subtle/50 flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
          <Link
            href="/admin"
            className="group flex min-w-0 items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            {isCollapsed ? (
              <Logo size="sm" />
            ) : (
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="border-brand-500/30 bg-brand-500/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-[0_0_15px_rgba(168,85,247,0.25)] transition duration-300 group-hover:scale-105">
                  <Logo size="sm" />
                </div>
                <span className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
                  <span className="to-brand-100 bg-gradient-to-r from-white via-slate-100 bg-clip-text text-transparent">
                    ALPAR
                  </span>
                  <span className="from-accent-300 to-accent-500 bg-gradient-to-r bg-clip-text text-transparent">
                    AI
                  </span>
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label={tNav("close_menu")}
            className="text-fg-muted shrink-0 rounded-xl p-1.5 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={toggleCollapse}
            aria-label={t("toggle_sidebar_ctrl_b")}
            className="text-fg-muted hidden shrink-0 rounded-xl p-1.5 transition hover:bg-white/5 hover:text-white lg:block"
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
          className="scrollbar-hide min-h-0 flex-1 overflow-y-auto py-4"
        >
          {showSystem && renderNavGroup("founder", "Founder Command", Crown, founderItems)}

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
        <div className="border-border-subtle bg-bg-secondary/80 shrink-0 border-t p-4 pb-6 backdrop-blur-md">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="border-brand-500/20 group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName || "User Avatar"}
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
                  aria-label={tAuth("signOut") ?? "Sign Out"}
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
            <div className="min-w-0 space-y-4 overflow-hidden">
              <div className="flex min-w-0 items-center gap-3">
                <div className="border-brand-500/20 relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName || "User Avatar"}
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

              <div className="flex min-w-0 items-center justify-between gap-2">
                <Link
                  href="/"
                  className="text-fg-muted hover:bg-bg-tertiary/60 hover:text-fg-primary flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{tNav("home")}</span>
                </Link>
                <LanguageSwitcher className="h-7 shrink-0 text-xs" />
                <form action="/api/auth/signout" method="post" className="shrink-0">
                  <button
                    type="submit"
                    aria-label={tAuth("signOut") ?? "Sign Out"}
                    className="text-danger-400 hover:bg-danger-500/10 flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition"
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
