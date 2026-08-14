"use client";

import { Server, Activity, Clock, ShieldCheck } from "lucide-react";
import type { VendorPortalData } from "@/actions/admin/vendor-portal";
import { VendorSlaCard } from "./vendor-sla-card";
import { VendorSlaCharts } from "./vendor-sla-charts";
import { VendorIncidentHistory } from "./vendor-incident-history";
import { useTranslations } from "next-intl";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";

interface VendorPortalDashboardProps {
  data: VendorPortalData;
}

export function VendorPortalDashboard({ data }: VendorPortalDashboardProps) {
  const t = useTranslations("admin");

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<Server className="text-brand-400 h-7 w-7" />}
        title={t("vendor_portal_title") || "AI Vendor SLA & Trust Portal"}
        subtitle={
          t("vendor_portal_subtitle") ||
          "Monitor AI model provider SLA performance, response times, incident history, and automated trust score rankings."
        }
        badge={
          <span className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-bold">
            <Activity className="h-4 w-4 animate-pulse" />
            Beta Release v1.0
          </span>
        }
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Vendor Portal", href: "/admin/vendor-portal" },
        ]}
      />

      <div className="border-border-subtle grid grid-cols-1 gap-4 border-b pb-6 sm:grid-cols-3">
        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-4">
          <div className="text-fg-muted flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="text-success-400 h-4 w-4" />
            <span>{t("vendor_sla_uptime") || "Global SLA Uptime"}</span>
          </div>
          <p className="text-success-400 mt-2 font-mono text-3xl font-black">
            {data.overallUptimeSla}%
          </p>
        </div>

        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-4">
          <div className="text-fg-muted flex items-center gap-2 text-xs font-semibold">
            <Clock className="text-warning-400 h-4 w-4" />
            <span>{t("vendor_avg_latency") || "Avg Response Latency"}</span>
          </div>
          <p className="text-fg-primary mt-2 font-mono text-3xl font-black">
            {data.averageLatencyMs} <span className="text-fg-muted text-base">ms</span>
          </p>
        </div>

        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-4">
          <div className="text-fg-muted flex items-center gap-2 text-xs font-semibold">
            <Server className="text-brand-400 h-4 w-4" />
            <span>Active Providers Monitored</span>
          </div>
          <p className="text-brand-300 mt-2 font-mono text-3xl font-black">
            {data.totalActiveVendors}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-fg-primary px-1 text-xl font-bold">Top Vendor Rankings & SLA</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.vendors.map((vendor) => (
            <VendorSlaCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <VendorSlaCharts data={data.chartData} />
        <VendorIncidentHistory incidents={data.incidents} />
      </div>
    </AdminContainer>
  );
}
