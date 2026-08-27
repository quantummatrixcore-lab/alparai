"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAutopilotWorker, type AutopilotWorkerConfig } from "@/actions/admin-autopilot";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  workerConfigs: AutopilotWorkerConfig[];
  globalKillSwitch: boolean;
}

export function AutopilotWorkerToggles({ workerConfigs, globalKillSwitch }: Props) {
  const t = useTranslations("autopilot");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (workerName: string, enabled: boolean) => {
    startTransition(async () => {
      const r = await toggleAutopilotWorker(workerName, enabled);
      if (r.ok) {
        router.refresh();
      } else {
        alert(r.error ?? "Failed to toggle worker");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Kill Switch Banner */}
      <div
        className={`flex items-center gap-3 rounded-lg border p-4 backdrop-blur-xl ${
          globalKillSwitch
            ? "border-danger-500/20 text-danger-300 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            : "border-success-500/20 text-success-300 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        }`}
      >
        {globalKillSwitch ? (
          <>
            <ShieldAlert className="text-danger-400 h-6 w-6 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{t("kill_switch_active_title")}</p>
              <p className="text-danger-400/80 mt-0.5 text-xs">{t("kill_switch_active_desc")}</p>
            </div>
          </>
        ) : (
          <>
            <ShieldCheck className="text-success-400 h-6 w-6 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{t("kill_switch_inactive_title")}</p>
              <p className="text-success-400/80 mt-0.5 text-xs">{t("kill_switch_inactive_desc")}</p>
            </div>
          </>
        )}
      </div>

      {/* Worker Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>{t("section_workers")}</CardTitle>
        </CardHeader>
        <CardContent>
          {workerConfigs.length === 0 ? (
            <p className="text-fg-muted text-sm">{t("empty_workers")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">{t("autopilot_worker_configurations")}</caption>
                <thead className="text-fg-muted border-border-subtle/50 border-b">
                  <tr>
                    <th className="py-3 font-medium">{t("worker_name")}</th>
                    <th className="py-3 font-medium">{t("worker_status")}</th>
                    <th className="py-3 font-medium">{t("worker_updated")}</th>
                    <th className="py-3 text-right font-medium">{t("worker_action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {workerConfigs.map((wc) => (
                    <tr key={wc.worker_name} className="hover:bg-white/[0.01]">
                      <td className="text-fg-secondary py-3.5 font-mono font-medium">
                        {wc.worker_name}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            wc.enabled
                              ? "bg-success-500/10 text-success-400"
                              : "bg-danger-500/10 text-danger-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${wc.enabled ? "bg-success-400" : "bg-danger-400"}`}
                          />
                          {wc.enabled ? t("status_enabled") : t("status_disabled")}
                        </span>
                      </td>
                      <td className="text-fg-muted py-3.5 font-mono text-xs">
                        {wc.updated_at ? new Date(wc.updated_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-3.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending || globalKillSwitch}
                          onClick={() => handleToggle(wc.worker_name, !wc.enabled)}
                          className={
                            wc.enabled
                              ? "text-danger-400 hover:bg-danger-500/5 hover:text-danger-300"
                              : "text-success-400 hover:bg-success-500/5 hover:text-success-300"
                          }
                        >
                          {wc.enabled ? (
                            <>
                              <ToggleRight className="mr-1.5 h-5 w-5" />
                              {t("btn_disable")}
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-1.5 h-5 w-5" />
                              {t("btn_enable")}
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
