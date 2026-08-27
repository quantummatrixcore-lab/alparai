export default function EcosystemMetricWidget() {
  // Demo % values for ecosystem usage, to be linked to real telemetry later
  const metrics = [
    { name: "Google Cloud / API", usage: 92, color: "bg-blue-500" },
    { name: "GitLab Duo DevSecOps", usage: 88, color: "bg-orange-500" },
    { name: "Supabase (pgvector)", usage: 95, color: "bg-emerald-500" },
    { name: "Cloudflare (WAF/Edge)", usage: 100, color: "bg-amber-400" },
  ];

  return (
    <div className="dark:bg-bg-secondary dark:border-border-subtle rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="dark:text-fg-primary mb-4 flex items-center text-xl font-bold text-gray-800">
        <span className="mr-2">🌐</span> Ecosystem Usage Percentage
      </h2>
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.name}>
            <div className="mb-1 flex justify-between text-sm font-medium">
              <span className="text-fg-secondary dark:text-fg-primary">{m.name}</span>
              <span className="text-gray-900 dark:text-white">{m.usage}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`${m.color} h-2.5 rounded-full`}
                style={{ width: `${m.usage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-fg-muted dark:text-fg-muted mt-4 text-center text-xs">
        * "API varsa API, yoksa CDP" hiyerarşisine göre %100 otonom çalışmaktadır.
      </p>
    </div>
  );
}
