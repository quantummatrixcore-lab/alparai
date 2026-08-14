"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import type { VendorIncident } from "@/actions/admin/vendor-portal";

interface VendorIncidentHistoryProps {
  incidents: VendorIncident[];
}

export function VendorIncidentHistory({ incidents }: VendorIncidentHistoryProps) {
  const t = useTranslations("vendorPortal");

  const getSeverityBadge = (severity: VendorIncident["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getStatusBadge = (status: VendorIncident["status"]) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> {t("status_resolved")}
          </span>
        );
      case "investigating":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            <Clock className="h-3 w-3 animate-pulse" /> {t("status_investigating")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
            <AlertCircle className="h-3 w-3" /> {t("status_open")}
          </span>
        );
    }
  };

  return (
    <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-3xl border p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <h2 className="text-fg-primary text-lg font-bold">{t("vendor_incident_log")}</h2>
        </div>
        <span className="text-fg-muted font-mono text-xs">{t("realtime_telemetry")}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="text-fg-primary w-full text-left text-sm">
          <thead className="border-border-subtle bg-bg-tertiary text-fg-muted border-b text-xs tracking-wider uppercase">
            <tr>
              <th className="p-3.5">{t("provider")}</th>
              <th className="p-3.5">{t("incident")}</th>
              <th className="p-3.5">{t("severity")}</th>
              <th className="p-3.5">{t("status")}</th>
              <th className="p-3.5">{t("timestamp")}</th>
            </tr>
          </thead>
          <tbody className="divide-border-subtle divide-y">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-bg-tertiary/60 transition-colors">
                <td className="text-fg-primary p-3.5 font-bold">{inc.providerName}</td>
                <td className="text-fg-primary p-3.5 font-medium">{inc.title}</td>
                <td className="p-3.5">
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-xs font-bold tracking-wider uppercase ${getSeverityBadge(
                      inc.severity,
                    )}`}
                  >
                    {inc.severity}
                  </span>
                </td>
                <td className="p-3.5">{getStatusBadge(inc.status)}</td>
                <td className="text-fg-muted p-3.5 font-mono text-xs">
                  {new Date(inc.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {incidents.length === 0 && (
          <div className="text-fg-muted py-8 text-center">{t("no_incidents")}</div>
        )}
      </div>
    </div>
  );
}
