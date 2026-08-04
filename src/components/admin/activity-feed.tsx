"use client";

import { Clock, ShieldAlert, Cpu, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";

interface ActivityItem {
  id: string;
  type: "incident" | "audit" | "provider" | "expert";
  title: string;
  description: string;
  time: string;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const t = useTranslations("admin");
  const icons = {
    incident: <ShieldAlert className="h-4 w-4 text-amber-400" />,
    audit: <Clock className="h-4 w-4 text-cyan-400" />,
    provider: <Cpu className="h-4 w-4 text-rose-400" />,
    expert: <UserCheck className="text-brand-400 h-4 w-4" />,
  };

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div
          key={act.id}
          className="group flex items-start gap-3 rounded-xl border border-white/5 bg-neutral-950/20 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-neutral-900/60 hover:shadow-[0_4px_15px_rgba(6,182,212,0.1)]"
        >
          <div className="mt-0.5 shrink-0 rounded-lg border border-white/5 bg-neutral-900 p-2">
            {icons[act.type] || <Clock className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{act.title}</p>
            <p className="text-fg-secondary mt-0.5 truncate text-[11px]">{act.description}</p>
          </div>
          <span className="text-fg-muted shrink-0 pt-0.5 font-mono text-[10px]">{act.time}</span>
        </div>
      ))}
      {activities.length === 0 && (
        <p className="text-fg-muted py-6 text-center text-xs italic">{t("no_recent_activity")}</p>
      )}
    </div>
  );
}
