"use client";

import * as React from "react";
import { useState } from "react";
import {
  Key,
  Plus,
  Shield,
  Activity,
  Copy,
  CheckCircle2,
  Trash2,
  Lock,
  Globe,
  Radio,
  Zap,
  Clock,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/admin/admin-design-kit";

interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  tier: "enterprise_threat" | "regulator_oversight" | "academic_research";
  rateLimit: string;
  monthlyQuota: string;
  usedQuota: string;
  ipWhitelist: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

const INITIAL_KEYS: ApiKeyRecord[] = [
  {
    id: "key-1",
    name: "FinTech Global Risk Core",
    keyPrefix: "alp_live_9f82...7a1",
    tier: "enterprise_threat",
    rateLimit: "10,000 req/min",
    monthlyQuota: "5,000,000",
    usedQuota: "1,842,000 (36%)",
    ipWhitelist: "194.28.112.0/24",
    createdAt: "2026-01-15",
    lastUsed: "2 mins ago",
    status: "active",
  },
  {
    id: "key-2",
    name: "EU AI Safety Observatory",
    keyPrefix: "alp_live_3c14...e92",
    tier: "regulator_oversight",
    rateLimit: "2,500 req/min",
    monthlyQuota: "1,000,000",
    usedQuota: "412,000 (41%)",
    ipWhitelist: "82.165.197.45",
    createdAt: "2026-02-01",
    lastUsed: "14 mins ago",
    status: "active",
  },
  {
    id: "key-3",
    name: "Stanford AI Alignment Lab",
    keyPrefix: "alp_live_7b55...82d",
    tier: "academic_research",
    rateLimit: "500 req/min",
    monthlyQuota: "250,000",
    usedQuota: "98,000 (39%)",
    ipWhitelist: "171.64.0.0/16",
    createdAt: "2026-02-10",
    lastUsed: "1 hour ago",
    status: "active",
  },
];

export function EnterpriseApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(INITIAL_KEYS);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTier, setNewKeyTier] = useState<ApiKeyRecord["tier"]>("enterprise_threat");
  const [newKeyIp, setNewKeyIp] = useState("0.0.0.0/0");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedPlainKey, setGeneratedPlainKey] = useState<string | null>(null);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const plainSecret = `alp_live_${Math.random().toString(36).substring(2, 12)}_${randomSuffix}`;

    const newRecord: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      keyPrefix: `alp_live_${plainSecret.substring(9, 13)}...${plainSecret.substring(plainSecret.length - 3)}`,
      tier: newKeyTier,
      rateLimit:
        newKeyTier === "enterprise_threat"
          ? "10,000 req/min"
          : newKeyTier === "regulator_oversight"
            ? "2,500 req/min"
            : "500 req/min",
      monthlyQuota:
        newKeyTier === "enterprise_threat"
          ? "5,000,000"
          : newKeyTier === "regulator_oversight"
            ? "1,000,000"
            : "250,000",
      usedQuota: "0 (0%)",
      ipWhitelist: newKeyIp || "0.0.0.0/0",
      createdAt: new Date().toISOString().split("T")[0] as string,
      lastUsed: "Just created",
      status: "active",
    };

    setKeys([newRecord, ...keys]);
    setGeneratedPlainKey(plainSecret);
    setNewKeyName("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
  };

  return (
    <div className="space-y-6">
      {/* TOP TELEMETRY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="24h Risk API Request Volume"
          value="842,000 Reqs"
          variant="success"
          icon={<Radio className="h-5 w-5 text-emerald-400" />}
          tooltip="Total programmatic risk feed queries delivered"
        />
        <MetricCard
          label="p95 Global API Latency"
          value="14ms"
          variant="success"
          icon={<Zap className="h-5 w-5 text-emerald-400" />}
          tooltip="Edge cache response speed via Frankfurt/Amsterdam"
        />
        <MetricCard
          label="Active Enterprise API Keys"
          value={keys.filter((k) => k.status === "active").length}
          variant="default"
          icon={<Key className="h-5 w-5 text-purple-400" />}
          tooltip="Provisioned keys under active SHA-256 HMAC authentication"
        />
        <MetricCard
          label="HTTP Error Rate"
          value="0.01%"
          variant="success"
          icon={<Activity className="h-5 w-5 text-emerald-400" />}
          tooltip="Uptime reliability index"
        />
      </div>

      {/* NEW KEY MODAL BANNER */}
      {generatedPlainKey && (
        <div className="animate-in fade-in space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              API Key Generated Successfully
            </div>
            <button
              onClick={() => setGeneratedPlainKey(null)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-zinc-300">
            Please copy your secret key now. You will not be able to see it again!
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-black/60 p-3">
            <code className="flex-1 font-mono text-xs text-emerald-400">{generatedPlainKey}</code>
            <button
              onClick={() => handleCopy(generatedPlainKey)}
              className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/30"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedKey === generatedPlainKey ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* CREATE KEY & ROSTER */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: PROVISION FORM */}
        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Plus className="h-4 w-4 text-purple-400" />
                Provision B2B Risk Key
              </h3>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Organization / Client Name
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Acme AI Safety Team"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  Tier Plan & Quota
                </label>
                <select
                  value={newKeyTier}
                  onChange={(e) => setNewKeyTier(e.target.value as ApiKeyRecord["tier"])}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="enterprise_threat">
                    Enterprise Threat Radar (10,000 req/min)
                  </option>
                  <option value="regulator_oversight">
                    Regulator & Government (2,500 req/min)
                  </option>
                  <option value="academic_research">Academic & Research (500 req/min)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">
                  IP CIDR Whitelist
                </label>
                <input
                  type="text"
                  value={newKeyIp}
                  onChange={(e) => setNewKeyIp(e.target.value)}
                  placeholder="0.0.0.0/0 (or specific IP)"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/30 py-2.5 text-xs font-bold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all hover:bg-purple-600/50"
              >
                <Key className="h-4 w-4" /> Generate SHA-256 API Key
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: KEYS TABLE */}
        <div className="space-y-4 lg:col-span-8">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Lock className="h-4 w-4 text-emerald-400" />
                Active B2B Risk API Keys
              </h3>
              <span className="font-mono text-[11px] text-zinc-400">{keys.length} Total Keys</span>
            </div>

            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className={cn(
                    "flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between",
                    k.status === "active"
                      ? "border-white/5 bg-black/30 hover:border-white/10"
                      : "border-rose-500/20 bg-rose-500/5 opacity-60",
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{k.name}</span>
                      <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 uppercase">
                        {k.tier.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                      <span>{k.keyPrefix}</span>
                      <span>•</span>
                      <span>
                        Rate: <strong className="text-zinc-200">{k.rateLimit}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Quota: <strong className="text-zinc-200">{k.usedQuota}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {k.status === "active" ? (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
                      >
                        Revoke Key
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-rose-400">Revoked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
