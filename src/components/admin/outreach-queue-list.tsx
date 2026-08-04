"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, Building2, Send, Clock, User, Plus } from "lucide-react";
import { updateOutreachStatus, createOutreachItem } from "@/actions/admin/outreach";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export interface OutreachQueueItem {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  template_type: "media" | "expert";
  subject: string;
  body_template: string;
  status: "pending" | "approved" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
  company: string | null;
}

export function OutreachQueueList({ initialQueue }: { initialQueue: OutreachQueueItem[] }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "sent" | "failed">(
    "pending",
  );
  const [isPending, startTransition] = useTransition();

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"media" | "expert">("media");

  const filtered = initialQueue.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const handleUpdateStatus = (id: string, status: "pending" | "approved" | "sent" | "failed") => {
    startTransition(async () => {
      const result = await updateOutreachStatus({ id, status });
      if (result.success) {
        toast.success("Outreach status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !body) {
      toast.error("Please fill in email, subject, and body.");
      return;
    }
    startTransition(async () => {
      const result = await createOutreachItem({
        recipient_email: email,
        recipient_name: name || null,
        template_type: type,
        subject,
        body_template: body,
        company: company || null,
      });

      if (result.success) {
        toast.success("Outreach item queued successfully");
        setShowAddForm(false);
        setEmail("");
        setName("");
        setCompany("");
        setSubject("");
        setBody("");
      } else {
        toast.error(result.error || "Failed to queue item");
      }
    });
  };

  const loadTemplate = (selectedType: "media" | "expert") => {
    setType(selectedType);
    if (selectedType === "media") {
      setSubject("Embargoed Aug 2: The EU just delayed AI incident reporting to 2027");
      setBody(`Hi [First name],

On August 2, the EU AI Act's serious-incident reporting was supposed to become mandatory. The Digital Omnibus quietly pushed it to December 2027 — leaving a 17-month gap.

We are launching ALPAR AI (alparai.com) on that same date: an independent, open-source AI incident registry.

Would love to share embargoed access and data.

Best,
Ercüment`);
    } else {
      setSubject("ALPAR AI — State of AI Incidents Q4 2026 Raporu İşbirliği");
      setBody(`Sayın [Unvan Ad Soyad],

[Üniversite]'deki AI etik/güvenlik çalışmalarınızı takip ediyorum. ALPAR AI çeyreklik raporumuzun ilk sayısı için sizi ortak yazarlığa davet etmek istiyorum.

Saygılarımla,
Ercüment`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          {(["pending", "approved", "sent", "failed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                filter === f
                  ? "bg-brand-500/20 text-brand-300 border-brand-500/30 border"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f} ({initialQueue.filter((x) => f === "all" || x.status === f).length})
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) loadTemplate("media");
          }}
          className="bg-brand-500 hover:bg-brand-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("queue_outreach")}
        </button>
      </div>

      {showAddForm && (
        <Card className="border-brand-500/20 bg-[#0F1E2E]">
          <CardHeader>
            <CardTitle className="text-white">{t("queue_new_outreach_campaign_email")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    {t("recipient_email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("editor_techoutlet_com")}
                    className="focus:border-brand-500 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    {t("recipient_name")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("jane_doe")}
                    className="focus:border-brand-500 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    {t("company_outlet")}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t("the_verge")}
                    className="focus:border-brand-500 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-400">
                    {t("template_type")}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => loadTemplate("media")}
                      className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                        type === "media"
                          ? "bg-brand-500 text-white"
                          : "bg-black/40 text-slate-400 hover:bg-black/60"
                      }`}
                    >
                      {t("media_pitch")}
                    </button>
                    <button
                      type="button"
                      onClick={() => loadTemplate("expert")}
                      className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                        type === "expert"
                          ? "bg-brand-500 text-white"
                          : "bg-black/40 text-slate-400 hover:bg-black/60"
                      }`}
                    >
                      {t("expert_invite")}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  {t("subject")}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("embargoed_aug_2")}
                  className="focus:border-brand-500 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  {t("body_template")}
                </label>
                <textarea
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t("write_message_template_here")}
                  className="focus:border-brand-500 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  disabled={isPending}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" variant="primary" isLoading={isPending}>
                  {t("add_to_queue")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-fg-muted rounded-xl border border-white/10 bg-black/20 py-12 text-center">
            {t("no_outreach_items_found_in_this_filter")}
          </div>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="border-white/10 bg-black/40 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="flex items-center gap-1.5 text-lg font-bold text-white">
                      <Mail className="text-brand-400 h-5 w-5" />
                      {item.recipient_email}
                    </h3>
                    <Badge
                      variant={
                        item.status === "sent"
                          ? "success"
                          : item.status === "failed"
                            ? "danger"
                            : item.status === "approved"
                              ? "brand"
                              : "warning"
                      }
                    >
                      {item.status}
                    </Badge>
                    <span className="text-fg-muted flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(new Date(item.created_at), locale)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                    {item.recipient_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4 text-slate-500" />
                        {item.recipient_name}
                      </span>
                    )}
                    {item.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        {item.company}
                      </span>
                    )}
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-400">
                      {t("template")}
                      {item.template_type}
                    </span>
                  </div>

                  <div className="rounded border border-white/5 bg-black/20 p-3">
                    <div className="mb-2 text-xs font-semibold text-slate-400">
                      {t("subject")}
                      {item.subject}
                    </div>
                    <pre className="font-sans text-xs whitespace-pre-wrap text-slate-300">
                      {item.body_template.slice(0, 200)}
                      {item.body_template.length > 200 ? "..." : ""}
                    </pre>
                  </div>

                  {item.sent_at && (
                    <div className="text-fg-muted text-xs">
                      {t("sent_at")}
                      {new Date(item.sent_at).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-end md:self-start">
                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      variant="success"
                      leftIcon={<Check className="h-3.5 w-3.5" />}
                      isLoading={isPending}
                      onClick={() => handleUpdateStatus(item.id, "approved")}
                    >
                      {t("approve")}
                    </Button>
                  )}
                  {item.status === "approved" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<X className="h-3.5 w-3.5" />}
                      isLoading={isPending}
                      onClick={() => handleUpdateStatus(item.id, "pending")}
                    >
                      {t("hold")}
                    </Button>
                  )}
                  {item.status === "failed" && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Send className="h-3.5 w-3.5" />}
                      isLoading={isPending}
                      onClick={() => handleUpdateStatus(item.id, "approved")}
                    >
                      {t("retry_approve")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
