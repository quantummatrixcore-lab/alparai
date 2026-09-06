"use client";

import { CheckCircle2, AlertTriangle, MessageSquare, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineEvent = {
  id: string;
  type: "system" | "user" | "ai" | "verification";
  title: string;
  description: string;
  timestamp: string;
  status?: "pending" | "success" | "warning" | "error";
};

export function EvidenceTimeline({
  events,
  className,
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  const getEventIcon = (type: TimelineEvent["type"], status?: TimelineEvent["status"]) => {
    switch (type) {
      case "system":
        return <Shield className="text-brand-400 h-4 w-4" />;
      case "user":
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case "ai":
        return (
          <AlertTriangle
            className={cn("h-4 w-4", status === "error" ? "text-danger-400" : "text-warning-400")}
          />
        );
      case "verification":
        return <CheckCircle2 className="text-success-400 h-4 w-4" />;
      default:
        return <Clock className="text-fg-muted h-4 w-4" />;
    }
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className={cn("border-border-subtle relative space-y-8 border-l pl-6", className)}>
      {events.map((event, index) => (
        <div key={event.id} className="relative">
          {/* Node marker */}
          <div className="border-border-subtle bg-bg-secondary absolute -left-[35px] flex h-8 w-8 items-center justify-center rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {getEventIcon(event.type, event.status)}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h4 className="text-fg-primary text-sm font-bold">{event.title}</h4>
              <time className="text-fg-muted rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium">
                {new Date(event.timestamp).toLocaleDateString()}
              </time>
            </div>

            <div className="border-border-subtle/50 mt-1 rounded-xl border bg-white/[0.02] p-4 backdrop-blur-sm">
              <p className="text-fg-secondary text-sm leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Connector line pulse effect if it's the last item and pending */}
          {index === events.length - 1 && event.status === "pending" && (
            <div className="absolute -bottom-8 -left-[20px] h-full w-[1px] bg-gradient-to-b from-white/10 to-transparent" />
          )}
        </div>
      ))}
    </div>
  );
}
