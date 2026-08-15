import React from 'react';

export default function EcosystemMetricWidget() {
  // Demo % values for ecosystem usage, to be linked to real telemetry later
  const metrics = [
    { name: "Google Cloud / API", usage: 92, color: "bg-blue-500" },
    { name: "GitLab Duo DevSecOps", usage: 88, color: "bg-orange-500" },
    { name: "Supabase (pgvector)", usage: 95, color: "bg-emerald-500" },
    { name: "Cloudflare (WAF/Edge)", usage: 100, color: "bg-amber-400" },
  ];

  return (
    <div className="p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
        <span className="mr-2">🌐</span> Ecosystem Usage Percentage
      </h2>
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.name}>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">{m.name}</span>
              <span className="text-gray-900 dark:text-white">{m.usage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className={`${m.color} h-2.5 rounded-full`} style={{ width: `${m.usage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        * "API varsa API, yoksa CDP" hiyerarşisine göre %100 otonom çalışmaktadır.
      </p>
    </div>
  );
}
