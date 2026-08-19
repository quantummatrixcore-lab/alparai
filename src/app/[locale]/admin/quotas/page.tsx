export const dynamic = "force-dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AdminContainer,
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/admin-design-kit";
import { Activity, AlertTriangle, Zap } from "lucide-react";

interface VendorQuota {
  id: string;
  vendor: string;
  metric: string;
  limit_value: number | null;
  used_value: number | null;
  unit: string | null;
  period_start: string | null;
  period_end: string | null;
  plan_name: string | null;
  source: "api" | "manual";
  updated_at: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function isStale(periodEnd: string | null, _updatedAt: string): boolean {
  if (!periodEnd) return false;
  const now = new Date();
  const endDate = new Date(periodEnd);
  return endDate < now;
}

function calculatePercentage(used: number | null, limit: number | null): number | null {
  if (used === null || limit === null || limit === 0) return null;
  return (used / limit) * 100;
}

function QuotaRow({ quota }: { quota: VendorQuota }) {
  const percentage = calculatePercentage(quota.used_value, quota.limit_value);
  const staleStatus = isStale(quota.period_end, quota.updated_at);

  return (
    <div className="border-border-secondary flex flex-col gap-4 border-b pb-4 last:border-b-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-fg-primary font-mono text-sm font-semibold">{quota.vendor}</span>
            {quota.source === "manual" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-400">
                Manual
              </span>
            )}
            {staleStatus && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                <AlertTriangle className="h-3 w-3" />
                Stale
              </span>
            )}
          </div>
          <span className="text-fg-tertiary text-xs">{quota.metric}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-fg-primary text-sm font-semibold">
              {quota.used_value !== null ? (
                <>
                  {quota.used_value.toLocaleString()}{" "}
                  {quota.limit_value !== null ? `/ ${quota.limit_value.toLocaleString()}` : ""}
                  {quota.unit && <span className="text-fg-tertiary text-xs"> {quota.unit}</span>}
                </>
              ) : (
                <span className="text-fg-secondary italic">ölçülmedi</span>
              )}
            </div>
            {percentage !== null && (
              <div className="text-fg-tertiary text-xs">{percentage.toFixed(1)}% used</div>
            )}
          </div>

          {percentage !== null && (
            <div className="bg-bg-tertiary h-2 w-24 overflow-hidden rounded-full">
              <div
                className={`h-full transition-all ${
                  percentage >= 95
                    ? "bg-red-500"
                    : percentage >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="text-fg-tertiary flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-medium">Plan:</span> {quota.plan_name || "—"}
        </div>
        <div>
          <span className="font-medium">Period:</span> {formatDate(quota.period_start)} –{" "}
          {formatDate(quota.period_end)}
        </div>
        <div>
          <span className="font-medium">Updated:</span> {formatDate(quota.updated_at)}
        </div>
      </div>
    </div>
  );
}

export default async function QuotasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireModerator();

  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = createAdminClient();

  const { data: quotasData } = await supabase
    .from("vendor_quotas" as never)
    .select("*")
    .order("updated_at", { ascending: false });

  const quotas = (quotasData || []) as unknown as VendorQuota[];

  const sortedQuotas = [...quotas].sort((a, b) => {
    const percentA = calculatePercentage(a.used_value, a.limit_value) ?? -1;
    const percentB = calculatePercentage(b.used_value, b.limit_value) ?? -1;

    if (percentA === -1 && percentB === -1) return 0;
    if (percentA === -1) return 1;
    if (percentB === -1) return -1;
    return percentB - percentA;
  });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Activity className="h-6 w-6 text-emerald-400" />}
        title={t("vendor_quotas") || "Vendor Quotas & Resource Usage"}
        subtitle={
          t("quota_subtitle") ||
          "Track third-party vendor quotas, API limits, and resource consumption across all services."
        }
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Quotas", href: "/admin/quotas" },
        ]}
      />

      <AdminSectionCard title={t("quota_tracking") || "Quota Tracking"}>
        {sortedQuotas.length === 0 ? (
          <div className="text-fg-tertiary flex flex-col items-center justify-center gap-3 py-8">
            <Zap className="h-8 w-8 opacity-50" />
            <span className="text-sm">{t("no_quotas") || "No quotas configured"}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQuotas.map((quota) => (
              <QuotaRow key={quota.id} quota={quota} />
            ))}
          </div>
        )}
      </AdminSectionCard>
    </AdminContainer>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
