"use client";

import React from "react";
import type { VisualSampleRow } from "@/hooks/admin/use-admin-visual-sample";
import { AdminEmptyState } from "@/components/admin-core/admin-page";

// Saf toplama yardımcıları (test edilir, görsel anlatımın matematiği).
export function bucketBySeverity(rows: VisualSampleRow[]): Array<{ key: string; count: number }> {
  const keys = ["critical", "high", "medium", "low"];
  const counts = new Map<string, number>(keys.map((k) => [k, 0]));
  let other = 0;
  for (const r of rows) {
    const s = (r.severity || "").toLowerCase();
    if (counts.has(s)) counts.set(s, (counts.get(s) ?? 0) + 1);
    else other += 1;
  }
  return [
    ...keys.map((k) => ({ key: k, count: counts.get(k) ?? 0 })),
    { key: "diğer", count: other },
  ];
}

export function bucketByCategory(
  rows: VisualSampleRow[],
  top = 6,
): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = (r.category || "diğer").toLowerCase();
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

export function bucketByWeek(
  rows: VisualSampleRow[],
  weeks = 12,
): Array<{ key: string; count: number }> {
  const buckets = new Map<string, number>();
  const now = Date.now();
  const DAY = 86_400_000;
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now - i * 7 * DAY);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    buckets.set(key, 0);
  }
  const keys = [...buckets.keys()];
  const first = new Date(keys[0] as string).getTime();
  for (const r of rows) {
    const t = r.created_at ? new Date(r.created_at).getTime() : NaN;
    if (!Number.isFinite(t) || t < first) continue;
    const idx = Math.min(weeks - 1, Math.floor((t - first) / (7 * DAY)));
    const k = keys[idx] as string;
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return keys.map((key) => ({ key, count: buckets.get(key) ?? 0 }));
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-cyan-500",
  low: "bg-emerald-500",
  diğer: "bg-zinc-500",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Kritik",
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
  diğer: "Diğer",
};

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border-subtle bg-bg-secondary/60 rounded-xl border p-5 shadow-sm backdrop-blur-xl">
      <h3 className="text-fg-primary font-sans text-sm font-bold">{title}</h3>
      <p className="text-fg-muted mt-0.5 font-sans text-[11px]">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function SeverityBars({ rows }: { rows: VisualSampleRow[] }) {
  const buckets = bucketBySeverity(rows);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <Card title="Şiddet Dağılımı" subtitle={`Son ${rows.length} kayıt örneği`}>
      <div className="space-y-2.5">
        {buckets.map((b) => (
          <div key={b.key} className="flex items-center gap-2.5">
            <span className="text-fg-secondary w-14 shrink-0 font-sans text-[11px] font-medium">
              {SEVERITY_LABEL[b.key] ?? b.key}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${SEVERITY_STYLE[b.key] ?? "bg-zinc-500"}`}
                style={{ width: `${Math.max(2, (b.count / max) * 100)}%` }}
              />
            </div>
            <span className="text-fg-primary w-10 shrink-0 text-right font-sans text-[11px] font-bold tabular-nums">
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CategoryDonut({ rows }: { rows: VisualSampleRow[] }) {
  const buckets = bucketByCategory(rows);
  const total = Math.max(
    1,
    buckets.reduce((s, b) => s + b.count, 0),
  );
  const COLORS = ["#22d3ee", "#a855f7", "#f59e0b", "#ef4444", "#10b981", "#64748b"];
  const R = 54;
  const C = 2 * Math.PI * R;
  const segments = buckets.reduce<
    Array<{ key: string; count: number; color: string; dash: number; off: number }>
  >((list, b, i) => {
    const frac = b.count / total;
    const prev = list.length > 0 ? (list[list.length - 1] as { off: number; dash: number }) : null;
    const off = prev ? prev.off - prev.dash : 0;
    return [
      ...list,
      {
        key: b.key,
        count: b.count,
        color: COLORS[i % COLORS.length] as string,
        dash: frac * C,
        off,
      },
    ];
  }, []);
  return (
    <Card title="Kategori Dağılımı" subtitle={`Son ${rows.length} kayıt örneği`}>
      <div className="flex items-center gap-4">
        <svg
          viewBox="0 0 140 140"
          className="h-32 w-32 shrink-0"
          role="img"
          aria-label="Kategori dağılım grafiği"
        >
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            strokeWidth="18"
            className="stroke-black/10 dark:stroke-white/10"
          />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={s.off}
              transform="rotate(-90 70 70)"
              strokeLinecap="butt"
            />
          ))}
          <text
            x="70"
            y="70"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-fg-primary font-sans text-lg font-bold"
          >
            {total === 1 && buckets.every((b) => b.count === 0) ? "0" : rows.length}
          </text>
        </svg>
        <ul className="min-w-0 flex-1 space-y-1.5">
          {buckets.map((b, i) => (
            <li
              key={b.key}
              className="text-fg-secondary flex items-center gap-2 font-sans text-[11px]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="truncate">{b.key}</span>
              <span className="text-fg-primary ml-auto font-bold tabular-nums">{b.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function TrendArea({ rows }: { rows: VisualSampleRow[] }) {
  const buckets = bucketByWeek(rows);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const W = 560;
  const H = 150;
  const PAD = 8;
  const pts = buckets.map((b, i) => {
    const x = PAD + (i / Math.max(1, buckets.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (b.count / max) * (H - PAD * 2);
    return { x, y };
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${(W - PAD).toFixed(1)},${(H - PAD).toFixed(1)} L${PAD.toFixed(1)},${(H - PAD).toFixed(1)} Z`;
  const peak = buckets.reduce(
    (a, b) => (b.count > a.count ? b : a),
    buckets[0] ?? { key: "-", count: 0 },
  );
  return (
    <Card
      title="12 Haftalık Vaka Akışı"
      subtitle={`Son ${rows.length} kayıt örneği • tepe: ${peak.key} (${peak.count})`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-36 w-full"
        role="img"
        aria-label="Haftalık vaka akış grafiği"
      >
        <defs>
          <linearGradient id="alparTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={W - PAD}
            y1={H * f}
            y2={H * f}
            strokeWidth="1"
            className="stroke-black/10 dark:stroke-white/10"
            strokeDasharray="3 4"
          />
        ))}
        <path d={area} fill="url(#alparTrendFill)" />
        <path
          d={line}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill="#22d3ee"
            opacity={buckets[i]?.count ? 1 : 0.35}
          />
        ))}
      </svg>
      <div className="text-fg-muted mt-1 flex justify-between font-sans text-[10px]">
        <span>{buckets[0]?.key ?? ""}</span>
        <span>{buckets[buckets.length - 1]?.key ?? ""}</span>
      </div>
    </Card>
  );
}

export function AdminVisualsSection({
  rows,
  loading,
}: {
  rows: VisualSampleRow[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border-border-subtle bg-bg-secondary/60 h-56 animate-pulse rounded-xl border"
            role="status"
            aria-label="Grafikler yükleniyor"
          />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <AdminEmptyState message="Grafik için henüz kayıt yok. İlk vakalar işlendiğinde bu panel canlanacak." />
    );
  }
  return (
    <section aria-label="Görsel veri anlatımı">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SeverityBars rows={rows} />
        <CategoryDonut rows={rows} />
        <TrendArea rows={rows} />
      </div>
    </section>
  );
}
