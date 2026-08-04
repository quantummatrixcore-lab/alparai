"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Copy, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { OutreachQueueList } from "@/components/admin/outreach-queue-list";
import type { OutreachQueueItem } from "@/components/admin/outreach-queue-list";
import { triggerOutreachQueueAction } from "@/actions/admin/outreach";
import { toast } from "sonner";

const MEDIA_PITCH = `Subject: Embargoed Aug 2: The EU just delayed AI incident reporting to 2027 — this registry isn't waiting

Hi [First name],

On August 2, the EU AI Act's serious-incident reporting was supposed to become mandatory. The Digital Omnibus quietly pushed it to December 2027 — leaving a 17-month gap in which no public body records AI failures.

On that same date, we're launching the answer: ALPAR AI, an independent, open-source (AGPL) registry where anyone can report an AI incident anonymously in under a minute, providers get a formal right of reply, and every case is classified against the Article 73 taxonomy regulators will eventually enforce.

At launch: 400+ verified incidents across 40+ providers, a live provider response-rate leaderboard, and a founding case worth reading — an AI that invented a corporation and requested the founder's passport.

Happy to share embargoed access, the dataset sample, and founder interview.

[Ad Soyad] — Founder, ALPAR AI · alparai.com · hello@alparai.com`;

const EXPERT_PITCH = `Konu: ALPAR AI — "State of AI Incidents Q4 2026" raporu için ortak yazarlık daveti

Sayın [Unvan Ad Soyad],

[Üniversite]'deki [alan] çalışmalarınızı takip ediyorum. ALPAR AI, kullanıcıların yapay zekâ kaynaklı olayları (halüsinasyon, önyargı, gizlilik ihlali, güvenlik) kanıtlı ve anonim raporladığı, sağlayıcılara resmi yanıt hakkı tanıyan açık kaynaklı bağımsız bir kayıt platformudur. Şu an 400+ doğrulanmış vaka ve AB AI Act Madde 73 taksonomisiyle hizalı bir veri seti barındırıyor.

Çeyreklik "State of AI Incidents" raporumuzun ilk sayısını Q4 2026'da yayımlayacağız ve [alan] bölümü için ortak yazarlık teklif etmek istiyorum. Beklenen katkı çeyrek başına 2-3 saat (vaka doğrulama + kısa yorum); karşılığında ortak yazarlık, veri setine tam araştırma erişimi ve platformdaki "Doğrulayan Uzman" statüsü sunuyoruz. Öğrencileriniz için de vaka analizi çalışmalarına açığız.

15 dakikalık bir görüşme için uygun olur musunuz?

Saygılarımla, 
[Ad Soyad] — Kurucu, ALPAR AI · alparai.com/academy`;

