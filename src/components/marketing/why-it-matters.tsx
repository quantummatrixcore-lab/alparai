"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container, Section } from "@/components/ui/layout";
import { Flame, CheckCircle, ShieldOff, ShieldAlert } from "lucide-react";

const stats = [
  {
    icon: Flame,
    titleKey: "why_stat_1_title",
    descKey: "why_stat_1_desc",
    accentClass: "text-danger-400",
    glowColor: "rgba(230,57,70,0.12)",
    borderClass: "border-danger-500/20 hover:border-danger-500/40",
    bgClass: "from-danger-500/10 to-transparent",
    iconBgClass: "bg-danger-500/10 border-danger-500/20",
    badgeClass: "bg-danger-500/15 text-danger-400 border-danger-500/30",
    displayKey: "why_stat_1_display",
  },
  {
    icon: CheckCircle,
    titleKey: "why_stat_2_title",
    descKey: "why_stat_2_desc",
    accentClass: "text-warning-400",
    glowColor: "rgba(241,196,15,0.10)",
    borderClass: "border-warning-500/20 hover:border-warning-500/40",
    bgClass: "from-warning-500/8 to-transparent",
    iconBgClass: "bg-warning-500/10 border-warning-500/20",
    badgeClass: "bg-warning-500/15 text-warning-400 border-warning-500/30",
    displayKey: "why_stat_2_display",
  },
  {
    icon: ShieldOff,
    titleKey: "why_stat_3_title",
    descKey: "why_stat_3_desc",
    accentClass: "text-brand-400",
    glowColor: "rgba(168,85,247,0.10)",
    borderClass: "border-brand-500/20 hover:border-brand-500/40",
    bgClass: "from-brand-500/8 to-transparent",
    iconBgClass: "bg-brand-500/10 border-brand-500/20",
    badgeClass: "bg-brand-500/15 text-brand-400 border-brand-500/30",
    displayKey: "why_stat_3_display",
  },
  {
    icon: ShieldAlert,
    titleKey: "why_stat_4_title",
    descKey: "why_stat_4_desc",
    accentClass: "text-danger-400",
    glowColor: "rgba(230,57,70,0.10)",
    borderClass: "border-danger-500/20 hover:border-danger-500/40",
    bgClass: "from-danger-500/8 to-transparent",
    iconBgClass: "bg-danger-500/10 border-danger-500/20",
    badgeClass: "bg-danger-500/15 text-danger-400 border-danger-500/30",
    displayKey: "why_stat_4_display",
  },
] as const;

export function WhyItMatters() {
  const t = useTranslations("hero");
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Section className="reveal-on-scroll relative scroll-mt-16 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(230,57,70,0.03),transparent)]"
      />
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-fg-primary text-2xl font-black tracking-tight sm:text-3xl">
            {t("why_title")}
          </h2>
          <p className="text-fg-secondary mt-4 text-lg">{t("why_subtitle")}</p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.titleKey}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative"
              >
                <div
                  className={`bg-bg-primary/80 relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-sm transition-all duration-300 ${stat.borderClass}`}
                  style={{
                    boxShadow: `inset 0 0 40px ${stat.glowColor}, 0 4px 30px rgba(0,0,0,0.3)`,
                  }}
                >
                  {/* Top gradient line */}
                  <div
                    className={`absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r ${stat.bgClass}`}
                  />

                  {/* Icon */}
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${stat.iconBgClass}`}
                  >
                    <Icon className={`h-6 w-6 ${stat.accentClass}`} />
                  </div>

                  {/* Big stat number */}
                  <div
                    className={`mb-3 inline-block rounded-sm border px-3 py-1 text-3xl font-black tracking-tight ${stat.badgeClass}`}
                  >
                    {t(stat.displayKey)}
                  </div>

                  {/* Title */}
                  <h3 className={`mb-2 text-lg font-black ${stat.accentClass}`}>
                    {t(stat.titleKey)}
                  </h3>

                  {/* Desc */}
                  <p className="text-fg-muted text-sm leading-relaxed">{t(stat.descKey)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-12 max-w-3xl text-center"
        >
          <p className="text-fg-secondary mx-auto max-w-2xl border-t border-white/5 pt-6 text-sm leading-relaxed font-semibold md:text-base">
            {t("why_bridging_text")}
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
