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
      </div>
    </div>
  );
}
