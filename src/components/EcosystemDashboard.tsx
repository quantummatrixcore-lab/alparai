'use client';

import React, { useEffect, useState } from 'react';

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
    };
  };
  alparai?: {
    admin?: {
      cockpitScore: string;
      antiHallucination: string;
      tokenUsage: string;
    };
  };
  infrastructure: {
    wafMode: string;
    vercelDeployments: string;
  };
}

export default function EcosystemDashboard() {
  const [data, setData] = useState<EcosystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    fetch('/api/ecosystem', { signal: controller.signal })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(json => {
        if (isMounted && json && json.status === 'success') {
          setData(json.ecosystem);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
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

  if (loading) return <div className="p-4 text-gray-500 animate-pulse">ALPAR Ecosystem Mimarisi Yükleniyor...</div>;
  if (!data) return <div className="p-4 text-red-500">Ekosistem verisine ulaşılamadı.</div>;

  return (
    <div className="bg-[#0D1117] text-white p-6 rounded-xl border border-gray-800 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🐺 ALPAR Sürü Karargahı (Ecosystem API)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google AI Studio Limitleri */}
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Google AI Studio (Gemini)</h3>
          <p className="text-sm text-gray-400 mb-1">Durum: <span className={data.google.gemini.status === 'success' ? 'text-green-400' : 'text-yellow-400'}>{data.google.gemini.status.toUpperCase()}</span></p>
          {data.google.gemini.modelsAvailable !== undefined && (
            <p className="text-sm">Erişilebilir Modeller: <span className="font-mono text-white">{data.google.gemini.modelsAvailable}</span></p>
          )}
          {data.google.gemini.rateLimitRemaining && (
            <p className="text-sm">Kalan Kota (Header): <span className="font-mono text-white">{data.google.gemini.rateLimitRemaining}</span></p>
          )}
        </div>

        {/* Google Drive Kotaları */}
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Google Drive Depolama</h3>
          <p className="text-sm text-gray-400 mb-1">Kullanım: <span className="font-mono text-white">{data.google.drive.storageUsedGB} GB / {data.google.drive.storageTotalGB} GB</span></p>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mt-2">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: data.google.drive.usagePercentage || '0%' }}></div>
          </div>
        </div>

        {/* Cloudflare WAF */}
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-orange-500 transition-colors">
          <h3 className="text-lg font-semibold text-orange-400 mb-2">Cloudflare WAF Surları</h3>
          <p className="text-sm text-gray-400">Under Attack Modu: <span className="font-mono text-white">{data.infrastructure.wafMode}</span></p>
        </div>

        {/* Vercel Deployments */}
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">Vercel Serverless</h3>
          <p className="text-sm text-gray-400">Dağıtım Motoru: <span className="font-mono text-white">{data.infrastructure.vercelDeployments}</span></p>
        </div>

        {/* Google Developer Profile */}
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-cyan-500 transition-colors md:col-span-2">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            Google Developer Profile (Agent-OS Sızma Motoru)
          </h3>
          {data.google.developer ? (
            <div className="mt-3">
              <p className="text-sm text-gray-400 mb-1">Rank / Seviye: <span className="font-mono text-white">{data.google.developer.level}</span></p>
              <div className="mt-2">
                <p className="text-sm text-gray-400 mb-1">Kazanılan Rozetler ({data.google.developer.badgesFound?.length || 0}):</p>
                <div className="flex flex-wrap gap-2">
                  {data.google.developer.badgesFound && data.google.developer.badgesFound.length > 0 ? (
                    data.google.developer.badgesFound.map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs font-mono bg-cyan-900/30 text-cyan-300 rounded border border-cyan-800">
                        {badge}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">Henüz rozet çekilemedi veya CDP senkronizasyonu bekleniyor.</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-right">Son Senkronizasyon: {new Date(data.google.developer.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic mt-2">CDP üzerinden profile ulaşılamadı. Sürü nöbette bekliyor...</p>
          )}
        </div>

        {/* AlparAI Spatial Cockpit Sync */}
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 hover:border-emerald-500 transition-colors md:col-span-2">
          <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            ALPAR AI Command Center (Live Sync)
          </h3>
          {data.alparai?.admin ? (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">Anti-Halüsinasyon Skoru</p>
                <p className="text-xl font-bold text-emerald-400">%{data.alparai.admin.antiHallucination}</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">Token Bütçe Kullanımı</p>
                <p className="text-xl font-bold text-emerald-400">{data.alparai.admin.tokenUsage} / 10K</p>
              </div>
              <div className="bg-black/30 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">360° Cockpit Quality</p>
                <p className="text-xl font-bold text-emerald-400">97 / 100</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic mt-2">ALPAR AI Admin verisi bekleniyor...</p>
          )}
        </div>
      </div>
    </div>
  );
}
