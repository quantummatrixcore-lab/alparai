import { requireAdmin } from "@/lib/auth/session";
import { getTrustScoresAction } from "@/actions/admin/ai-orchestrator";
import { getAdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { Cpu } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { OrchestratorTriggerButton } from "./trigger-button";
import { getTranslations } from "next-intl/server";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { AiOrchestratorClient } from "@/components/admin/ai-orchestrator-client";

import { AiHubTabs } from "@/components/admin/ai-hub-tabs";

export default async function AiOrchestratorAdminPage({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : { locale: "tr" };
  const locale = resolvedParams.locale || "tr";
  await requireAdmin();
  const t = await getTranslations("admin");
  const supabase = await createServerClient();
  const trustScores = await getTrustScoresAction();
  const autopilotRes = await getAdminAutopilotSnapshot(100);
  const autopilotSnapshot = autopilotRes.ok ? autopilotRes.snapshot : null;

  const { data: chains } = await supabase.from("ai_routing_chains").select("*");
  const { data: costs } = await supabase
    .from("finance_monthly_costs")
    .select("budget_usd, amount_usd");
  const costSavings = (costs || []).reduce((acc, c) => acc + (c.budget_usd - c.amount_usd), 0);
  const costSavingsStr = costSavings > 0 ? `$${costSavings.toFixed(2)}` : "$0.00";

  const { data: dbModels } = await supabase
    .from("ai_models")
    .select(
      `
      id,
      name,
      status,
      provider:ai_providers!ai_models_provider_id_fkey(name)
    `,
    )
    .eq("status", "active")
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freeModels = ((dbModels as any[]) || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    provider: m.provider?.name || "Unknown Provider",
    context_length: 128000,
  }));

  const avgTrustScore =
    trustScores.length > 0
      ? (
          trustScores.reduce((acc, s) => acc + Number(s.trust_score), 0) / trustScores.length
        ).toFixed(1)
      : "0.0";

  const totalAudits = trustScores.reduce((acc, s) => acc + (Number(s.total_audits) || 0), 0);

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <AdminContainer>
        <AiHubTabs />
        <AdminPageHeader
          icon={<Cpu className="h-7 w-7 text-emerald-400" />}
          title={t("ai_orchestrator_cross_audit_arena") || "AI Orchestrator & Cross-Audit Arena"}
          subtitle={
            t("stealth_multi_agent_cross_audit_trust_ba") ||
            "Stealth multi-agent cross-audit & AI trust balance"
          }
          action={<OrchestratorTriggerButton />}
          breadcrumb={[
            { label: "Admin", href: "/admin" },
            { label: "AI Hub", href: "/admin/ai-hub" },
            { label: "Orchestrator", href: "/admin/ai-hub/orchestrator" },
          ]}
        />

        <AiOrchestratorClient
          freeModels={freeModels}
          trustScores={trustScores}
          chains={chains}
          costSavingsStr={costSavingsStr}
          avgTrustScore={avgTrustScore}
          totalAudits={totalAudits}
          autopilotSnapshot={autopilotSnapshot}
          locale={locale}
        />
      </AdminContainer>
    </div>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
