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
    <Card className="via-bg-secondary to-bg-primary relative overflow-hidden border-blue-500/30 bg-gradient-to-b from-blue-950/40 shadow-2xl">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
      <CardContent className="p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-fg-primary text-2xl font-bold tracking-tight">{t.leadFormTitle}</h3>
            <p className="text-fg-secondary text-sm">{t.leadFormSubtitle}</p>
          </div>
        </div>

        {submitted ? (
          <div className="animate-in fade-in zoom-in-95 my-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
            <h4 className="mb-2 text-lg font-bold text-white">Toolkit Activated</h4>
            <p className="text-sm text-emerald-200/90">{t.successMsg}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
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
                <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  Organization / Financial Institution
                </label>
                <input
                  type="text"
                  required
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder={t.orgPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {t.sectorLabel}
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSector("banking")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    sector === "banking"
                      ? "border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/10"
                      : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20 hover:text-gray-200"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>{t.sectorBanking}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSector("telecom")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    sector === "telecom"
                      ? "border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/10"
                      : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20 hover:text-gray-200"
                  }`}
                >
                  <Radio className="h-4 w-4 text-cyan-400" />
                  <span>{t.sectorTelecom}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSector("enterprise")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    sector === "enterprise"
                      ? "border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/10"
                      : "border-white/10 bg-black/30 text-gray-400 hover:border-white/20 hover:text-gray-200"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>{t.sectorEnterprise}</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40"
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
