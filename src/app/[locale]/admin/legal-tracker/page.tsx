"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Calendar,
  Building2,
  AlertTriangle,
  Link as LinkIcon,
  Send,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Hourglass,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  institution: string;
  recipient: string;
  date: string;
  messageId: string;
  status: "sent" | "received" | "escalated";
}

const notifications: Notification[] = [
  {
    id: 1,
    institution: "xAI Corp.",
    recipient: "privacy@x.ai, legal@x.ai",
    date: "13 Aug 2026",
    messageId: "f1da1610-fa7a-5f34-5593-9b783b059d74",
    status: "sent",
  },
  {
    id: 2,
    institution: "KVKK (Turkey)",
    recipient: "iletisim@kvkk.gov.tr",
    date: "13 Aug 2026",
    messageId: "985c8335-ecc2-3d9b-d20b-428c207b1c27",
    status: "sent",
  },
  {
    id: 3,
    institution: "ICO (UK)",
    recipient: "casework@ico.org.uk",
    date: "13 Aug 2026",
    messageId: "354e9212-bd7c-0cb9-6f7f-ba09e243c6d2",
    status: "sent",
  },
  {
    id: 4,
    institution: "CNIL (France/EU)",
    recipient: "webmaster@cnil.fr",
    date: "13 Aug 2026",
    messageId: "51db9f32-816e-8d9e-5f7c-d507635f7e10",
    status: "sent",
  },
  {
    id: 5,
    institution: "EU AI Office",
    recipient: "ai-office@ec.europa.eu",
    date: "13 Aug 2026",
    messageId: "19d55c84-4066-2e4d-2001-cb6492ed5f89",
    status: "sent",
  },
];

