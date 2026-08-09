"use client";

import * as React from "react";
import { Cpu, RefreshCw, AlertTriangle } from "lucide-react";
import {
  AdminContainer,
  AdminPageHeader,
  ZeroCostBanner,
} from "@/components/admin/admin-design-kit";
import { CategoryGroup } from "@/components/admin/integrations/category-group";
import { INTEGRATION_SERVICES, CATEGORIES } from "@/lib/integrations/registry";
import type { IntegrationStatus, IntegrationAlternative } from "@/lib/integrations/types";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EcosystemMap } from "@/components/admin/integrations/ecosystem-map";

export default function AdminIntegrationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations("admin");
  const unwrappedParams = React.use(params);
  const locale = unwrappedParams.locale;

  const [data, setData] = React.useState<{
    services: IntegrationStatus[];
    alternatives: Record<string, IntegrationAlternative[]>;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedServices, setExpandedServices] = React.useState<Set<string>>(new Set());

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/integrations", { cache: "no-store" });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusMap = React.useMemo(() => {
    const map = new Map<string, IntegrationStatus>();
    if (data?.services) {
      for (const s of data.services) {
        map.set(s.serviceId, s);
      }
    }
    return map;
  }, [data]);

  // Only show services that have env vars (active integrations)
  const activeServiceIds = React.useMemo(
    () => new Set(INTEGRATION_SERVICES.filter((s) => s.envVars.length > 0).map((s) => s.id)),
    [],
  );

  const toggleService = (id: string) => {
    setExpandedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalConnected = React.useMemo(
    () => (data?.services || []).filter((s) => s.status === "connected").length,
    [data],
  );
  const totalServices = React.useMemo(() => activeServiceIds.size, [activeServiceIds]);

  const [aiProviders, setAiProviders] = React.useState<
    { name: string; monthlyCost: number; freeLimit: string; usedPercent: number }[]
  >([]);
  const [totalSavedStr, setTotalSavedStr] = React.useState<string>("$0.00 / mo");

  const fetchProviders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/costs", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const costServices = json.services || [];
        setTotalSavedStr(`$${(json.totalBudget || 0).toFixed(2)} / mo`);
        setAiProviders(
          costServices.map(
            (s: {
              name: string;
              currentCost: number;
              budgetLimit: number;
              percentUsed: number;
            }) => ({
              name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
              monthlyCost: s.currentCost || 0,
              freeLimit: s.budgetLimit > 0 ? `$${s.budgetLimit.toFixed(2)}` : "Unlimited",
              usedPercent: s.percentUsed || 0,
            }),
          ),
        );
      } else {
        // Fallback to ai_providers if costs API is not accessible by current user
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const { data } = await supabase
          .from("ai_providers" as never)
          .select("name")
          .limit(6);
        if (data) {
          setAiProviders(
            data.map((p: { name: string }) => ({
              name: p.name,
              monthlyCost: 0,
              freeLimit: "Unlimited",
              usedPercent: 0,
            })),
          );
        }
      }
    } catch (_e) {
      // Silently handle error
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    fetchProviders();
  }, [fetchData, fetchProviders]);

  if (loading && !data) {
    return (
      <AdminContainer>
        <AdminPageHeader
          icon={<Cpu className="text-brand-400 h-6 w-6 animate-pulse" />}
          title={t("integrations_title")}
          subtitle={t("integrations_syncing")}
        />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="bg-bg-secondary/30 h-5 w-48 animate-pulse rounded-md" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-bg-secondary/20 h-[72px] animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminContainer>
    );
  }

  if (error) {
    return (
      <AdminContainer>
        <AdminPageHeader
          icon={<AlertTriangle className="h-6 w-6 text-rose-400" />}
          title={t("integrations_title")}
          subtitle={t("integrations_sync_failed")}
        />
        <div className="border-border-subtle rounded-xl border bg-zinc-900/40 p-8 text-center ring-1 ring-white/10 backdrop-blur-xl">
          <p className="mb-4 text-sm text-rose-400">{error}</p>
          <Button
            onClick={fetchData}
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            {t("integrations_retry")}
          </Button>
        </div>
      </AdminContainer>
    );
  }

  const lastUpdatedTime = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleTimeString(locale, { hour12: false })
    : "—";

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="rounded-3xl bg-zinc-900/40 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
        <AdminContainer>
          <AdminPageHeader
            icon={<Cpu className="text-brand-400 h-6 w-6" />}
            title={`${t("integrations_title")} (${totalConnected}/${totalServices})`}
            subtitle={t("integrations_subtitle")}
            lastUpdated={lastUpdatedTime}
            action={
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
              >
                {loading ? t("integrations_refreshing") : t("integrations_refresh")}
              </Button>
            }
          />

          <EcosystemMap />

          {/* Zero Cost Banner Shield */}
          <ZeroCostBanner services={aiProviders} totalSaved={totalSavedStr} locale={locale} />

          <div className="mt-8 space-y-8">
            {CATEGORIES.map((cat) => {
              const services = INTEGRATION_SERVICES.filter(
                (s) => s.category === cat.id && activeServiceIds.has(s.id),
              );
              if (services.length === 0) return null;

              return (
                <CategoryGroup
                  key={cat.id}
                  categoryId={cat.id}
                  label={cat.label}
                  services={services}
                  statuses={statusMap}
                  alternatives={data?.alternatives || {}}
                  expandedServices={expandedServices}
                  onToggleService={toggleService}
                />
              );
            })}
          </div>
        </AdminContainer>
      </div>
    </div>
  );
}
