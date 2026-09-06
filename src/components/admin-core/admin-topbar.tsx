"use client";
import { useTranslations } from "next-intl";
import React from "react";
import { usePathname } from "next/navigation";
import { Search, AlertTriangle, Database } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function AdminTopbar() {
  const t = useTranslations("admin.sidebar");

  const pathname = usePathname();

  // Extract breadcrumbs from path
  const segments = pathname?.split("/").filter(Boolean) || [];
  const currentSection = segments[segments.length - 1] || t("overviewBreadcrumb");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] pr-6 pl-14 select-none md:px-6 dark:border-[#30363d] dark:bg-[#161b22]">
      {/* Left: Breadcrumbs & Path */}
      <div className="flex items-center gap-2 font-sans text-xs">
        <span className="font-medium text-[#656d76] dark:text-[#8b949e]">ADMIN-OS</span>
        <span className="text-[#d0d7de] dark:text-[#30363d]">/</span>
        <span className="font-semibold tracking-wider text-[#1f2328] uppercase dark:text-[#f0f6fc]">
          {currentSection.replace(/-/g, " ")}
        </span>
      </div>

      {/* Center: Search Command Bar */}
      <div className="relative hidden w-80 items-center md:flex lg:w-96">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#656d76] dark:text-[#8b949e]" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-md border border-[#d0d7de] bg-[#ffffff] py-1.5 pr-10 pl-9 font-sans text-xs text-[#1f2328] placeholder-[#656d76] transition-all focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc] dark:placeholder-[#8b949e] dark:focus:border-[#58a6ff] dark:focus:ring-[#58a6ff]"
        />
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-[#d0d7de] bg-[#f6f8fa] px-1.5 py-0.5 font-sans text-[9.5px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
          ⌘K
        </span>
      </div>

      {/* Right: Telemetry Indicators, Controls & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Ingestion Velocity */}
        <div className="hidden items-center gap-1.5 rounded-md border border-[#d0d7de] bg-[#ffffff] px-2.5 py-1 font-sans text-[11px] text-[#656d76] lg:flex dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#8b949e]">
          <Database className="h-3 w-3 text-[#0969da] dark:text-[#58a6ff]" />
          <span className="text-[#1f2328] dark:text-[#c9d1d9]">2.908 {t("activeIncidents")}</span>
          <span className="font-semibold text-[#1a7f37] dark:text-[#3fb950]">{t("dailyRate")}</span>
        </div>

        {/* EU AI Act SLA Warning Pill */}
        <div className="flex items-center gap-1.5 rounded-md border border-[#d4a72c] bg-[#fff8c5] px-2.5 py-1 font-sans text-[11px] text-[#9a6700] dark:border-[#bb8009] dark:bg-[#382800] dark:text-[#f0b72f]">
          <AlertTriangle className="h-3 w-3 text-[#9a6700] dark:text-[#f0b72f]" />
          <span>{t("slaCritical")}</span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher className="[&_button]:h-9 [&_button]:rounded-md [&_button]:border-[#d0d7de] [&_button]:bg-[#ffffff] [&_button]:px-2.5 [&_button]:text-[#1f2328] [&_button]:hover:bg-[#f3f4f6] dark:[&_button]:border-[#30363d] dark:[&_button]:bg-[#21262d] dark:[&_button]:text-[#c9d1d9] dark:[&_button]:hover:bg-[#30363d]" />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Security & Operator Profile */}
        <div className="ml-1 flex items-center gap-2.5 border-l border-[#d0d7de] pl-2.5 dark:border-[#30363d]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d0d7de] bg-[#ffffff] font-sans text-xs font-bold text-[#1f2328] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#c9d1d9]">
            OP
          </div>
          <div className="hidden flex-col text-left sm:flex">
            <span className="font-sans text-[11px] leading-tight font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
              Supreme Exec
            </span>
            <span className="font-sans text-[9px] leading-tight text-[#1a7f37] dark:text-[#3fb950]">
              Root Auth
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
