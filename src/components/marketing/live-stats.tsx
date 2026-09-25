"use client";

import * as React from "react";
import { motion, animate, useInView } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "@/components/ui/layout";
import { AlertCircle, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  enableLiveTicker?: boolean;
}

function AnimatedNumber({ value, enableLiveTicker = true }: CounterProps) {
  const locale = useLocale();
  const [count, setCount] = React.useState(value);
  const [isPulsing, setIsPulsing] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const hasFinishedInitialAnim = React.useRef(false);

  React.useEffect(() => {
    if (value === 0 || !isInView) return;

    const controls = animate(0, value, {
      duration: 2,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (latest) => {
        setCount(Math.round(latest));
      },
      onComplete: () => {
        hasFinishedInitialAnim.current = true;
      },
    });

    return () => controls.stop();
  }, [value, isInView]);

  // Live Auto-Increment Ticker (Telemetry Streaming Simulation)
  React.useEffect(() => {
    if (value === 0 || !enableLiveTicker || !isInView) return;

    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const randomDelay = Math.floor(Math.random() * 6000) + 4000;
      timeoutId = setTimeout(() => {
        if (hasFinishedInitialAnim.current) {
          setCount((prev) => prev + 1);
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 800);
        }
        tick();
      }, randomDelay);
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, [value, enableLiveTicker, isInView]);

  return (
    <motion.span
      ref={ref}
      animate={
        isPulsing
          ? { scale: [1, 1.15, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }
          : { scale: 1, filter: "brightness(1)" }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={cn(
        "inline-block transition-colors duration-300",
        isPulsing && "text-danger-300 drop-shadow-[0_0_15px_rgba(230,57,70,0.9)]",
        value === 0 &&
          "from-fg-muted/30 to-fg-muted/30 animate-shimmer min-w-[2ch] bg-gradient-to-r via-white/50 bg-[length:200%_100%] bg-clip-text text-transparent",
      )}
    >
      {count.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
    </motion.span>
  );
}

interface LiveStatsProps {
  totalIncidents: number;
  totalProviders: number;
  totalCountries: number;
  countsBySource?: {
    user_submitted: number;
    aiaaic_import: number;
    aiid_import: number;
    news_curated: number;
    court_record: number;
  };
}

export function LiveStats({
  totalIncidents,
  totalProviders,
  totalCountries,
  countsBySource,
}: LiveStatsProps) {
  const t = useTranslations("hero");
  const tIncident = useTranslations("incident");

  const incidentTooltip = countsBySource
    ? `${tIncident("source_user_submitted")}: ${countsBySource.user_submitted}\n` +
      `${tIncident("source_aiaaic_import")}: ${countsBySource.aiaaic_import}\n` +
      `${tIncident("source_aiid_import")}: ${countsBySource.aiid_import}\n` +
      `${tIncident("source_news_curated")}: ${countsBySource.news_curated}\n` +
      `${tIncident("source_court_record")}: ${countsBySource.court_record}`
    : undefined;

  const statItems = [
    {
      label: t("stats_incidents"),
      value: totalIncidents,
      icon: AlertCircle,
      accent: "text-danger-400",
      bgHover: "hover:bg-danger-500/10",
      borderHover: "hover:border-danger-500/30",
      glowColor: "rgba(230,57,70,0.15)",
      shadowHover:
        "hover:shadow-[0_20px_40px_rgba(230,57,70,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
      tooltip: incidentTooltip,
    },
    {
      label: t("stats_providers"),
      value: totalProviders,
      icon: Cpu,
      accent: "text-warning-400",
      bgHover: "hover:bg-warning-500/10",
      borderHover: "hover:border-warning-500/30",
      glowColor: "rgba(245,158,11,0.15)",
      shadowHover:
        "hover:shadow-[0_20px_40px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
      tooltip: undefined,
    },
    {
      label: t("stats_countries"),
      value: totalCountries,
      icon: Globe,
      accent: "text-brand-400",
      bgHover: "hover:bg-brand-500/10",
      borderHover: "hover:border-brand-500/30",
      glowColor: "rgba(168,85,247,0.15)",
      shadowHover:
        "hover:shadow-[0_20px_40px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]",
      tooltip: undefined,
    },
  ];

  return (
    <div className="border-border-subtle/50 bg-bg-deep relative z-20 overflow-hidden border-y py-12">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="bg-brand-500/10 absolute top-1/2 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
        <div className="bg-danger-500/10 absolute top-1/2 right-1/4 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={cn(
                  "group border-border-subtle relative overflow-hidden rounded-3xl border bg-bg-secondary/70 p-8 backdrop-blur-2xl transition-all duration-500",
                  "shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
                  item.bgHover,
                  item.borderHover,
                  item.shadowHover,
                  item.tooltip && "cursor-help",
                  "dark:shadow-inner dark:shadow-white/5 dark:ring-1 dark:ring-white/5"
                )}
                title={item.tooltip}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex items-center gap-5">
                  <div
                    className={cn(
                      "border-border-subtle flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-black/5 dark:bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:scale-110",
                      item.accent,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-4xl leading-none font-black tracking-tighter drop-shadow-md",
                        item.accent,
                      )}
                    >
                      <AnimatedNumber value={item.value} enableLiveTicker={idx === 0} />
                    </div>
                    <div className="text-fg-secondary mt-1.5 text-xs font-black tracking-[0.2em] uppercase">
                      {item.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
