"use client";

import * as React from "react";
import { motion, animate, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { AlertCircle, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
}

function AnimatedNumber({ value }: CounterProps) {
  const [count, setCount] = React.useState(value);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  React.useEffect(() => {
    if (value === 0 || !isInView) return;

    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setCount(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, isInView]);

  return (
    <span
      ref={ref}
      className={cn(
        value === 0 &&
          "from-fg-muted/50 to-fg-muted/50 animate-shimmer inline-block min-w-[2ch] bg-gradient-to-r via-white/80 bg-[length:200%_100%] bg-clip-text text-transparent",
      )}
    >
      {count.toLocaleString()}
    </span>
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
      accent: "text-danger-400 border-danger-500/20 bg-danger-500/5",
      tooltip: incidentTooltip,
    },
    {
      label: t("stats_providers"),
      value: totalProviders,
      icon: Cpu,
      accent: "text-warning-400 border-warning-500/20 bg-warning-500/5",
      tooltip: undefined,
    },
    {
      label: t("stats_countries"),
      value: totalCountries,
      icon: Globe,
      accent: "text-brand-400 border-brand-500/20 bg-brand-500/5",
      tooltip: undefined,
    },
  ];

  return (
    <div className="bg-bg-secondary/20 border-border-subtle reveal-on-scroll relative scroll-mt-16 overflow-hidden border-y py-8">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-6 backdrop-blur-sm",
                  item.accent,
                  item.tooltip && "cursor-help",
                )}
                title={item.tooltip}
              >
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-fg-primary text-3xl font-black tracking-tight">
                    <AnimatedNumber value={item.value} />
                  </div>
                  <div className="text-fg-secondary mt-1 text-xs font-semibold tracking-wider uppercase">
                    {item.label}
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