export function OutreachPageContent({ initialQueue }: { initialQueue: OutreachQueueItem[] }) {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<"queue" | "media" | "expert" | "plan">("queue");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [oneDayAgo] = useState(() => new Date(Date.now() - 24 * 3600 * 1000));

  const sentLast24h = initialQueue.filter(
    (x) => x.status === "sent" && x.sent_at && new Date(x.sent_at) >= oneDayAgo,
  ).length;
  const approvedCount = initialQueue.filter((x) => x.status === "approved").length;

  const handleSendNow = async () => {
    setIsSending(true);
    const promise = triggerOutreachQueueAction();
    toast.promise(promise, {
      loading: "Sending outreach emails...",
      success: (res) => {
        if (!res.success) {
          throw new Error(res.error || "Failed to process queue");
        }
        const sent = "sent" in res ? res.sent : 0;
        const failed = "failed" in res ? res.failed : 0;
        return `Successfully sent ${sent} email(s), failed ${failed} email(s).`;
      },
      error: (err) => (err instanceof Error ? err.message : "Error dispatching queue"),
    });

    try {
      await promise;
    } catch (e) {
      logger.error("dispatch queue failed", undefined, e instanceof Error ? e : undefined);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy", undefined, err instanceof Error ? err : undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab("queue")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "queue"
              ? "bg-brand-500/20 text-brand-300 border-brand-500/30 border"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          {t("outreach_queue")}
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "media"
              ? "bg-brand-500/20 text-brand-300 border-brand-500/30 border"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          {t("outreach_media_pitch")}
        </button>
        <button
          onClick={() => setActiveTab("expert")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "expert"
              ? "bg-brand-500/20 text-brand-300 border-brand-500/30 border"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          {t("outreach_expert_invite")}
        </button>
        <button
          onClick={() => setActiveTab("plan")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === "plan"
              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
              : "text-slate-400 hover:bg-white/5 hover:text-white",
          )}
        >
          {t("outreach_strategy")}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "queue" && (
          <div className="space-y-6">
            <Card className="border-white/5 bg-[#0F1E2E]">
              <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Outreach Dispatch Control</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span>
                      Sent (24h): <strong className="text-emerald-400">{sentLast24h} / 50</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Approved & Waiting:{" "}
                      <strong className="text-amber-400">{approvedCount}</strong>
                    </span>
                  </div>
                </div>
                <button
                  disabled={approvedCount === 0 || isSending}
                  onClick={handleSendNow}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-bold shadow-md transition-all",
                    approvedCount === 0 || isSending
                      ? "cursor-not-allowed border border-white/5 bg-slate-800 text-slate-500"
                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95",
                  )}
                >
                  {isSending ? "Sending..." : "Send Approved Now"}
                </button>
              </CardContent>
            </Card>
            <OutreachQueueList initialQueue={initialQueue} />
          </div>
        )}

        {activeTab === "media" && (
          <Card className="border-white/5 bg-[#0F1E2E]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-black/20 pb-4">
              <CardTitle className="text-lg text-emerald-400">
                {t("embargoed_press_pitch_en")}
              </CardTitle>
              <button
                onClick={() => handleCopy(MEDIA_PITCH)}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("outreach_copy_success") : "Copy"}
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                {MEDIA_PITCH}
              </pre>
            </CardContent>
          </Card>
        )}

        {activeTab === "expert" && (
          <Card className="border-white/5 bg-[#0F1E2E]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-black/20 pb-4">
              <CardTitle className="text-lg text-emerald-400">
                {t("academic_expert_invite_tr")}
              </CardTitle>
              <button
                onClick={() => handleCopy(EXPERT_PITCH)}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t("outreach_copy_success") : "Copy"}
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                {EXPERT_PITCH}
              </pre>
              <div className="mt-6 rounded-lg bg-white/5 p-4 text-xs text-slate-400">
                <Info className="text-brand-400 mb-2 h-4 w-4" />
                {t("en_s_r_m_ayn_yap_da_tu_m_nchen_eth_oxfor")}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "plan" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-white/5 bg-[#0F1E2E]">
              <CardHeader className="border-b border-white/5 bg-black/20">
                <CardTitle className="text-brand-300">{t("targeting_strategy")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm text-slate-300">
                <div>
                  <strong className="mb-1 block text-white">{t("expert_invites_this_week")}</strong>
                  <ul className="list-inside list-disc space-y-1 text-slate-400">
                    <li>{t("target_5_people_at_tr_university_ai_ethi")}</li>
                    <li>{t("expected_response_rate_20_40")}</li>
                    <li>{t("value_prop_academic_co_authorship_for_q4")}</li>
                  </ul>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <strong className="mb-1 block text-white">{t("media_outlets_embargoed")}</strong>
                  <ul className="list-inside list-disc space-y-1 text-slate-400">
                    <li>{t("send_window_july_27_29")}</li>
                    <li>{t("too_early_forgotten_too_late_doesn_t_fit")}</li>
                    <li>{t("targets_ai_policy_reporters_techcrunch_a")}</li>
                    <li>{t("newsletters_import_ai_transformer")}</li>
                    <li>{t("tr_tech_press_webrazzi_shiftdelete_corpo")}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="border-b border-emerald-500/10 bg-emerald-500/10">
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Info className="h-5 w-5" />
                  {t("golden_rules")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4 text-sm text-emerald-200/80">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">1.</span>
                    <p>
                      <strong>{t("personalized_first_line")}</strong>{" "}
                      {t("always_send_from_a_personal_address_with")}
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">2.</span>
                    <p>
                      <strong>{t("do_not_guess_emails")}</strong>{" "}
                      {t("find_the_exact_email_or_twitter_dm_from_")}
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
