"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretDown,
  CaretRight,
  GitBranch,
  Cloud,
  Database,
  HardDrives,
  ShieldCheck,
  Bug,
  Envelope,
  CreditCard,
  GearSix,
  Flask,
  Code,
  Key,
  ChartBar,
  Pulse,
  Fingerprint,
  LockKey,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type {
  IntegrationService,
  IntegrationStatus,
  IntegrationAlternative,
} from "@/lib/integrations/types";
import { ServiceBlock } from "./service-block";

interface CategoryGroupProps {
  categoryId: string;
  label: string;
  services: IntegrationService[];
  statuses: Map<string, IntegrationStatus>;
  alternatives: Record<string, IntegrationAlternative[]>;
  expandedServices: Set<string>;
  onToggleService: (id: string) => void;
  defaultExpanded?: boolean;
}

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
    className?: string;
  }>
> = {
  "version-control": GitBranch,
  hosting: Cloud,
  database: Database,
  cache: HardDrives,
  "cdn-security": ShieldCheck,
  "error-tracking": Bug,
  email: Envelope,
  payments: CreditCard,
  "ci-cd": GearSix,
  testing: Flask,
  "code-quality": Code,
  auth: Key,
  analytics: ChartBar,
  monitoring: Pulse,
  "bot-detection": Fingerprint,
  vault: LockKey,
};

export function CategoryGroup({
  categoryId,
  label,
  services,
  statuses,
  alternatives,
  expandedServices,
  onToggleService,
  defaultExpanded = true,
}: CategoryGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultExpanded);
  const Icon = CATEGORY_ICONS[categoryId] || GearSix;

  const connectedCount = services.filter((s) => statuses.get(s.id)?.status === "connected").length;
  const totalCount = services.length;
  const allConnected = connectedCount === totalCount;

  if (services.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <Icon
              weight="duotone"
              className="text-brand-400 h-4.5 w-4.5 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]"
            />
          )}
          <h2 className="text-fg-primary text-sm font-black tracking-wider uppercase">{label}</h2>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase",
                allConnected
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400",
              )}
            >
              {connectedCount}/{totalCount}
            </span>
          </div>
        </div>
        {isOpen ? (
          <CaretDown weight="bold" className="text-fg-muted h-3.5 w-3.5" />
        ) : (
          <CaretRight weight="bold" className="text-fg-muted h-3.5 w-3.5" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-2">
              {services.map((svc) => (
                <ServiceBlock
                  key={svc.id}
                  service={svc}
                  status={statuses.get(svc.id)}
                  alternatives={alternatives[svc.id] || []}
                  isExpanded={expandedServices.has(svc.id)}
                  onToggle={() => onToggleService(svc.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
