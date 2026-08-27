import { requireAdmin } from "@/lib/auth/session";
import { getTrustScoresAction } from "@/actions/admin/ai-orchestrator";
import { getAdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { Cpu } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { OrchestratorTriggerButton } from "./trigger-button";
import { getTranslations } from "next-intl/server";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { AiOrchestratorClient, type RoutingChain } from "@/components/admin/ai-orchestrator-client";

import { AiHubTabs } from "@/components/admin/ai-hub-tabs";
import { discoverFreeModels } from "@/lib/ai/discovery/fetch-models";

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

  const { data: chainsData } = await supabase.from("ai_routing_chains").select("*");
  const chains = (chainsData as unknown as RoutingChain[]) || null;
  const { data: costs } = await supabase
    .from("finance_monthly_costs")
    .select("budget_usd, amount_usd");
  const costSavings = (costs || []).reduce((acc, c) => acc + (c.budget_usd - c.amount_usd), 0);
  const costSavingsStr = costSavings > 0 ? `$${costSavings.toFixed(2)}` : "$0.00";

  const freeModelsList = await discoverFreeModels();
  const freeModels = freeModelsList.slice(0, 10).map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    context_length: m.context_length || 128000,
  }));

  const avgTrustScore =
    trustScores.length > 0
      ? (
          trustScores.reduce((acc, s) => acc + Number(s.trust_score), 0) / trustScores.length
        ).toFixed(1)
      : "0.0";

  const totalAudits = trustScores.reduce((acc, s) => acc + (Number(s.total_audits) || 0), 0);

  return (
    <AdminContainer shell>
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
        chains={(chains as never) || null}
        costSavingsStr={costSavingsStr}
        avgTrustScore={avgTrustScore}
        totalAudits={totalAudits}
        autopilotSnapshot={autopilotSnapshot}
        locale={locale}
      />
    </AdminContainer>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
