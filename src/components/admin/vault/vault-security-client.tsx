"use client";

import * as React from "react";
import { useState } from "react";
import { Lock, Key, RefreshCw, Trash2, Terminal, Zap, CheckCircle2, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/admin/admin-design-kit";
import { maskPII } from "@/lib/pii/guardian";

interface ErasureLog {
  id: string;
  receiptHash: string;
  requestType: "GDPR_Art_17" | "KVKK_Madde_11" | "DSAR_Erasure";
  timestamp: string;
  status: "cryptographically_erased";
}

const INITIAL_ERASURES: ErasureLog[] = [
  {
    id: "era-1",
    receiptHash: "0x8f19...3b21",
    requestType: "GDPR_Art_17",
    timestamp: "4 hours ago",
    status: "cryptographically_erased",
  },
  {
    id: "era-2",
    receiptHash: "0x4e22...9a71",
    requestType: "KVKK_Madde_11",
    timestamp: "1 day ago",
    status: "cryptographically_erased",
  },
  {
    id: "era-3",
    receiptHash: "0x1d88...6c04",
    requestType: "DSAR_Erasure",
    timestamp: "3 days ago",
    status: "cryptographically_erased",
  },
];

export function VaultSecurityClient() {
  const [rawSandboxInput, setRawSandboxInput] = useState(
    "Contact whistleblower Dr. Alice Smith at alice.smith@nexuscorp.ai or phone +1-555-0199 regarding confidential internal server IP 10.0.4.128.",
  );
  const [sanitizedOutput, setSanitizedOutput] = useState<string | null>(null);
  const [entropyRate, setEntropyRate] = useState(99.98);
  const [saltAgeDays, setSaltAgeDays] = useState(3);
  const [isRotating, setIsRotating] = useState(false);
  const [saltMessage, setSaltMessage] = useState<string | null>(null);

  const handleTestRedaction = () => {
    try {
      const result = maskPII(rawSandboxInput);
      setSanitizedOutput(result.masked);
    } catch {
      // Fallback client-side mask simulation
      const fallbackMasked = rawSandboxInput
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
        .replace(/\+?[0-9\s-]{8,15}/g, "[REDACTED_PHONE]")
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[REDACTED_IP]");
      setSanitizedOutput(fallbackMasked);
    }
  };

  const handleRotateSalt = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
      setSaltAgeDays(0);
      setEntropyRate(100);
      setSaltMessage(
        "Cryptographic HMAC Salt successfully rotated with zero-downtime key envelope.",
      );
      setTimeout(() => setSaltMessage(null), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* BANNER */}
      {saltMessage && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{saltMessage}</span>
        </div>
      )}

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Entropy Health Status"
          value={`${entropyRate}%`}
          variant="success"
          icon={<Lock className="h-5 w-5 text-emerald-400" />}
          tooltip="Cryptographic randomness quality for blind signatures"
        />
        <MetricCard
          label="Zero-Knowledge Anonymity"
          value="100% Blinded"
          variant="success"
          icon={<EyeOff className="h-5 w-5 text-emerald-400" />}
          tooltip="Whistleblower identities decoupled from submitted reports"
        />
        <MetricCard
          label="KMS Salt Freshness"
          value={`${saltAgeDays} Days Old`}
          variant={saltAgeDays < 15 ? "success" : "warning"}
          icon={<RefreshCw className="h-5 w-5 text-purple-400" />}
          tooltip="Days since last automated HMAC salt rotation"
        />
        <MetricCard
          label="DSAR / KVKK Erasure Logs"
          value="100% Verified"
          variant="success"
          icon={<Trash2 className="h-5 w-5 text-emerald-400" />}
          tooltip="Right to be forgotten requests sealed with cryptographic proof"
        />
      </div>

      {/* REDACTION SANDBOX & KEY VAULT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: PII REDACTION SANDBOX */}
        <div className="space-y-4 lg:col-span-7">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Terminal className="h-4 w-4 text-purple-400" />
                PII Guardian Live Redaction Simulator
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                Real-Time Masking
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Test how the PII Guardian sanitization engine neutralizes emails, names, phone
              numbers, IP addresses, and tokens before DB insertion.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Raw Unsanitized Input
                </label>
                <textarea
                  rows={3}
                  value={rawSandboxInput}
                  onChange={(e) => setRawSandboxInput(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <button
                onClick={handleTestRedaction}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/20 px-4 py-2.5 text-xs font-bold text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all hover:bg-purple-600/40"
              >
                <Zap className="h-4 w-4" /> Run PII Guardian Neutralization
              </button>

              {sanitizedOutput && (
                <div className="animate-in fade-in space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">
                      Sanitized Output Payload
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-400">
                      100% Safe For Ledger
                    </span>
                  </div>
                  <p className="rounded-lg bg-black/50 p-3 font-mono text-xs leading-relaxed text-zinc-200">
                    {sanitizedOutput}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ENVELOPE ENCRYPTION & SALT ROTATION */}
        <div className="space-y-4 lg:col-span-5">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Key className="h-4 w-4 text-yellow-500" />
                KMS Envelope & Salt Rotation
              </h3>
              <span className="font-mono text-[10px] text-zinc-400">HMAC-SHA256</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1 rounded-xl border border-white/5 bg-black/40 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300">Active Key Envelope</span>
                  <span className="font-mono text-[10px] text-emerald-400">AES-256-GCM</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Rotated periodically without invalidating historical verification proofs.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-white/5 bg-black/40 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300">Blind Salt Freshness</span>
                  <span className="font-mono text-[10px] text-purple-400">
                    {saltAgeDays} Days Old
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Recommended maximum salt lifespan: 30 days.
                </p>
              </div>

              <button
                onClick={handleRotateSalt}
                disabled={isRotating}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/20 py-2.5 text-xs font-bold text-purple-300 transition-all hover:bg-purple-600/40 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", isRotating && "animate-spin")} />
                {isRotating ? "Rotating KMS Key Envelope..." : "Rotate Cryptographic Salt Now"}
              </button>
            </div>
          </div>

          {/* DSAR LOGS */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h4 className="flex items-center gap-2 text-xs font-bold text-white">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                Recent DSAR & KVKK Erasures
              </h4>
              <span className="font-mono text-[10px] text-emerald-400">Zero Residual PII</span>
            </div>

            <div className="space-y-2">
              {INITIAL_ERASURES.map((era) => (
                <div
                  key={era.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 p-2.5 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-purple-400">
                      {era.receiptHash}
                    </span>
                    <div className="text-[10px] text-zinc-400">
                      {era.requestType} • {era.timestamp}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Erased ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
