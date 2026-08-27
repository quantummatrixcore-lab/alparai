"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { INTEGRATION_SERVICES } from "@/lib/integrations/registry";
import { LOGO_MAP } from "@/lib/integrations/logos";

const PILLARS = [
  {
    id: "devops",
    label: "DevOps & Core",
    categories: ["version-control", "ci-cd", "code-quality", "vault", "auth"],
  },
  { id: "infra", label: "Infrastructure", categories: ["hosting", "database", "cache"] },
  { id: "ai", label: "AI Ecosystem", categories: ["ai-models", "ai-agents"] },
  {
    id: "security",
    label: "Security & Perf",
    categories: ["cdn-security", "error-tracking", "bot-detection", "analytics"],
  },
  { id: "ops", label: "Operations", categories: ["email", "payments", "testing"] },
];

export function EcosystemMap() {
  const t = useTranslations("admin");
  const [activePillar, setActivePillar] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="border-border-subtle/50 bg-bg-secondary mb-12 w-full rounded-2xl border p-8 backdrop-blur-3xl">
      <div className="mb-8 text-center">
        <h2 className="text-fg-secondaryxl bg-gradient-to-br from-white to-white/50 bg-clip-text font-semibold tracking-tight text-transparent">
          {t("ecosystem_map_title")}
        </h2>
        <p className="text-fg-muted mt-2 text-sm">{t("ecosystem_map_subtitle")}</p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-12 lg:flex-row lg:space-y-0 lg:space-x-12">
        {/* CENTER NODE */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="border-border-strong bg-bg-secondary relative z-10 flex h-32 w-32 shrink-0 items-center justify-center rounded-full border shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        >
          <div className="text-center">
            <div className="text-lg font-bold text-white">ALPAR AI</div>
            <div className="text-fg-muted text-[10px] tracking-widest uppercase">
              {t("ecosystem_map_core")}
            </div>
          </div>
        </motion.div>

        {/* PILLARS & BRANCHES */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const isActive = activePillar === pillar.id;

            // Gather all tools for this pillar
            const tools = INTEGRATION_SERVICES.filter((s) =>
              pillar.categories.includes(s.category),
            );

            return (
              <motion.div
                key={pillar.id}
                onMouseEnter={() => setActivePillar(pillar.id)}
                onMouseLeave={() => setActivePillar(null)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                  isActive
                    ? "border-border-strong bg-bg-secondary shadow-lg shadow-white/5"
                    : "border-border-subtle/50 bg-bg-secondary hover:bg-bg-secondary"
                } p-6`}
              >
                <div className="text-fg-primary mb-4 text-sm font-semibold tracking-wider uppercase">
                  {pillar.label}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Top 3 representative icons when closed */}
                  {!isActive && (
                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {tools.slice(0, 4).map((tool) => (
                        <div
                          key={tool.id}
                          className="bg-bg-secondary text-fg-muted flex h-8 w-8 items-center justify-center rounded-lg"
                        >
                          {(() => {
                            const Logo = LOGO_MAP[tool.logo as keyof typeof LOGO_MAP];
                            return Logo ? (
                              <Logo className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-white/20" />
                            );
                          })()}
                        </div>
                      ))}
                      {tools.length > 4 && (
                        <div className="bg-bg-secondary text-fg-muted flex h-8 w-8 items-center justify-center rounded-lg text-[10px]">
                          +{tools.length - 4}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Expanded full list when active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="flex flex-wrap gap-2"
                      >
                        {tools.map((tool) => (
                          <motion.div
                            key={tool.id}
                            variants={itemVariants}
                            className="border-border-subtle/50 bg-bg-secondary hover:bg-bg-secondary flex cursor-default items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors"
                            style={{
                              boxShadow: `inset 0 0 0 1px ${tool.brandColor}20`,
                            }}
                          >
                            <span className="text-white">
                              {(() => {
                                const Logo = LOGO_MAP[tool.logo as keyof typeof LOGO_MAP];
                                return Logo ? (
                                  <Logo className="h-3.5 w-3.5" />
                                ) : (
                                  <div className="h-3 w-3 rounded-full bg-white/20" />
                                );
                              })()}
                            </span>
                            <span className="text-fg-primary text-[11px] font-medium">
                              {tool.name}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
