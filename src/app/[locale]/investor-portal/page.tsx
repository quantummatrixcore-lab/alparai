import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { Container, Divider } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Lock, ChevronRight } from "lucide-react";
import crypto from "crypto";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "investorPortal" });
  return {
    robots: { index: false, follow: false },
    title: t("meta_title"),
    description: t("meta_desc"),
  };
}

interface InvestorPortalProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function InvestorPortalPage({ params, searchParams }: InvestorPortalProps) {
  const { locale } = await params;
  const { token } = (await searchParams) ?? {};

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "investorPortal" });

  if (!token) {
    return (
      <InvalidTokenView
        message={t("token_missing")}
        accessDenied={t("access_denied")}
        accessHelp={t("access_help")}
      />
    );
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const admin = createAdminClient();

  const { data: application, error } = await admin
    .from("investor_applications")
    .select("full_name, company, status, approved_at")
    .eq("access_token_hash", tokenHash)
    .single();

  if (error || !application || application.status !== "approved") {
    return (
      <InvalidTokenView
        message={t("token_invalid")}
        accessDenied={t("access_denied")}
        accessHelp={t("access_help")}
      />
    );
  }

  const approvedAt = new Date(application.approved_at || "");
  const expiryTime = approvedAt.getTime() + 30 * 24 * 60 * 60 * 1000;
  // eslint-disable-next-line react-hooks/purity
  if (Date.now() > expiryTime) {
    return (
      <InvalidTokenView
        message={t("token_expired")}
        accessDenied={t("access_denied")}
        accessHelp={t("access_help")}
      />
    );
  }

  const investorName = application.full_name;
  const investorCompany = application.company;

  const supabase = await createServerClient();

  const { count: totalIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: totalProviders } = await supabase
    .from("ai_providers")
    .select("*", { count: "exact", head: true });

  const { data: countriesData } = await supabase
    .from("incidents")
    .select("location_country")
    .eq("status", "published");

  const uniqueCountries = new Set(
    (countriesData ?? []).map((i) => i.location_country).filter(Boolean),
  );
  const totalCountries = uniqueCountries.size;

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const { count: thisMonthIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .gte("published_at", firstDayThisMonth.toISOString());

  const { count: lastMonthIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .gte("published_at", firstDayLastMonth.toISOString())
    .lte("published_at", lastDayLastMonth.toISOString());

  const curMonthCount = thisMonthIncidents ?? 0;
  const prevMonthCount = lastMonthIncidents ?? 0;
  const growthRateValue =
    prevMonthCount > 0
      ? `${Math.round(((curMonthCount - prevMonthCount) / prevMonthCount) * 100) >= 0 ? "+" : ""}${Math.round(((curMonthCount - prevMonthCount) / prevMonthCount) * 100)}%`
      : "ölçülmedi";

  const statsList = [
    { label: t("stat_total_incidents"), value: totalIncidents ?? "—" },
    { label: t("stat_providers"), value: totalProviders ?? "—" },
    { label: t("stat_countries"), value: totalCountries > 0 ? totalCountries : "—" },
    { label: t("stat_growth"), value: growthRateValue },
    { label: t("stat_uptime"), value: "—" },
  ];

  return (
    <div className="min-h-screen bg-[#0A1622] pb-20 text-[#E2E8F0]">
      <header className="border-b border-amber-500/20 bg-[#0F1E2E] py-4">
        <Container
          size="default"
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 animate-pulse text-amber-500" />
            <span className="text-xs font-bold tracking-wider text-amber-500 uppercase">
              {t("confidential_banner")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">
                {t("welcome", { name: investorName })}
              </p>
              <p className="text-xs text-slate-400">{investorCompany}</p>
            </div>
            <a
              href={`mailto:hello@alparai.com?subject=${encodeURIComponent(`Meeting Request — ${investorName} (${investorCompany})`)}`}
              className="text-bg-primary rounded bg-emerald-500 px-4 py-2 text-xs font-bold transition-colors hover:bg-emerald-600"
            >
              {t("schedule_call")}
            </a>
          </div>
        </Container>
      </header>

      <Container size="default" className="mt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6 md:p-8">
              <h2 className="mb-6 border-l-4 border-amber-500 pl-3 text-xl font-bold text-white md:text-2xl">
                {t("exec_summary_title")}
              </h2>
              <p className="mb-6 leading-relaxed text-slate-300">{t("exec_summary_p1")}</p>
              <div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-4 text-sm md:grid-cols-3">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase">
                    {t("founded_label")}
                  </span>
                  <span className="mt-1 block font-bold text-white">{t("founded_date")}</span>
                  <span className="block text-[11px] text-slate-500">{t("founded_location")}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase">
                    {t("stage_label")}
                  </span>
                  <span className="mt-1 block font-bold text-white">{t("stage_value")}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase">
                    {t("raising_label")}
                  </span>
                  <span className="mt-1 block font-bold text-amber-500">{t("raising_value")}</span>
                  <span className="block text-[11px] text-slate-500">{t("raising_type")}</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6 md:p-8">
              <h2 className="mb-6 border-l-4 border-amber-500 pl-3 text-xl font-bold text-white md:text-2xl">
                {t("traction_title")}
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {statsList.map((stat, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-800 bg-[#0A1622] p-4 text-center"
                  >
                    <span className="block text-xl font-black text-emerald-400 md:text-2xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-[11px] leading-tight font-medium text-slate-400">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-right text-[11px] text-slate-500">
                Last updated: {new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US")}{" "}
                {t("last_updated_suffix")}
              </p>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6 md:p-8">
              <h2 className="mb-6 border-l-4 border-amber-500 pl-3 text-xl font-bold text-white md:text-2xl">
                {t("founding_title")}
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                <p>{t("founding_p1")}</p>
                <p>{t("founding_p2")}</p>
                <p>{t("founding_p3")}</p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6 md:p-8">
              <h2 className="mb-6 border-l-4 border-amber-500 pl-3 text-xl font-bold text-white md:text-2xl">
                {t("market_title")}
              </h2>
              <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-[#0A1622] p-5">
                  <span className="block text-2xl font-black text-amber-500">{t("tam_value")}</span>
                  <span className="mt-1 block font-bold text-white">{t("tam_label")}</span>
                  <span className="mt-2 block text-xs text-slate-400">{t("tam_desc")}</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0A1622] p-5">
                  <span className="block text-2xl font-black text-amber-500">{t("sam_value")}</span>
                  <span className="mt-1 block font-bold text-white">{t("sam_label")}</span>
                  <span className="mt-2 block text-xs text-slate-400">{t("sam_desc")}</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0A1622] p-5">
                  <span className="block text-2xl font-black text-emerald-400">
                    {t("som_value")}
                  </span>
                  <span className="mt-1 block font-bold text-white">{t("som_label")}</span>
                  <span className="mt-2 block text-xs text-slate-400">{t("som_desc")}</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6 md:p-8">
              <h2 className="mb-6 border-l-4 border-amber-500 pl-3 text-xl font-bold text-white md:text-2xl">
                {t("business_title")}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-slate-300">{t("business_desc")}</p>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-[#0A1622]">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-white">{t("table_metric")}</th>
                      <th className="px-6 py-3 font-semibold text-white">{t("table_2026")}</th>
                      <th className="px-6 py-3 font-semibold text-white">{t("table_2027")}</th>
                      <th className="px-6 py-3 font-semibold text-white">{t("table_2028")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#0F1E2E]">
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-300">{t("row_mrr")}</td>
                      <td className="px-6 py-4 text-slate-500 italic">{t("pre_revenue")}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">$50,000</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">$200,000</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-300">{t("row_arr")}</td>
                      <td className="px-6 py-4 text-slate-500 italic">{t("pre_revenue")}</td>
                      <td className="px-6 py-4 font-semibold text-white">$600,000</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">$2,400,000</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-300">{t("row_users")}</td>
                      <td className="px-6 py-4 text-slate-300">1K</td>
                      <td className="px-6 py-4 text-slate-300">10K</td>
                      <td className="px-6 py-4 text-slate-300">50K</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-slate-300">{t("row_providers")}</td>
                      <td className="px-6 py-4 text-slate-300">2</td>
                      <td className="px-6 py-4 text-slate-300">10</td>
                      <td className="px-6 py-4 text-slate-300">25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 italic">{t("projections_note")}</p>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6 md:p-8">
              <h2 className="mb-6 border-l-4 border-amber-500 pl-3 text-xl font-bold text-white md:text-2xl">
                {t("competitive_title")}
              </h2>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-[#0A1622]">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-white">{t("comp_feature")}</th>
                      <th className="px-6 py-3 font-semibold text-emerald-400">ALPAR AI</th>
                      <th className="px-6 py-3 font-semibold text-slate-400">AIID</th>
                      <th className="px-6 py-3 font-semibold text-slate-400">Credo AI</th>
                      <th className="px-6 py-3 font-semibold text-slate-400">OneTrust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#0F1E2E] text-center">
                    <tr>
                      <td className="px-6 py-4 text-left font-medium text-slate-300">
                        {t("comp_row_community")}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-left font-medium text-slate-300">
                        {t("comp_row_opensource")}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-left font-medium text-slate-300">
                        {t("comp_row_provider")}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-left font-medium text-slate-300">
                        {t("comp_row_api")}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-left font-medium text-slate-300">
                        {t("comp_row_free")}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">✅</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                      <td className="px-6 py-4 text-red-500">❌</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-[#0F1E2E] p-6 shadow-md">
              <div className="absolute top-0 left-0 h-1 w-full bg-amber-500"></div>
              <h3 className="mb-4 text-lg font-bold text-white">{t("round_title")}</h3>
              <p
                className="mb-6 text-sm leading-relaxed text-slate-300"
                dangerouslySetInnerHTML={{
                  __html: t("round_desc", { amount: "$500K - $1.5M" }),
                }}
              />

              <h4 className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
                {t("funds_title")}
              </h4>
              <ul className="mb-6 space-y-2 text-sm text-slate-300">
                <li className="flex justify-between">
                  <span>🚀 {t("fund_team")}</span>
                  <span className="font-bold text-white">40%</span>
                </li>
                <li className="flex justify-between">
                  <span>🔒 {t("fund_infra")}</span>
                  <span className="font-bold text-white">30%</span>
                </li>
                <li className="flex justify-between">
                  <span>🌍 {t("fund_market")}</span>
                  <span className="font-bold text-white">20%</span>
                </li>
                <li className="flex justify-between">
                  <span>💼 {t("fund_legal")}</span>
                  <span className="font-bold text-white">10%</span>
                </li>
              </ul>

              <Divider className="my-4" />

              <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                {t("privileges_title")}
              </h4>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-400">
                <li>{t("priv_prorata")}</li>
                <li>{t("priv_board")}</li>
                <li>{t("priv_advisory")}</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0F1E2E] p-6">
              <h3 className="mb-4 text-lg font-bold text-white">{t("materials_title")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded border border-slate-800 bg-[#0A1622] p-3 transition-colors hover:border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-white">{t("doc_pitch")}</p>
                      <p className="text-[10px] text-slate-500">{t("doc_pitch_size")}</p>
                    </div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Upload pitch deck separately once portal configuration is live.");
                    }}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>

                <div className="flex items-center justify-between rounded border border-slate-800 bg-[#0A1622] p-3 transition-colors hover:border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-white">{t("doc_onepager")}</p>
                      <p className="text-[10px] text-slate-500">{t("doc_onepager_size")}</p>
                    </div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Upload one-pager separately once portal configuration is live.");
                    }}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>

                <div className="rounded border border-slate-800 bg-[#0A1622] p-3">
                  <p className="text-xs font-semibold text-slate-400">{t("doc_captable")}</p>
                  <p className="mt-1 text-xs text-slate-500">{t("doc_captable_desc")}</p>
                  <a
                    href={`mailto:hello@alparai.com?subject=${encodeURIComponent(`Cap Table Request — ${investorName}`)}`}
                    className="mt-2 block text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    {t("doc_request")}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0F1E2E] p-6">
              <h3 className="mb-2 text-lg font-bold text-white">{t("next_steps_title")}</h3>

              <a
                href={`mailto:hello@alparai.com?subject=${encodeURIComponent(`Investment Discussion — ${investorName} (${investorCompany})`)}`}
                className="text-bg-primary flex items-center justify-between rounded bg-emerald-500 p-3 font-bold transition-colors hover:bg-emerald-600"
              >
                <span>{t("cta_call")}</span>
                <ChevronRight className="h-4 w-4" />
              </a>

              <a
                href={`mailto:hello@alparai.com?subject=${encodeURIComponent(`Document Request — ${investorName} (${investorCompany})`)}`}
                className="flex items-center justify-between rounded border border-slate-800 bg-[#0A1622] p-3 font-semibold text-white transition-colors hover:border-emerald-500/20"
              >
                <span>{t("cta_docs")}</span>
                <ChevronRight className="h-4 w-4 text-emerald-400" />
              </a>

              <a
                href={`mailto:hello@alparai.com?subject=${encodeURIComponent(`Investment Offer — ${investorName} (${investorCompany})`)}`}
                className="flex items-center justify-between rounded border border-slate-800 bg-[#0A1622] p-3 font-semibold text-white transition-colors hover:border-emerald-500/20"
              >
                <span>{t("cta_offer")}</span>
                <ChevronRight className="h-4 w-4 text-emerald-400" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function InvalidTokenView({
  message,
  accessDenied,
  accessHelp,
}: {
  message: string;
  accessDenied: string;
  accessHelp: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1622] p-6 text-[#E2E8F0]">
      <Card className="w-full max-w-md border border-red-500/20 bg-[#0F1E2E] text-center">
        <CardContent className="px-6 py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-white">{accessDenied}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{message}</p>
          <div className="mt-8 border-t border-slate-800 pt-6">
            <p className="text-xs text-slate-500">{accessHelp}</p>
            <a
              href="mailto:hello@alparai.com?subject=Investor Access Renewal Request"
              className="mt-3 inline-block text-sm font-bold text-emerald-400 hover:text-emerald-300"
            >
              hello@alparai.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
