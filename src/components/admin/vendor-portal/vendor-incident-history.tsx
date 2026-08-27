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
        return "bg-danger-500/20 text-danger-300 border-danger-500/40";
      case "high":
        return "bg-warning-500/20 text-warning-300 border-warning-500/40";
      case "medium":
        return "bg-warning-500/20 text-warning-300 border-warning-500/40";
      default:
        return "bg-bg-elevated text-fg-muted border-border-strong";
    }
  };

  const getStatusBadge = (status: VendorIncident["status"]) => {
    switch (status) {
      case "resolved":
        return (
          <span className="border-success-500/30 bg-success-500/10 text-success-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" /> {t("status_resolved")}
          </span>
        );
      case "investigating":
        return (
          <span className="border-warning-500/30 bg-warning-500/10 text-warning-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            <Clock className="h-3 w-3 animate-pulse" /> {t("status_investigating")}
          </span>
        );
      default:
        return (
          <span className="border-danger-500/30 bg-danger-500/10 text-danger-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            <AlertCircle className="h-3 w-3" /> {t("status_open")}
          </span>
        );
    }
  };

  return (
    <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-3xl border p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-warning-400 h-5 w-5" />
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
