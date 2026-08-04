"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Newspaper, Scale, Shield, Building2, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function SegmentRouting() {
  const t = useTranslations("segments");

  const segments = [
    {
      id: "journalist",
      href: "/dashboard/journalist",
      icon: Newspaper,
      title: t("journalist.title"),
      desc: t("journalist.desc"),
      cta: t("journalist.cta"),
      color: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
      hoverBorder: "group-hover:border-blue-500/50",
    },
    {
      id: "legal",
      href: "/dashboard/legal",
      icon: Scale,
      title: t("legal.title"),
      desc: t("legal.desc"),
      cta: t("legal.cta"),
      color: "from-amber-500/20 to-amber-600/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      hoverBorder: "group-hover:border-amber-500/50",
    },
    {
      id: "safety",
      href: "/dashboard/safety",
      icon: Shield,
      title: t("safety.title"),
      desc: t("safety.desc"),
      cta: t("safety.cta"),
      color: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
      hoverBorder: "group-hover:border-emerald-500/50",
    },
    {
      id: "compliance",
      href: "/dashboard/compliance",
      icon: Building2,
      title: t("compliance.title"),
      desc: t("compliance.desc"),
      cta: t("compliance.cta"),
      color: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20",
      hoverBorder: "group-hover:border-purple-500/50",
    },
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="from-background via-background/90 to-background absolute inset-0 z-0 bg-linear-to-b" />
      <div className="relative z-10 container mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {t("subtitle") || "Choose your segment to access tailored insights and tools."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {segments.map((segment) => (
            <Link
              key={segment.id}
              href={segment.href}
              onClick={() => trackEvent("segment_cta_click", { segment: segment.id })}
              className={`group relative flex flex-col rounded-2xl border p-6 ${segment.borderColor} ${segment.hoverBorder} bg-background/50 overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${segment.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative z-10 flex h-full flex-col">
                <div
                  className={`bg-background/80 mb-6 w-fit rounded-xl border p-3 shadow-sm ${segment.borderColor}`}
                >
                  <segment.icon className={`h-6 w-6 ${segment.iconColor}`} />
                </div>

                <h3 className="mb-2 text-xl font-semibold">{segment.title}</h3>
                <p className="text-muted-foreground mb-8 flex-grow text-sm">{segment.desc}</p>

                <div
                  className={`flex items-center text-sm font-medium ${segment.iconColor} mt-auto`}
                >
                  {segment.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
