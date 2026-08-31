"use client";

import React, { useState } from "react";
import { KeyRound, Plus, Copy, Check, Code, Terminal, Send, Zap, X } from "lucide-react";
import { StatusBadge } from "@/components/admin-core/status-badge";
import { type B2BEnterpriseApiKey } from "@/types/admin";

const defaultApiKeys: B2BEnterpriseApiKey[] = [
  {
    id: "key-01",
    organizationName: "Allianz AI Risk Solutions",
    keyPrefix: "alp_live_9a8f2c1e...",
    clientTier: "TIER_2_ENTERPRISE",
    requestQuotaMonthly: 250000,
    requestsThisMonth: 184200,
    monthlyRateUsd: 5000,
    activeStatus: "ACTIVE",
    lastUsedAt: "2 dk önce",
    createdDate: "2026-06-01",
    feedEndpoints: ["/api/v1/threat-intel", "/api/v1/incidents/stream"],
  },
  {
    id: "key-02",
    organizationName: "Swiss Re Underwriting Labs",
    keyPrefix: "alp_live_7c4d1a9b...",
    clientTier: "TIER_3_INSTITUTIONAL",
    requestQuotaMonthly: 1000000,
    requestsThisMonth: 642100,
    monthlyRateUsd: 8500,
    activeStatus: "ACTIVE",
    lastUsedAt: "10 sn önce",
    createdDate: "2026-05-15",
    feedEndpoints: ["/api/v1/eu-compliance", "/api/v1/incidents/stream"],
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<B2BEnterpriseApiKey[]>(defaultApiKeys);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [selectedKeyForCurl, setSelectedKeyForCurl] = useState<B2BEnterpriseApiKey | null>(
    defaultApiKeys[0] || null,
  );
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [clientTier, setClientTier] = useState<
    "TIER_1_GROWTH" | "TIER_2_ENTERPRISE" | "TIER_3_INSTITUTIONAL"
  >("TIER_2_ENTERPRISE");
  const [requestQuotaMonthly, setRequestQuotaMonthly] = useState("50000");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName) return;

    const randomSecret = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 36).toString(36),
    ).join("");
    const newKeyObj: B2BEnterpriseApiKey = {
      id: `key-${Date.now()}`,
      organizationName,
      keyPrefix: `alp_live_${randomSecret.slice(0, 8)}...`,
      clientTier,
      requestQuotaMonthly: parseInt(requestQuotaMonthly, 10),
      requestsThisMonth: 0,
      monthlyRateUsd:
        clientTier === "TIER_2_ENTERPRISE"
          ? 5000
          : clientTier === "TIER_3_INSTITUTIONAL"
            ? 8500
            : 2500,
      activeStatus: "ACTIVE",
      lastUsedAt: "Henüz kullanılmadı",
      createdDate: new Date().toISOString(),
      feedEndpoints: ["/api/v1/threat-intel", "/api/v1/incidents/stream"],
    };

    setKeys([newKeyObj, ...keys]);
    setShowNewKeyModal(false);
    setOrganizationName("");
  };

  const handleToggleKey = (id: string) => {
    setKeys(
      keys.map((k) =>
        k.id === id
          ? {
              ...k,
              activeStatus: k.activeStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
            }
          : k,
      ),
    );
  };

  const runWebhookTest = () => {
    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookTestStatus("HTTP 200 OK (14ms) — Webhook teslim edildi: payload_sha256 mühürlendi");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded border border-[#d0d7de] bg-[#eaeef2] px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              KÜME 4: EKOSİSTEM & GELİR MOTORU
            </span>
            <span className="font-sans text-xs font-semibold text-[#1a7f37] dark:text-[#3fb950]">
              $94,000 MRR AKTİF
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            B2B API & Veri Satış Masası
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            AI Sigortacıları, Kurumsal CISO Ekipleri ve Frontier Laboratuvarlarına Lisanslı Veri
            Akış Arayüzü
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="flex items-center gap-1.5 rounded-md bg-[#238636] px-3 py-1.5 font-sans text-xs font-medium text-white shadow-sm transition-all hover:bg-[#2ea043]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Yeni B2B Anahtarı Üret</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3.5 dark:border-[#30363d] dark:bg-[#161b22]">
          <span className="font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
            Aylık Tekrarlayan Gelir (MRR)
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-xl font-bold text-[#1a7f37] dark:text-[#3fb950]">
              $94,000
            </span>
            <span className="font-sans text-[10px] font-semibold text-[#1a7f37] dark:text-[#3fb950]">
              +18.4% MoM
            </span>
          </div>
        </div>

        <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3.5 dark:border-[#30363d] dark:bg-[#161b22]">
          <span className="font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
            Aktif B2B Kurumsal Müşteri
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              14 Kurum
            </span>
            <span className="font-sans text-[10px] text-[#0969da] dark:text-[#58a6ff]">
              Allianz, AXA, CISO
            </span>
          </div>
        </div>

        <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3.5 dark:border-[#30363d] dark:bg-[#161b22]">
          <span className="font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
            Ortalama API Gecikmesi
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              14 ms
            </span>
            <span className="font-sans text-[10px] text-[#1a7f37] dark:text-[#3fb950]">
              %99.98 SLA
            </span>
          </div>
        </div>

        <div className="rounded-md border border-[#d0d7de] bg-[#ffffff] p-3.5 dark:border-[#30363d] dark:bg-[#161b22]">
          <span className="font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
            Bu Ay Sunulan Olay Akışı
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-xl font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              1.42 Milyon
            </span>
            <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
              Sorgu / Çağrı
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-[#ffffff] shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
          <span className="font-sans text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
            LİSANSLI B2B KURUMSAL ENTEGRASYONLAR
          </span>
          <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
            {keys.length} Aktif Lisans Anahtarı
          </span>
        </div>

        <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
          {keys.map((k) => {
            const usagePercent = Math.round((k.requestsThisMonth / k.requestQuotaMonthly) * 100);
            return (
              <div
                key={k.id}
                className="p-4 transition-colors hover:bg-[#f6f8fa]/50 dark:hover:bg-[#161b22]/70"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                        {k.organizationName}
                      </span>
                      <StatusBadge type="tier" value={k.clientTier} />
                      <span
                        className={`rounded border px-1.5 py-0.5 font-sans text-[10px] ${
                          k.activeStatus === "ACTIVE"
                            ? "border-[#4ac26b]/40 bg-[#dafbe1] text-[#1a7f37] dark:bg-[#04260f] dark:text-[#3fb950]"
                            : "border-[#ff8182]/40 bg-[#ffebe9] text-[#cf222e] dark:bg-[#490202] dark:text-[#ff7b72]"
                        }`}
                      >
                        {k.activeStatus === "ACTIVE" ? "Aktif" : "Askıda (Suspended)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-sans text-xs text-[#656d76] dark:text-[#8b949e]">
                      <div className="flex items-center gap-1.5">
                        <code>{k.keyPrefix}</code>
                        <button
                          onClick={() => handleCopy(k.keyPrefix, k.id)}
                          className="hover:text-[#1f2328] dark:hover:text-[#f0f6fc]"
                          title="Anahtarı Kopyala"
                        >
                          {copiedKey === k.id ? (
                            <Check className="h-3 w-3 text-[#1a7f37] dark:text-[#3fb950]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <span>•</span>
                      <span>Son kullanım: {k.lastUsedAt}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#1a7f37] dark:text-[#3fb950]">
                        ${k.monthlyRateUsd.toLocaleString()}/ay
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-36 space-y-1">
                      <div className="flex justify-between font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
                        <span>Kota Kullanımı</span>
                        <span>{usagePercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eaeef2] dark:bg-[#21262d]">
                        <div
                          className="h-full rounded-full bg-[#0969da] dark:bg-[#58a6ff]"
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedKeyForCurl(k)}
                        className="rounded border border-[#d0d7de] bg-[#ffffff] px-2.5 py-1 font-sans text-xs text-[#1f2328] transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
                        title="cURL Snippet Göster"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleKey(k.id)}
                        className={`rounded border px-2.5 py-1 font-sans text-xs transition-colors ${
                          k.activeStatus === "ACTIVE"
                            ? "border-[#ff8182]/40 text-[#cf222e] hover:bg-[#ffebe9] dark:text-[#ff7b72] dark:hover:bg-[#490202]"
                            : "border-[#4ac26b]/40 text-[#1a7f37] hover:bg-[#dafbe1] dark:text-[#3fb950] dark:hover:bg-[#04260f]"
                        }`}
                      >
                        {k.activeStatus === "ACTIVE" ? "Askıya Al" : "Aktifleştir"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-md border border-[#d0d7de] bg-[#ffffff] p-4 dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              <Terminal className="h-4 w-4 text-[#0969da] dark:text-[#58a6ff]" />
              B2B Threat-Intel API Örnek Çağrısı
            </span>
            <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
              Seçili Müşteri: {selectedKeyForCurl?.organizationName || "Allianz"}
            </span>
          </div>

          <div className="relative overflow-x-auto rounded border border-[#d0d7de] bg-[#f6f8fa] p-3 font-sans text-xs text-[#1f2328] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#c9d1d9]">
            <pre className="text-[11px] leading-relaxed">
              curl -X GET "https://api.alparai.com/v1/incidents/stream" \\ -H "Authorization: Bearer
              " + (selectedKeyForCurl?.keyPrefix || 'alp_live_sec_...') + " \\ -H "Accept:
              application/json" \\ -d "severity=CRITICAL&eu_act=HIGH_RISK_ART6"
            </pre>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-[#d0d7de] bg-[#ffffff] p-4 dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              <Zap className="h-4 w-4 text-[#9a6700] dark:text-[#d29922]" />
              Canlı Webhook Olay Gönderim Testi
            </span>
            <span className="font-sans text-[10px] text-[#1a7f37] dark:text-[#3fb950]">
              Hedef: CISO SIEM Entegrasyonu
            </span>
          </div>

          <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
            Kayıtlı kurumsal uç noktaya son 2.908 olaydan rastgele bir zafiyet bildirimini gerçek
            zamanlı test edin.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={runWebhookTest}
              disabled={isTestingWebhook}
              className="flex items-center gap-1.5 rounded-md bg-[#0969da] px-3 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-[#0854ad] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isTestingWebhook ? "Test Gönderiliyor..." : "Webhook Test Pingi At"}</span>
            </button>
          </div>

          {webhookTestStatus && (
            <div className="rounded border border-[#4ac26b]/40 bg-[#dafbe1] p-2.5 font-sans text-xs text-[#1a7f37] dark:bg-[#04260f] dark:text-[#3fb950]">
              {webhookTestStatus}
            </div>
          )}
        </div>
      </div>

      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateKey}
            className="animate-in fade-in zoom-in w-full max-w-md space-y-4 rounded-lg border border-[#d0d7de] bg-[#ffffff] p-5 shadow-2xl duration-150 dark:border-[#30363d] dark:bg-[#161b22]"
          >
            <div className="flex items-center justify-between border-b border-[#d0d7de] pb-3 dark:border-[#30363d]">
              <h3 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                Yeni B2B Kurumsal API Anahtarı Üret
              </h3>
              <button
                type="button"
                onClick={() => setShowNewKeyModal(false)}
                className="text-[#656d76] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="mb-1 block text-[#656d76] dark:text-[#8b949e]">
                  Kurum / Müşteri Adı:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Allianz AI Underwriting Desk"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full rounded border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 text-[#1f2328] focus:ring-1 focus:ring-[#0969da] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[#656d76] dark:text-[#8b949e]">
                  Paket & Lisans Türü:
                </label>
                <select
                  value={clientTier}
                  onChange={(e) => setClientTier(e.target.value as any)}
                  className="w-full rounded border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                >
                  <option value="TIER_1_GROWTH">Tier 1: Growth Feed ($2,500/ay)</option>
                  <option value="TIER_2_ENTERPRISE">
                    Tier 2: Enterprise Threat Feed ($5,000/ay)
                  </option>
                  <option value="TIER_3_INSTITUTIONAL">
                    Tier 3: Institutional Actuary Feed ($8,500/ay)
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[#656d76] dark:text-[#8b949e]">
                  Aylık İstek Kotası:
                </label>
                <input
                  type="number"
                  value={requestQuotaMonthly}
                  onChange={(e) => setRequestQuotaMonthly(e.target.value)}
                  className="w-full rounded border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#d0d7de] pt-2 dark:border-[#30363d]">
              <button
                type="button"
                onClick={() => setShowNewKeyModal(false)}
                className="rounded border border-[#d0d7de] px-3 py-1.5 font-sans text-xs text-[#656d76] hover:bg-[#f6f8fa] dark:border-[#30363d] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded bg-[#238636] px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-[#2ea043]"
              >
                Anahtarı Oluştur & Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
