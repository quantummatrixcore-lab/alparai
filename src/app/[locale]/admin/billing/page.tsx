import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { DollarSign } from "lucide-react";
import {
  AdminPageHeader,
  MetricCard,
  AdminSectionCard,
  AdminContainer,
} from "@/components/admin/admin-design-kit";

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();
  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscriptions:", error);
  }

  const activeSubs = subs?.filter((s) => s.status === "active") || [];
  const planPrices: Record<string, number> = { free: 0, pro: 2500, enterprise: 10000 };
  const mrr = activeSubs.reduce((acc, s) => acc + (planPrices[s.plan] ?? 0), 0);

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<DollarSign className="text-brand-400 h-6 w-6" />}
        title={t("billing_title")}
        subtitle={t("billing_subtitle")}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard label={t("billing_mrr")} value={`$${mrr.toLocaleString()}`} variant="success" />
        <MetricCard label={t("billing_active_subs")} value={activeSubs.length} />
        <MetricCard label={t("billing_total_records")} value={subs?.length || 0} />
      </div>

      <AdminSectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-fg-muted bg-bg-tertiary text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">{t("billing_th_id_user")}</th>
                <th className="px-6 py-4">{t("billing_th_plan")}</th>
                <th className="px-6 py-4">{t("billing_th_status")}</th>
                <th className="px-6 py-4">{t("billing_th_created")}</th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {subs?.map((sub) => (
                <tr key={sub.id} className="hover:bg-bg-tertiary/30 transition-colors">
                  <td className="text-fg-primary px-6 py-4 font-mono text-xs">
                    {sub.id.substring(0, 8)}...
                    <br />
                    <span className="text-fg-muted">{sub.user_id?.substring(0, 8)}...</span>
                  </td>
                  <td className="text-fg-primary px-6 py-4 capitalize">
                    {sub.plan === "free"
                      ? t("billing_plan_free")
                      : sub.plan === "pro"
                        ? t("billing_plan_pro")
                        : sub.plan === "enterprise"
                          ? t("billing_plan_enterprise")
                          : sub.plan || t("billing_custom")}
                  </td>
                  <td className="px-6 py-4">
                    {sub.status === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                        <CheckCircle weight="fill" /> {t("billing_active")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-xs text-rose-400">
                        <WarningCircle weight="fill" /> {sub.status || t("billing_unknown")}
                      </span>
                    )}
                  </td>
                  <td className="text-fg-muted px-6 py-4 font-mono text-xs">
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : ""}
                  </td>
                </tr>
              ))}
              {(!subs || subs.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-fg-muted px-6 py-8 text-center italic">
                    {t("billing_empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>
    </AdminContainer>
  );
}