export default function LegalTrackerPage() {
  const t = useTranslations("admin");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusConfig = (status: Notification["status"]) => {
    switch (status) {
      case "sent":
        return {
          label: t("status_sent"),
          className: "bg-warning-500/10 text-warning-400 border-warning-500/20",
          icon: Clock,
        };
      case "received":
        return {
          label: t("status_received"),
          className: "bg-success-500/10 text-success-400 border-success-500/20",
          icon: CheckCircle2,
        };
      case "escalated":
        return {
          label: t("status_escalated"),
          className: "bg-danger-500/10 text-danger-400 border-danger-500/20",
          icon: AlertTriangle,
        };
      default:
        return {
          label: status,
          className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
          icon: Clock,
        };
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-fg-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
            <Scale className="text-brand-400 h-7 w-7" />
            {t("legal_tracker_title")}
          </h1>
          <p className="text-fg-muted mt-1">{t("legal_tracker_desc")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Case Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-secondary/40 relative overflow-hidden rounded-2xl border border-white/5 p-6 shadow-xl backdrop-blur-xl lg:col-span-1"
        >
          <div className="bg-danger-500/10 pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-3xl" />

          <h2 className="text-fg-primary mb-4 flex items-center gap-2 text-lg font-bold">
            <ShieldAlert className="text-danger-400 h-5 w-5" />
            {t("case_summary")}
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-fg-muted mb-1 block text-xs font-semibold tracking-wider uppercase">
                {t("case_id")}
              </span>
              <span className="text-fg-primary font-medium">#001 — Grok Passport</span>
            </div>
            <div>
              <span className="text-fg-muted mb-1 block flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Calendar className="h-3 w-3" /> {t("date")}
              </span>
              <span className="text-fg-primary font-medium">
                {t("case_date_jan_2026") || "Ocak 2026"}
              </span>
            </div>
            <div>
              <span className="text-fg-muted mb-1 block flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Building2 className="h-3 w-3" /> {t("data_controller")}
              </span>
              <span className="text-fg-primary font-medium">xAI Corp. (Grok v4)</span>
            </div>
            <div>
              <span className="text-fg-muted mb-1 block text-xs font-semibold tracking-wider uppercase">
                {t("violation_type")}
              </span>
              <span className="text-fg-primary text-sm font-medium">
                {t("case_violation_desc") ||
                  "Biyometrik veri - sosyal muhendislik yoluyla pasaport talep ve isleme"}
              </span>
            </div>
            <div>
              <span className="text-fg-muted mb-1 block text-xs font-semibold tracking-wider uppercase">
                {t("severity")}
              </span>
              <span className="bg-danger-500/15 text-danger-400 border-danger-500/20 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                CRITICAL
              </span>
            </div>
            <div>
              <span className="text-fg-muted mb-1 block text-xs font-semibold tracking-wider uppercase">
                {t("case_url")}
              </span>
              <a
                href="https://alparai.com/en/cases/001-grok-passport"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                https://alparai.com/en/cases/001-grok-passport
              </a>
            </div>
          </div>
        </motion.div>

        {/* 4. Pending Responses Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2"
        >
          <div className="md:col-span-2">
            <h2 className="text-fg-primary mb-2 flex items-center gap-2 text-lg font-bold">
              <Hourglass className="text-warning-400 h-5 w-5" />
              {t("pending_responses")}
            </h2>
          </div>

          <div className="bg-bg-secondary/40 flex flex-col justify-between rounded-xl border border-white/5 p-5 backdrop-blur-md">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-fg-primary font-bold">xAI Corp.</h3>
                <span className="bg-warning-500/10 text-warning-400 border-warning-500/20 rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                  {t("status_sent")}
                </span>
              </div>
              <p className="text-fg-muted mb-4 text-xs">
                {t("pending_xai_desc") || "Resmi ihtarname (KVKK Madde 13) cevabi bekleniyor."}
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <span className="text-fg-muted mb-0.5 block text-[10px] font-bold uppercase">
                  {t("countdown")}
                </span>
                <span className="text-warning-400 flex items-center gap-1.5 font-mono text-sm font-bold">
                  <Clock className="h-3.5 w-3.5" /> {t("days_left_30") || "30 Days Left"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-fg-muted mb-0.5 block text-[10px] font-bold uppercase">
                  {t("has_response")}
                </span>
                <span className="text-fg-primary text-sm font-medium">{t("no") || "No"}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-secondary/40 flex flex-col justify-between rounded-xl border border-white/5 p-5 backdrop-blur-md">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-fg-primary font-bold">KVKK / ICO / CNIL</h3>
                <span className="bg-warning-500/10 text-warning-400 border-warning-500/20 rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                  {t("status_sent")}
                </span>
              </div>
              <p className="text-fg-muted mb-4 text-xs">
                {t("pending_institutions_desc") ||
                  "Veri ihlali bildirimi degerlendirmesi bekleniyor."}
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <span className="text-fg-muted mb-0.5 block text-[10px] font-bold uppercase">
                  {t("countdown")}
                </span>
                <span className="text-fg-primary font-mono text-sm font-medium">
                  {t("institutional_timeline") || "N/A (Kurum Suresi)"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-fg-muted mb-0.5 block text-[10px] font-bold uppercase">
                  {t("has_response")}
                </span>
                <span className="text-fg-primary text-sm font-medium">{t("no") || "No"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Legal Action Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-xl backdrop-blur-xl"
      >
        <h2 className="text-fg-primary mb-6 flex items-center gap-2 text-lg font-bold">
          <Calendar className="text-brand-400 h-5 w-5" />
          {t("legal_action_timeline")}
        </h2>

        <div className="relative space-y-8 border-l-2 border-white/10 pl-6">
          <div className="relative">
            <div className="bg-success-500 ring-bg-secondary absolute -left-[31px] rounded-full p-1 text-white ring-4">
              <Check className="h-3 w-3" />
            </div>
            <p className="text-success-400 mb-1 text-sm font-bold">13 Aug 2026</p>
            <p className="text-fg-primary font-medium">
              {t("timeline_notice_sent") || "xAI'ye resmi ihtarname gonderildi (KVKK Madde 13)"}
            </p>
          </div>

          <div className="relative">
            <div className="bg-success-500 ring-bg-secondary absolute -left-[31px] rounded-full p-1 text-white ring-4">
              <Check className="h-3 w-3" />
            </div>
            <p className="text-success-400 mb-1 text-sm font-bold">13 Aug 2026</p>
            <p className="text-fg-primary font-medium">
              {t("timeline_kvkk_notified") || "KVKK'ya veri ihlali bildirimi yapildi"}
            </p>
          </div>

          <div className="relative">
            <div className="bg-success-500 ring-bg-secondary absolute -left-[31px] rounded-full p-1 text-white ring-4">
              <Check className="h-3 w-3" />
            </div>
            <p className="text-success-400 mb-1 text-sm font-bold">13 Aug 2026</p>
            <p className="text-fg-primary font-medium">
              {t("timeline_international_notified") ||
                "ICO, CNIL, EU AI Office'e uluslararasi bildirim"}
            </p>
          </div>

          <div className="relative">
            <div className="bg-warning-500 ring-bg-secondary absolute -left-[31px] rounded-full p-1 text-white ring-4">
              <Hourglass className="h-3 w-3" />
            </div>
            <p className="text-warning-400 mb-1 text-sm font-bold">
              {t("timeline_xai_deadline") || "30 gun (Son: 12 Sep 2026)"}
            </p>
            <p className="text-fg-primary font-medium">
              {t("timeline_xai_response_time") || "xAI cevap suresi"}
            </p>
          </div>

          <div className="relative">
            <div className="text-fg-muted ring-bg-secondary absolute -left-[31px] rounded-full bg-white/10 p-1 ring-4">
              <Clock className="h-3 w-3" />
            </div>
            <p className="text-fg-muted mb-1 text-sm font-bold">
              {t("timeline_pending") || "Beklemede"}
            </p>
            <ul className="mt-2 space-y-1.5">
              <li className="text-fg-secondary flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />{" "}
                {t("timeline_action_kvkk_edevlet") ||
                  "KVKK e-Devlet formu (kullanici onayi bekleniyor)"}
              </li>
              <li className="text-fg-secondary flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />{" "}
                {t("timeline_action_ico_form") || "ICO online sikayet formu"}
              </li>
              <li className="text-fg-secondary flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />{" "}
                {t("timeline_action_cnil_form") || "CNIL online sikayet formu"}
              </li>
              <li className="text-fg-secondary flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />{" "}
                {t("timeline_action_ftc") || "FTC (ABD) sikayet"}
              </li>
              <li className="text-fg-secondary flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />{" "}
                {t("timeline_action_eu_ai_act") ||
                  "EU AI Act ihlal bildirimi (EU AI Office portal)"}
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* 2. Official Notifications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-bg-secondary/40 overflow-hidden rounded-2xl border border-white/5 shadow-xl backdrop-blur-xl"
      >
        <div className="border-b border-white/5 p-6">
          <h2 className="text-fg-primary flex items-center gap-2 text-lg font-bold">
            <Send className="text-brand-400 h-5 w-5" />
            {t("official_notifications")}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-fg-muted px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  #
                </th>
                <th className="text-fg-muted px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  {t("institution")}
                </th>
                <th className="text-fg-muted px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  {t("recipient")}
                </th>
                <th className="text-fg-muted px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  {t("date")}
                </th>
                <th className="text-fg-muted px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  {t("message_id")}
                </th>
                <th className="text-fg-muted px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap uppercase">
                  {t("status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {notifications.map((n) => {
                const statusInfo = getStatusConfig(n.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={n.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="text-fg-muted px-6 py-4 font-mono text-sm whitespace-nowrap">
                      {n.id}
                    </td>
                    <td className="text-fg-primary px-6 py-4 text-sm font-semibold whitespace-nowrap">
                      {n.institution}
                    </td>
                    <td className="text-fg-secondary px-6 py-4 text-sm whitespace-nowrap">
                      {n.recipient}
                    </td>
                    <td className="text-fg-secondary px-6 py-4 font-mono text-sm whitespace-nowrap">
                      {n.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-fg-muted rounded bg-white/5 px-2 py-1 font-mono text-xs select-all">
                          {n.messageId}
                        </span>
                        <button
                          onClick={() => handleCopy(n.messageId)}
                          className="text-fg-muted hover:text-fg-primary rounded p-1.5 transition-colors hover:bg-white/10"
                          title={t("copy_message_id")}
                        >
                          {copiedId === n.messageId ? (
                            <Check className="text-success-400 h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                          statusInfo.className,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
