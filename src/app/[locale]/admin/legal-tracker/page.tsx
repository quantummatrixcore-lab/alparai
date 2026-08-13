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
  Scale
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
  { id: 1, institution: "xAI Corp.", recipient: "privacy@x.ai, legal@x.ai", date: "13 Aug 2026", messageId: "f1da1610-fa7a-5f34-5593-9b783b059d74", status: "sent" },
  { id: 2, institution: "KVKK (Turkey)", recipient: "iletisim@kvkk.gov.tr", date: "13 Aug 2026", messageId: "985c8335-ecc2-3d9b-d20b-428c207b1c27", status: "sent" },
  { id: 3, institution: "ICO (UK)", recipient: "casework@ico.org.uk", date: "13 Aug 2026", messageId: "354e9212-bd7c-0cb9-6f7f-ba09e243c6d2", status: "sent" },
  { id: 4, institution: "CNIL (France/EU)", recipient: "webmaster@cnil.fr", date: "13 Aug 2026", messageId: "51db9f32-816e-8d9e-5f7c-d507635f7e10", status: "sent" },
  { id: 5, institution: "EU AI Office", recipient: "ai-office@ec.europa.eu", date: "13 Aug 2026", messageId: "19d55c84-4066-2e4d-2001-cb6492ed5f89", status: "sent" }
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
        return { label: t("status_sent"), className: "bg-warning-500/10 text-warning-400 border-warning-500/20", icon: Clock };
      case "received":
        return { label: t("status_received"), className: "bg-success-500/10 text-success-400 border-success-500/20", icon: CheckCircle2 };
      case "escalated":
        return { label: t("status_escalated"), className: "bg-danger-500/10 text-danger-400 border-danger-500/20", icon: AlertTriangle };
      default:
        return { label: status, className: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: Clock };
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg-primary flex items-center gap-3">
            <Scale className="h-7 w-7 text-brand-400" />
            {t("legal_tracker_title")}
          </h1>
          <p className="text-fg-muted mt-1">{t("legal_tracker_desc")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Case Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 rounded-2xl border border-white/5 bg-bg-secondary/40 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <h2 className="text-lg font-bold text-fg-primary mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger-400" />
            {t("case_summary")}
          </h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">{t("case_id")}</span>
              <span className="text-fg-primary font-medium">#001 — Grok Passport</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1 flex items-center gap-1"><Calendar className="h-3 w-3"/> {t("date")}</span>
              <span className="text-fg-primary font-medium">Ocak 2026</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1 flex items-center gap-1"><Building2 className="h-3 w-3"/> {t("data_controller")}</span>
              <span className="text-fg-primary font-medium">xAI Corp. (Grok v4)</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">{t("violation_type")}</span>
              <span className="text-fg-primary font-medium text-sm">Biyometrik veri - sosyal muhendislik yoluyla pasaport talep ve isleme</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">{t("severity")}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-danger-500/15 text-danger-400 border border-danger-500/20 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                CRITICAL
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1">{t("case_url")}</span>
              <a href="https://alparai.com/en/cases/001-grok-passport" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 text-sm font-medium">
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
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
             <h2 className="text-lg font-bold text-fg-primary mb-2 flex items-center gap-2">
                <Hourglass className="h-5 w-5 text-warning-400" />
                {t("pending_responses")}
              </h2>
          </div>
          
          <div className="rounded-xl border border-white/5 bg-bg-secondary/40 backdrop-blur-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-fg-primary">xAI Corp.</h3>
                <span className="bg-warning-500/10 text-warning-400 border border-warning-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{t("status_sent")}</span>
              </div>
              <p className="text-xs text-fg-muted mb-4">Resmi ihtarname (KVKK Madde 13) cevabi bekleniyor.</p>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
              <div>
                <span className="text-[10px] uppercase text-fg-muted font-bold block mb-0.5">{t("countdown")}</span>
                <span className="text-warning-400 font-mono text-sm font-bold flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> 30 Days Left</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-fg-muted font-bold block mb-0.5">{t("has_response")}</span>
                <span className="text-fg-primary text-sm font-medium">No</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-bg-secondary/40 backdrop-blur-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-fg-primary">KVKK / ICO / CNIL</h3>
                <span className="bg-warning-500/10 text-warning-400 border border-warning-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{t("status_sent")}</span>
              </div>
              <p className="text-xs text-fg-muted mb-4">Veri ihlali bildirimi degerlendirmesi bekleniyor.</p>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
              <div>
                <span className="text-[10px] uppercase text-fg-muted font-bold block mb-0.5">{t("countdown")}</span>
                <span className="text-fg-primary font-mono text-sm font-medium">N/A (Kurum Suresi)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-fg-muted font-bold block mb-0.5">{t("has_response")}</span>
                <span className="text-fg-primary text-sm font-medium">No</span>
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
        className="rounded-2xl border border-white/5 bg-bg-secondary/40 backdrop-blur-xl p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-fg-primary mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-400" />
          {t("legal_action_timeline")}
        </h2>
        
        <div className="relative pl-6 border-l-2 border-white/10 space-y-8">
          
          <div className="relative">
            <div className="absolute -left-[31px] bg-success-500 text-white rounded-full p-1 ring-4 ring-bg-secondary">
              <Check className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-success-400 mb-1">13 Aug 2026</p>
            <p className="text-fg-primary font-medium">xAI'ye resmi ihtarname gonderildi (KVKK Madde 13)</p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[31px] bg-success-500 text-white rounded-full p-1 ring-4 ring-bg-secondary">
              <Check className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-success-400 mb-1">13 Aug 2026</p>
            <p className="text-fg-primary font-medium">KVKK'ya veri ihlali bildirimi yapildi</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-success-500 text-white rounded-full p-1 ring-4 ring-bg-secondary">
              <Check className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-success-400 mb-1">13 Aug 2026</p>
            <p className="text-fg-primary font-medium">ICO, CNIL, EU AI Office'e uluslararasi bildirim</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-warning-500 text-white rounded-full p-1 ring-4 ring-bg-secondary">
              <Hourglass className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-warning-400 mb-1">30 gun (Son: 12 Sep 2026)</p>
            <p className="text-fg-primary font-medium">xAI cevap suresi</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] bg-white/10 text-fg-muted rounded-full p-1 ring-4 ring-bg-secondary">
              <Clock className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-fg-muted mb-1">Beklemede</p>
            <ul className="space-y-1.5 mt-2">
              <li className="text-sm text-fg-secondary flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"/> KVKK e-Devlet formu (kullanici onayi bekleniyor)</li>
              <li className="text-sm text-fg-secondary flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"/> ICO online sikayet formu</li>
              <li className="text-sm text-fg-secondary flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"/> CNIL online sikayet formu</li>
              <li className="text-sm text-fg-secondary flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"/> FTC (ABD) sikayet</li>
              <li className="text-sm text-fg-secondary flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/20"/> EU AI Act ihlal bildirimi (EU AI Office portal)</li>
            </ul>
          </div>

        </div>
      </motion.div>

      {/* 2. Official Notifications Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/5 bg-bg-secondary/40 backdrop-blur-xl shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
           <h2 className="text-lg font-bold text-fg-primary flex items-center gap-2">
            <Send className="h-5 w-5 text-brand-400" />
            {t("official_notifications")}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-fg-muted uppercase tracking-wider whitespace-nowrap">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-fg-muted uppercase tracking-wider whitespace-nowrap">{t("institution")}</th>
                <th className="px-6 py-4 text-xs font-semibold text-fg-muted uppercase tracking-wider whitespace-nowrap">{t("recipient")}</th>
                <th className="px-6 py-4 text-xs font-semibold text-fg-muted uppercase tracking-wider whitespace-nowrap">{t("date")}</th>
                <th className="px-6 py-4 text-xs font-semibold text-fg-muted uppercase tracking-wider whitespace-nowrap">{t("message_id")}</th>
                <th className="px-6 py-4 text-xs font-semibold text-fg-muted uppercase tracking-wider whitespace-nowrap">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {notifications.map((n) => {
                const statusInfo = getStatusConfig(n.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={n.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-muted font-mono">{n.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-fg-primary">{n.institution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-secondary">{n.recipient}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-secondary font-mono">{n.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-fg-muted bg-white/5 px-2 py-1 rounded select-all">{n.messageId}</span>
                        <button 
                          onClick={() => handleCopy(n.messageId)}
                          className="text-fg-muted hover:text-fg-primary p-1.5 rounded transition-colors hover:bg-white/10"
                          title={t("copy_message_id")}
                        >
                          {copiedId === n.messageId ? <Check className="h-3.5 w-3.5 text-success-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide", statusInfo.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
