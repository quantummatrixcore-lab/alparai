 
"use client";

import { useEffect, useState } from "react";

interface EcosystemData {
  google: {
    gemini: {
      status: string;
      modelsAvailable?: number;
      rateLimitRemaining?: string;
      message?: string;
    };
    drive: {
      status: string;
      storageUsedGB?: number;
      storageTotalGB?: number;
      usagePercentage?: string;
    };
    developer?: {
      level: string;
      badgesFound?: string[];
      timestamp: string;
      identity?: string;
      founder?: string;
      certifications?: unknown[];
      prStatus?: string;
    };
  };
  alparai?: {
    admin?: {
      cockpitScore: string;
      antiHallucination: string;
      tokenUsage: string;
      alparAdmin?: {
        antiHallucinationScore: string;
        tokenBudgetUsage: string;
        swarmOperations?: {
          activeSubAgents: number;
          status: string;
        };
      };
    };
  };
  infrastructure: {
    wafMode: string;
    vercelDeployments: string;
  };
  finance?: {
    dailyCost: string;
    bountyPool: string;
    status: string;
  };
}

export default function EcosystemDashboard() {
  const [data, setData] = useState<EcosystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    fetch("/api/ecosystem", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (isMounted && json && json.status === "success") {
          setData(json.ecosystem);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          // Graceful handling without console leakage
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading)
    return (
      <div className="text-fg-muted animate-pulse p-4">ALPAR Ecosystem Mimarisi Yükleniyor...</div>
    );
  if (!data) return <div className="p-4 text-red-500">Ekosistem verisine ulaşılamadı.</div>;

  return (
    <div className="border-border-subtle rounded-xl border bg-[#0D1117] p-6 text-white shadow-2xl">
      <h2 className="text-2xl mb-6 flex items-center gap-2 font-bold">
        🐺 ALPAR Sürü Karargahı (Ecosystem API)
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Google AI Studio Limitleri */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-blue-500">
          <h3 className="mb-2 text-lg font-semibold text-blue-400">Google AI Studio (Gemini)</h3>
          <p className="text-fg-muted mb-1 text-sm">
            Durum:{" "}
            <span
              className={
                data.google.gemini.status === "success" ? "text-green-400" : "text-yellow-400"
              }
            >
              {data.google.gemini.status.toUpperCase()}
            </span>
          </p>
          {data.google.gemini.modelsAvailable !== undefined && (
            <p className="text-sm">
              Erişilebilir Modeller:{" "}
              <span className="font-mono text-white">{data.google.gemini.modelsAvailable}</span>
            </p>
          )}
          {data.google.gemini.rateLimitRemaining && (
            <p className="text-sm">
              Kalan Kota (Header):{" "}
              <span className="font-mono text-white">{data.google.gemini.rateLimitRemaining}</span>
            </p>
          )}
        </div>

        {/* Google Drive Kotaları */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-green-500">
          <h3 className="mb-2 text-lg font-semibold text-green-400">Google Drive Depolama</h3>
          <p className="text-fg-muted mb-1 text-sm">
            Kullanım:{" "}
            <span className="font-mono text-white">
              {data.google.drive.storageUsedGB} GB / {data.google.drive.storageTotalGB} GB
            </span>
          </p>
          <div className="bg-bg-secondary mt-2 h-2.5 w-full rounded-full">
            <div
              className="h-2.5 rounded-full bg-green-500"
              style={{ width: data.google.drive.usagePercentage || "0%" }}
            ></div>
          </div>
        </div>

        {/* Cloudflare WAF */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-orange-500">
          <h3 className="mb-2 text-lg font-semibold text-orange-400">Cloudflare WAF Surları</h3>
          <p className="text-fg-muted text-sm">
            Durum: <span className="font-mono text-white">{data.infrastructure.wafMode}</span>
          </p>
        </div>

        {/* Stripe & Finans (ReadOnly) */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-yellow-500">
          <h3 className="mb-2 text-lg font-semibold text-yellow-400">Stripe Finans & Bounty</h3>
          {data.finance ? (
            <>
              <p className="text-fg-muted text-sm">
                Durum: <span className="font-mono text-white">{data.finance.status}</span>
              </p>
              <p className="text-fg-muted text-sm">
                Günlük API Maliyeti:{" "}
                <span className="font-mono text-white">{data.finance.dailyCost}</span>
              </p>
              <p className="text-fg-muted text-sm">
                Bounty Havuzu:{" "}
                <span className="font-mono text-white">{data.finance.bountyPool}</span>
              </p>
            </>
          ) : (
            <p className="text-fg-muted text-sm">Stripe verisi bekleniyor...</p>
          )}
        </div>

        {/* Vercel Deployments */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-purple-500">
          <h3 className="mb-2 text-lg font-semibold text-purple-400">Vercel Serverless</h3>
          <p className="text-fg-muted text-sm">
            Dağıtım Motoru:{" "}
            <span className="font-mono text-white">{data.infrastructure.vercelDeployments}</span>
          </p>
        </div>

        {/* Google Developer Profile */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-cyan-500 md:col-span-2">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-cyan-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Google Developer Profile (Agent-OS Sızma Motoru)
          </h3>
          {data.google.developer ? (
            <div className="mt-3">
              <p className="text-fg-muted mb-1 text-sm">
                Kimlik:{" "}
                <span className="font-mono text-white">
                  {data.google.developer.identity || "Bilinmiyor"}
                </span>
              </p>
              <p className="text-fg-muted mb-1 text-sm">
                Kurucu:{" "}
                <span className="font-mono text-white">
                  {data.google.developer.founder || "Ercüment Erden"}
                </span>
              </p>
              <div className="mt-2">
                <p className="text-fg-muted mb-1 text-sm">Sertifikasyonlar:</p>
                <div className="flex flex-wrap gap-2">
                  {data.google.developer.certifications &&
                  data.google.developer.certifications.length > 0 ? (
                    data.google.developer.certifications.map((cert: unknown, idx: number) => (
                      <span
                        key={idx}
                        className="rounded border border-cyan-800 bg-cyan-900/30 px-2 py-1 font-mono text-xs text-cyan-300"
                      >
                        {String((cert as Record<string, unknown>).name)} (
                        {String((cert as Record<string, unknown>).status)})
                      </span>
                    ))
                  ) : (
                    <span className="text-fg-muted text-xs italic">Sertifika bulunamadı.</span>
                  )}
                </div>
              </div>
              <p className="text-fg-secondary mt-3 text-right text-xs">
                PR Status: {data.google.developer.prStatus || "Bilinmiyor"}
              </p>
            </div>
          ) : (
            <p className="text-fg-muted mt-2 text-sm italic">
              CDP üzerinden profile ulaşılamadı. Sürü nöbette bekliyor...
            </p>
          )}
        </div>

        {/* AlparAI Spatial Cockpit Sync */}
        <div className="bg-bg-secondary border-border-subtle rounded-lg border p-4 transition-colors hover:border-emerald-500 md:col-span-2">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-emerald-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
            ALPAR AI Command Center (Live Sync)
          </h3>
          {data.alparai?.admin?.alparAdmin ? (
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded border-l-2 border-emerald-500 bg-black/30 p-3">
                <p className="text-fg-muted mb-1 text-xs">Anti-Halüsinasyon</p>
                <p className="text-xl font-bold text-emerald-400">
                  %{data.alparai.admin.alparAdmin.antiHallucinationScore}
                </p>
              </div>
              <div className="rounded border-l-2 border-blue-500 bg-black/30 p-3">
                <p className="text-fg-muted mb-1 text-xs">Sürü Operasyonları (Swarm)</p>
                <p className="text-md font-bold text-blue-400">
                  {data.alparai.admin.alparAdmin.swarmOperations?.activeSubAgents} Aktif Ajan
                </p>
                <p className="text-fg-muted text-xs">
                  {data.alparai.admin.alparAdmin.swarmOperations?.status}
                </p>
              </div>
              <div className="rounded border-l-2 border-purple-500 bg-black/30 p-3">
                <p className="text-fg-muted mb-1 text-xs">Token Bütçesi</p>
                <p className="text-xl font-bold text-purple-400">
                  {data.alparai.admin.alparAdmin.tokenBudgetUsage}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-fg-muted mt-2 text-sm italic">ALPAR AI Admin verisi bekleniyor...</p>
          )}
        </div>
      </div>
    </div>
  );
}
