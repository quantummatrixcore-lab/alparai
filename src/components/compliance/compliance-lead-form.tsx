"use client";

import { useState } from "react";
import { ShieldCheck, Download, CheckCircle2, ArrowRight, Building2, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ComplianceLeadFormProps {
  t: {
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
  };
}

export function ComplianceLeadForm({ t }: ComplianceLeadFormProps) {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [sector, setSector] = useState("banking");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !org) return;

    setLoading(true);
    // Simulate lead capture API processing
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <Card className="via-bg-secondary to-bg-primary border-brand-500/30 relative overflow-hidden bg-gradient-to-b from-blue-950/40 shadow-2xl">
      <div className="bg-brand-500/10 absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full blur-3xl" />
      <CardContent className="p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-brand-500/10 text-brand-400 ring-brand-500/20 flex h-12 w-12 items-center justify-center rounded-2xl ring-1">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-fg-primary text-2xl font-bold tracking-tight">
              {t.leadFormTitle}
            </h3>
            <p className="text-fg-secondary text-sm">{t.leadFormSubtitle}</p>
          </div>
        </div>

        {submitted ? (
          <div className="animate-in fade-in zoom-in-95 border-success-500/30 bg-success-500/10 my-6 rounded-2xl border p-6 text-center">
            <CheckCircle2 className="text-success-400 mx-auto mb-3 h-12 w-12" />
            <h4 className="mb-2 text-lg font-bold text-white">Toolkit Activated</h4>
            <p className="text-success-200/90 text-sm">{t.successMsg}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                className="border-success-500/40 text-success-300 hover:bg-success-500/20"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-fg-muted mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="focus:border-brand-500 focus:ring-brand-500 border-border-subtle w-full rounded-xl border bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:ring-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-fg-muted mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Organization / Financial Institution
                </label>
                <input
                  type="text"
                  required
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder={t.orgPlaceholder}
                  className="focus:border-brand-500 focus:ring-brand-500 border-border-subtle w-full rounded-xl border bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:ring-1 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-fg-muted mb-2 block text-xs font-semibold tracking-wider uppercase">
                {t.sectorLabel}
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSector("banking")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    sector === "banking"
                      ? "border-brand-500 bg-brand-500/20 shadow-brand-500/10 text-white shadow-lg"
                      : "text-fg-muted border-border-subtle hover:border-border-strong hover:text-fg-primary bg-black/30"
                  }`}
                >
                  <Building2 className="text-brand-400 h-4 w-4" />
                  <span>{t.sectorBanking}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSector("telecom")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    sector === "telecom"
                      ? "border-brand-500 bg-brand-500/20 shadow-brand-500/10 text-white shadow-lg"
                      : "text-fg-muted border-border-subtle hover:border-border-strong hover:text-fg-primary bg-black/30"
                  }`}
                >
                  <Radio className="text-accent-400 h-4 w-4" />
                  <span>{t.sectorTelecom}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSector("enterprise")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    sector === "enterprise"
                      ? "border-brand-500 bg-brand-500/20 shadow-brand-500/10 text-white shadow-lg"
                      : "text-fg-muted border-border-subtle hover:border-border-strong hover:text-fg-primary bg-black/30"
                  }`}
                >
                  <ShieldCheck className="text-success-400 h-4 w-4" />
                  <span>{t.sectorEnterprise}</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="from-brand-600 to-brand-600 shadow-brand-600/30 hover:from-brand-500 hover:to-brand-500 hover:shadow-brand-500/40 mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r text-sm font-semibold text-white shadow-lg transition-all"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{t.submitBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
