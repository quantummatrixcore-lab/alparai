"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { toggleFeatureFlagAction, type FeatureFlagItem } from "@/actions/system-mgmt";
import { ShieldCheck, Zap, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface FeatureFlagsClientProps {
  initialFlags: FeatureFlagItem[];
}

export function FeatureFlagsClient({ initialFlags }: FeatureFlagsClientProps) {
  const t = useTranslations("admin");
  const [flags, setFlags] = useState<FeatureFlagItem[]>(initialFlags);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    setUpdatingKey(key);
    const newEnabled = !currentEnabled;

    // Optimistic UI update
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: newEnabled } : f)));

    try {
      const res = await toggleFeatureFlagAction(key, newEnabled);
      if (res.success) {
        toast.success(
          newEnabled ? `${key} feature flag activated` : `${key} feature flag disabled`,
        );
      } else {
        // Rollback on failure
        setFlags((prev) =>
          prev.map((f) => (f.key === key ? { ...f, enabled: currentEnabled } : f)),
        );
        toast.error("Failed to update feature flag status");
      }
    } catch (_e) {
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: currentEnabled } : f)));
      toast.error("Network error updating feature flag");
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="feature-flags-client">
      <AdminSectionCard title={t("ff_controls_title") || "Feature Gate Control Center"}>
        <div className="divide-y divide-white/10 p-6">
          {flags.map((flag) => {
            const isUpdating = updatingKey === flag.key;
            return (
              <div
                key={flag.key}
                className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold tracking-wide text-white">
                      {flag.key}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                        flag.enabled
                          ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          : "border border-zinc-700 bg-zinc-800/60 text-zinc-400"
                      }`}
                    >
                      {flag.enabled ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          {t("ff_active") || "Active"}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          {t("ff_disabled") || "Disabled"}
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">{flag.description}</p>
                </div>

                {/* Interactive Toggle Switch Button */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={flag.enabled}
                  disabled={isUpdating}
                  onClick={() => handleToggle(flag.key, flag.enabled)}
                  className={`group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-emerald-400/50 focus:outline-none disabled:cursor-wait disabled:opacity-60 ${
                    flag.enabled
                      ? "bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  <span className="sr-only">Toggle {flag.key}</span>
                  {isUpdating ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </span>
                  ) : (
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        flag.enabled ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </AdminSectionCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-zinc-300 backdrop-blur-md">
          <span className="flex items-center gap-2 font-bold text-amber-400">
            <Zap className="h-4 w-4" /> {t("ff_edge_cache") || "Edge Cache Revalidation"}
          </span>
          <p className="leading-relaxed">
            {t("ff_edge_cache_desc") ||
              "Feature flag state changes are instantly broadcasted across edge nodes with zero-downtime revalidation."}
          </p>
        </div>
        <div className="space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-zinc-300 backdrop-blur-md">
          <span className="flex items-center gap-2 font-bold text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> {t("ff_rls_protection") || "RLS Security Shield"}
          </span>
          <p className="leading-relaxed">
            {t("ff_rls_protection_desc") ||
              "Every flag mutation is verified via server-side session checks and audit logging."}
          </p>
        </div>
      </div>
    </div>
  );
}
