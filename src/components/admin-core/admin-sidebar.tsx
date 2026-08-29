"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
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

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openClusters, setOpenClusters] = useState<Record<string, boolean>>({
    "cluster-1": true,
    "cluster-2": true,
    "cluster-3": true,
    "cluster-4": true,
    "cluster-5": true,
  });

  const clusters: NavCluster[] = [
    {
      id: "cluster-1",
      title: "1. HESAP VEREBİLİRLİK & HUKUK",
      shortTitle: "HUKUK",
      items: [
        {
          label: "Genel Komuta Masası",
          href: `/${locale}/admin`,
          icon: LayoutDashboard,
        },
        {
          label: "Olay Masası (Triage)",
          href: `/${locale}/admin/incidents`,
          icon: ShieldAlert,
          badge: "2.763",
          badgeType: "count",
        },
        {
          label: "Çoklu Model Denetimi",
          href: `/${locale}/admin/cross-audit`,
          icon: Scale,
        },
        {
          label: "EU AI Act Uyum Radarı",
          href: `/${locale}/admin/compliance`,
          icon: Gavel,
          badge: "72h SLA",
          badgeType: "alert",
        },
        {
          label: "Küresel Hukuk Takipçisi",
          href: `/${locale}/admin/legal-tracker`,
          icon: Globe,
        },
        {
          label: "Streisand Hukuk Kalkanı",
          href: `/${locale}/admin/transparency`,
          icon: ShieldCheck,
        },
        {
          label: "Red-Team Bounties",
          href: `/${locale}/admin/challenges`,
          icon: Award,
        },
        {
          label: "İçerik Moderasyonu",
          href: `/${locale}/admin/moderation`,
          icon: Filter,
        },
      ],
    },
    {
      id: "cluster-2",
      title: "2. BÜYÜME & İLETİŞİM",
      shortTitle: "BÜYÜME",
      items: [
        {
          label: "Sosyal Medya Stüdyosu",
          href: `/${locale}/admin/social`,
          icon: Share2,
          badge: "8 Kanal",
          badgeType: "default",
        },
        {
          label: "Topluluk İkilemleri (/dilemmas)",
          href: `/${locale}/admin/dilemmas`,
          icon: Vote,
        },
        {
          label: "Kurumsal Mail Hub",
          href: `/${locale}/admin/mail`,
          icon: Mail,
        },
        {
          label: "SEO, CEO & Ziyaretçi",
          href: `/${locale}/admin/seo`,
          icon: Search,
        },
      ],
    },
    {
      id: "cluster-3",
      title: "3. SERMAYE & STRATEJİ",
      shortTitle: "SERMAYE",
      items: [
        {
          label: "Strateji, SWOT & Değerleme",
          href: `/${locale}/admin/strategy`,
          icon: Target,
          badge: "$48M+",
          badgeType: "default",
        },
        {
          label: "VC Yatırımcı CRM",
          href: `/${locale}/admin/investors`,
          icon: Building2,
        },
        {
          label: "Hibe Otopilotu (TÜBİTAK/YC)",
          href: `/${locale}/admin/grants`,
          icon: Landmark,
          badge: "18.7M₺",
          badgeType: "default",
        },
        {
          label: "Stripe Finans Masası",
          href: `/${locale}/admin/finance`,
          icon: CreditCard,
        },
      ],
    },
    {
      id: "cluster-4",
      title: "4. EKOSİSTEM & TEKNOLOJİ",
      shortTitle: "TEKNO",
      items: [
        {
          label: "B2B API & Veri Satışı",
          href: `/${locale}/admin/api-keys`,
          icon: KeyRound,
          badge: "$94k MRR",
          badgeType: "default",
        },
        {
          label: "Veri Kalkanı & Tarayıcılar",
          href: `/${locale}/admin/data-moat`,
          icon: Database,
        },
        {
          label: "AI Sinyal & Kriz Radarı",
          href: `/${locale}/admin/ai-signals`,
          icon: Radio,
        },
        {
          label: "İnovasyon & Ar-Ge Yol Haritası",
          href: `/${locale}/admin/innovations`,
          icon: Sparkles,
        },
        {
          label: "Kod Hijyeni & Mimari",
          href: `/${locale}/admin/system-health`,
          icon: Cpu,
        },
      ],
    },
    {
      id: "cluster-5",
      title: "5. AKADEMİ & YÖNETİŞİM",
      shortTitle: "YÖNETİŞİM",
      items: [
        {
          label: "Kullanıcılar & İhbarcılar",
          href: `/${locale}/admin/users`,
          icon: Users,
        },
        {
          label: "Uzman & Bilirkişi Ağı",
          href: `/${locale}/admin/experts`,
          icon: UserCheck,
        },
        {
          label: "Üniversite Hakem Kurulu",
          href: `/${locale}/admin/academy`,
          icon: GraduationCap,
        },
        {
          label: "Sıfır-Bilgi PII Kasası",
          href: `/${locale}/admin/vault`,
          icon: Lock,
        },
        {
          label: "Sistem & Rol Ayarları",
          href: `/${locale}/admin/settings`,
          icon: Sliders,
        },
      ],
    },
  ];

  // Auto-expand cluster of active item on load
  useEffect(() => {
    clusters.forEach((c) => {
      if (c.items.some((item) => item.href === pathname)) {
        setOpenClusters((prev) => ({ ...prev, [c.id]: true }));
      }
    });
  }, [pathname]);

  const toggleCluster = (id: string) => {
    setOpenClusters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } sticky top-0 z-40 flex h-screen flex-shrink-0 flex-col overscroll-contain border-r border-[#d0d7de] bg-[#f6f8fa] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none dark:border-[#30363d] dark:bg-[#0d1117]`}
    >
      {/* Brand Header */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#d0d7de] bg-[#f6f8fa] px-3.5 dark:border-[#30363d] dark:bg-[#0d1117]">
        {!isCollapsed ? (
          <>
            <Link href={`/${locale}/admin`} className="group flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1f2328] font-mono text-xs font-bold text-[#ffffff] dark:bg-[#f0f6fc] dark:text-[#0d1117]">
                A
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-xs font-bold tracking-wider text-[#1f2328] uppercase dark:text-[#f0f6fc]">
                  ALPAR AI
                </span>
                <span className="truncate font-mono text-[10px] text-[#656d76] dark:text-[#8b949e]">
                  Executive OS v3.5
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="rounded-md p-1 text-[#656d76] transition-colors hover:bg-[#eaeef2] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc]"
              title="Menüyü Daralt"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d0d7de] bg-[#ffffff] text-[#656d76] transition-all hover:bg-[#f6f8fa] hover:text-[#1f2328] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc]"
              title="Menüyü Genişlet"
            >
              <PanelLeft className="h-4 w-4" />
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
                  className={`flex w-full items-center justify-between rounded px-2 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase transition-colors ${
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
                          isCollapsed ? "justify-center px-0 py-2" : "justify-between px-2.5 py-1.5"
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
        className={`flex items-center border-t border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117] ${isCollapsed ? "justify-center" : "justify-between"} shrink-0 font-mono text-[11px] text-[#656d76] dark:text-[#8b949e]`}
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
  );
}
