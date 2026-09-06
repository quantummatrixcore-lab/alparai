"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Building2,
  Radio,
  CheckCircle2,
  Download,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Square,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ChecklistItemData {
  id: string;
  article: string;
  title: string;
  desc: string;
  sector: "banking" | "telecom" | "both";
  category: string;
}

export interface ComplianceChecklistClientProps {
  t: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    bankingTab: string;
    telecomTab: string;
    bankingTitle: string;
    bankingDesc: string;
    telecomTitle: string;
    telecomDesc: string;
    checklistHeading: string;
    checklistSubheading: string;
    statWindow: string;
    statWindowLabel: string;
    statFine: string;
    statFineLabel: string;
    statRetention: string;
    statRetentionLabel: string;
    leadFormTitle: string;
    leadFormSubtitle: string;
    emailPlaceholder: string;
    orgPlaceholder: string;
    sectorLabel: string;
    sectorBanking: string;
    sectorTelecom: string;
    sectorEnterprise: string;
    submitBtn: string;
    successMsg: string;
    bottomCtaTitle: string;
    bottomCtaDesc: string;
    bottomCtaButton: string;
  };
  items: ChecklistItemData[];
}

export function ComplianceChecklistClient({ t, items }: ComplianceChecklistClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "banking" | "telecom">("all");
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [selectedSector, setSelectedSector] = useState("banking");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.sector === "both" || item.sector === activeTab;
  });

  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !org) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-16">
      {/* Sector Framework Selector */}
      <div className="mx-auto max-w-4xl">
        <div className="border-border-subtle flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-white/5 p-2 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "all"
                ? "bg-brand-600 shadow-brand-500/25 text-white shadow-lg"
                : "text-fg-muted hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>All Banking & Telecom</span>
          </button>
          <button
            onClick={() => setActiveTab("banking")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "banking"
                ? "bg-brand-600 shadow-brand-500/25 text-white shadow-lg"
                : "text-fg-muted hover:text-white"
            }`}
          >
            <Building2 className="text-accent-400 h-4 w-4" />
            <span>{t.bankingTab}</span>
          </button>
          <button
            onClick={() => setActiveTab("telecom")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "telecom"
                ? "bg-brand-600 shadow-brand-500/25 text-white shadow-lg"
                : "text-fg-muted hover:text-white"
            }`}
          >
            <Radio className="text-success-400 h-4 w-4" />
            <span>{t.telecomTab}</span>
          </button>
        </div>

        {/* Dynamic Sector Callout Card */}
        <div className="mt-6">
          {activeTab === "banking" && (
            <Card className="border-accent-500/30 bg-cyan-950/20 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-accent-500/10 text-accent-400 ring-accent-500/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.bankingTitle}</h3>
                    <p className="text-accent-200/80 mt-1 text-sm leading-relaxed">
                      {t.bankingDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "telecom" && (
            <Card className="border-success-500/30 bg-emerald-950/20 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-success-500/10 text-success-400 ring-success-500/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1">
                    <Radio className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.telecomTitle}</h3>
                    <p className="text-success-200/80 mt-1 text-sm leading-relaxed">
                      {t.telecomDesc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Readiness Interactive Tracker */}
      <Card className="bg-bg-elevated/60 border-border-subtle backdrop-blur-xl">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-brand-400 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="h-4 w-4" />
                Interactive Readiness Audit Tracker
              </div>
              <h3 className="mt-1 text-xl font-bold text-white">
                Completed: {completedCount} / {items.length} Article 73 Safeguards
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="ring-border-subtle h-3 w-40 overflow-hidden rounded-full bg-black/40 ring-1">
                <div
                  className="from-brand-500 to-success-400 h-full bg-gradient-to-r transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-success-400 text-sm font-bold">{progressPercent}% Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12-Point Checklist Grid */}
      <div>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {t.checklistHeading}
          </h2>
          <p className="text-fg-muted mx-auto mt-2 max-w-2xl text-sm sm:text-base">
            {t.checklistSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <Card
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`group cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                  isChecked
                    ? "border-success-500/40 ring-success-500/30 bg-emerald-950/20 ring-1"
                    : "bg-bg-elevated/40 hover:border-brand-500/30 hover:bg-bg-elevated/80 border-border-subtle"
                }`}
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="border-brand-500/20 bg-brand-500/10 text-brand-400 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold">
                      {item.article}
                    </span>
                    <button
                      type="button"
                      aria-label="Toggle completed"
                      className="text-fg-muted transition-colors group-hover:text-white"
                    >
                      {isChecked ? (
                        <CheckSquare className="text-success-400 h-5 w-5" />
                      ) : (
                        <Square className="text-fg-disabled h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <h4
                    className={`text-base font-bold transition-colors ${
                      isChecked
                        ? "text-success-200 line-through decoration-emerald-500/50"
                        : "group-hover:text-brand-300 text-white"
                    }`}
                  >
                    {item.title}
                  </h4>

                  <p className="text-fg-muted mt-2 text-xs leading-relaxed">{item.desc}</p>

                  <div className="border-border-subtle/50 mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-fg-disabled text-[11px] font-medium">
                      {item.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        item.sector === "banking"
                          ? "text-accent-400"
                          : item.sector === "telecom"
                            ? "text-success-400"
                            : "text-brand-400"
                      }`}
                    >
                      {item.sector === "banking"
                        ? "Banking"
                        : item.sector === "telecom"
                          ? "Telecom"
                          : "Banking & Telecom"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lead Magnet Capture Form Section */}
      <Card className="border-brand-500/30 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950 shadow-2xl">
        <div className="bg-brand-500/10 absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full blur-3xl" />
        <CardContent className="p-8 lg:p-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <div className="bg-brand-500/10 text-brand-400 ring-brand-500/30 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1">
                <Download className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
                {t.leadFormTitle}
              </h3>
              <p className="text-fg-secondary mt-2 text-sm sm:text-base">{t.leadFormSubtitle}</p>
            </div>

            {submitted ? (
              <div className="animate-in fade-in zoom-in-95 border-success-500/30 bg-success-500/10 rounded-2xl border p-8 text-center backdrop-blur-md">
                <CheckCircle2 className="text-success-400 mx-auto mb-4 h-14 w-14" />
                <h4 className="mb-2 text-xl font-bold text-white">Compliance Toolkit Dispatched</h4>
                <p className="text-success-200 mx-auto max-w-md text-sm">{t.successMsg}</p>
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    className="border-success-500/40 text-success-300 hover:bg-success-500/20"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-fg-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="focus:border-brand-500 focus:ring-brand-500 border-border-subtle w-full rounded-xl border bg-black/60 px-4 py-3.5 text-sm text-white placeholder-gray-500 transition-all focus:ring-1 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-fg-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                      Institution / Telecom Name
                    </label>
                    <input
                      type="text"
                      required
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder={t.orgPlaceholder}
                      className="focus:border-brand-500 focus:ring-brand-500 border-border-subtle w-full rounded-xl border bg-black/60 px-4 py-3.5 text-sm text-white placeholder-gray-500 transition-all focus:ring-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-fg-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    {t.sectorLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSector("banking")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-semibold transition-all ${
                        selectedSector === "banking"
                          ? "border-brand-500 bg-brand-500/20 shadow-brand-500/20 text-white shadow-lg"
                          : "text-fg-muted border-border-subtle hover:border-border-strong hover:text-fg-primary bg-black/40"
                      }`}
                    >
                      <Building2 className="text-accent-400 h-4 w-4" />
                      <span>{t.sectorBanking}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSector("telecom")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-semibold transition-all ${
                        selectedSector === "telecom"
                          ? "border-brand-500 bg-brand-500/20 shadow-brand-500/20 text-white shadow-lg"
                          : "text-fg-muted border-border-subtle hover:border-border-strong hover:text-fg-primary bg-black/40"
                      }`}
                    >
                      <Radio className="text-success-400 h-4 w-4" />
                      <span>{t.sectorTelecom}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSector("enterprise")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-semibold transition-all ${
                        selectedSector === "enterprise"
                          ? "border-brand-500 bg-brand-500/20 shadow-brand-500/20 text-white shadow-lg"
                          : "text-fg-muted border-border-subtle hover:border-border-strong hover:text-fg-primary bg-black/40"
                      }`}
                    >
                      <ShieldAlert className="text-brand-400 h-4 w-4" />
                      <span>{t.sectorEnterprise}</span>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="from-brand-600 via-brand-600 to-brand-600 shadow-brand-600/30 hover:from-brand-500 hover:to-brand-500 hover:shadow-brand-500/40 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r text-base font-bold text-white shadow-xl transition-all"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating Toolkit PDF...
                    </span>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>{t.submitBtn}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Enterprise CTA Banner */}
      <Card className="border-brand-500/20 bg-bg-elevated/80 backdrop-blur-md">
        <CardContent className="p-8 text-center sm:p-10">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            {t.bottomCtaTitle}
          </h3>
          <p className="text-fg-secondary mx-auto mt-2 max-w-2xl text-sm sm:text-base">
            {t.bottomCtaDesc}
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-slate-950 hover:bg-gray-100"
            >
              <span>{t.bottomCtaButton}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
