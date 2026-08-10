import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdvisor } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { SwotBoardClient } from "@/components/admin/strategy/swot-board-client";
import { Grid as GridIcon } from "lucide-react";
import { StrategyTabs } from "@/components/admin/strategy-tabs";
import type { SwotItem } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("swot_title") || "SWOT Analysis"} | ALPAR AI` };
}

export default async function SwotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Authenticate user & check advisor access
  const user = await requireAdvisor();
  const isReadOnly = (user.role as string) === "advisor";

  const supabase = await createServerClient();
  const { data } = await supabase.from("strategy_swot_items").select("*").order("created_at");

  const initialItems = (data ?? []) as SwotItem[];
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="rounded-3xl bg-zinc-900/40 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
        <StrategyTabs />
        <div className="mt-8 min-h-screen rounded-3xl bg-zinc-900/40 p-6 py-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:p-8">
          <Container>
            {/* Page Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <GridIcon className="h-6 w-6 text-purple-400" />
                  <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    {t("swot_title")}
                  </h1>
                </div>
                <p className="text-fg-muted mt-1 text-sm">{t("swot_desc")}</p>
              </div>
              {isReadOnly && (
                <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                  {t("read_only")}
                </span>
              )}
            </div>

            {/* SWOT Board */}
            <SwotBoardClient initialItems={initialItems} isReadOnly={isReadOnly} locale={locale} />
          </Container>
        </div>
      </div>
    </div>
  );
}
