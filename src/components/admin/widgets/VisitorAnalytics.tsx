"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  Globe,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Zap,
} from "lucide-react";
import {
  predictUpcomingTraffic,
  type VisitorEvent,
  type PredictionResult,
  type IntervalPrediction,
  type PredictorConfig,
} from "@/lib/ai/visitor-predictor";

export interface VisitorAnalyticsProps {
  /**
   * Initial active visitors count on cold-start
   * @default 142
   */
  initialVisitors?: number;
  /**
   * Current SEO Organic Traffic Growth rate label
   * @default "+24.5%"
   */
  growthRate?: string;
  /**
   * Optional historical visitor events for training the Markov & Holt-Winters predictor
   */
  historicalEvents?: VisitorEvent[];
  /**
   * Whether to enable real-time pulse simulation and periodic forecast updates
   * @default true
   */
  enableRealtimeSimulation?: boolean;
  /**
   * Polling & prediction update interval in milliseconds
   * @default 10000
   */
  refreshIntervalMs?: number;
  /**
   * Custom configuration for the AI Predictor Engine
   */
  predictorConfig?: PredictorConfig;
  /**
   * Additional container CSS classes
   */
  className?: string;
  /**
   * Whether the AI details panel is expanded by default
   * @default false
   */
  defaultExpanded?: boolean;
}

/**
 * Generates synthetic historical events spanning the last 2 hours
 * to initialize the Markov Transition & Holt-Winters models when external telemetry is loading.
 */
function generateSyntheticHistory(baseVisitors: number, hours = 2): VisitorEvent[] {
  const events: VisitorEvent[] = [];
  const now = Date.now();
  const totalBuckets = (hours * 60) / 5; // 5-minute buckets
  const paths = ["/", "/incidents", "/report", "/pricing", "/checkout", "/about"];

  for (let i = totalBuckets; i >= 0; i--) {
    const bucketTime = now - i * 5 * 60 * 1000;
    // Diurnal & rhythmic variation
    const variation = Math.sin((i / totalBuckets) * Math.PI * 2) * 12;
    const bucketVisitorCount = Math.max(
      8,
      Math.round(baseVisitors / 4 + variation + (Math.random() * 6 - 3)),
    );

    for (let v = 0; v < bucketVisitorCount; v++) {
      const sessionId = `sim_sess_${i}_${v}`;
      const pathIdx = (i + v) % paths.length;
      events.push({
        timestamp: bucketTime + v * 300,
        path: paths[pathIdx] || "/",
        sessionId,
        visitorId: `visitor_${v % 30}`,
      });

      // Chain a 2nd transition for Markov learning
      if (Math.random() > 0.4) {
        const nextIdx = (pathIdx + 1) % paths.length;
        events.push({
          timestamp: bucketTime + v * 300 + 45000,
          path: paths[nextIdx] || "/incidents",
          sessionId,
          visitorId: `visitor_${v % 30}`,
        });
      }
    }
  }

  return events;
}

export const VisitorAnalytics = React.memo(function VisitorAnalytics({
  initialVisitors = 142,
  growthRate = "+24.5%",
  historicalEvents,
  enableRealtimeSimulation = true,
  refreshIntervalMs = 10000,
  predictorConfig,
  className = "",
  defaultExpanded = false,
}: VisitorAnalyticsProps) {
  const [visitors, setVisitors] = useState<number>(initialVisitors);
  const [eventBuffer, setEventBuffer] = useState<VisitorEvent[]>(() => {
    return historicalEvents && historicalEvents.length > 0
      ? historicalEvents
      : generateSyntheticHistory(initialVisitors, 2);
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [hoveredInterval, setHoveredInterval] = useState<IntervalPrediction | null>(null);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<Date>(() => new Date());

  // Execute Alan Turing & Holt-Winters Predictive Traffic Engine
  const prediction: PredictionResult = useMemo(() => {
    return predictUpcomingTraffic(eventBuffer, visitors, predictorConfig);
  }, [eventBuffer, visitors, predictorConfig]);

  // Real-time Heartbeat & Event Ingestion Loop
  useEffect(() => {
    if (!enableRealtimeSimulation) return;

    const interval = setInterval(() => {
      // 1. Simulate live visitor flux
      const delta = Math.floor(Math.random() * 15) - 7;
      const newVisitorCount = Math.max(20, Math.floor(initialVisitors + delta));
      setVisitors(newVisitorCount);
      setLastCalculatedAt(new Date());

      // 2. Ingest real-time micro-events into rolling buffer
      const now = Date.now();
      const newMicroEvents: VisitorEvent[] = [];
      const samplePaths = ["/", "/incidents", "/report", "/pricing"];

      for (let i = 0; i < 4; i++) {
        newMicroEvents.push({
          timestamp: now - (4 - i) * 2000,
          path: samplePaths[i % samplePaths.length] || "/",
          sessionId: `live_${now}_${i}`,
          visitorId: `live_user_${i}`,
        });
      }

      setEventBuffer((prev) => {
        const twoHoursAgo = now - 2 * 60 * 60 * 1000;
        const filtered = prev.filter((e) => {
          const ts =
            typeof e.timestamp === "number" ? e.timestamp : new Date(e.timestamp).getTime();
          return ts >= twoHoursAgo;
        });
        return [...filtered, ...newMicroEvents];
      });
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [enableRealtimeSimulation, initialVisitors, refreshIntervalMs]);

  // Chart Dimensions & Coordinate Calculations
  const chartData = prediction.intervals;
  const maxVisitorsInChart = useMemo(() => {
    if (!chartData || chartData.length === 0) return 100;
    const maxVal = Math.max(...chartData.map((d) => Math.max(d.predictedVisitors, d.upperBound90)));
    return Math.max(maxVal * 1.15, 10);
  }, [chartData]);

  const minVisitorsInChart = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    const minVal = Math.min(...chartData.map((d) => Math.min(d.predictedVisitors, d.lowerBound90)));
    return Math.max(0, minVal * 0.85);
  }, [chartData]);

  // SVG Sparkline Points Generator
  const { linePoints, areaPoints, upperBandPoints } = useMemo(() => {
    const width = 280;
    const height = 48;
    const count = chartData.length || 1;
    const range = Math.max(1, maxVisitorsInChart - minVisitorsInChart);

    const points = chartData.map((d, index) => {
      const x = (index / (count - 1)) * width;
      const normalizedY = (d.predictedVisitors - minVisitorsInChart) / range;
      const y = height - normalizedY * (height - 8) - 4;

      const normLower = (d.lowerBound90 - minVisitorsInChart) / range;
      const yLower = height - normLower * (height - 8) - 4;

      const normUpper = (d.upperBound90 - minVisitorsInChart) / range;
      const yUpper = height - normUpper * (height - 8) - 4;

      return { x, y, yLower, yUpper, data: d };
    });

    const lineStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaStr = `${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")} ${width},${height} 0,${height}`;

    // 90% Confidence Interval Polygon Band
    const upperPointsStr = points.map((p) => `${p.x.toFixed(1)},${p.yUpper.toFixed(1)}`).join(" ");
    const lowerPointsReversedStr = points
      .slice()
      .reverse()
      .map((p) => `${p.x.toFixed(1)},${p.yLower.toFixed(1)}`)
      .join(" ");
    const bandStr = `${upperPointsStr} ${lowerPointsReversedStr}`;

    return { linePoints: lineStr, areaPoints: areaStr, upperBandPoints: bandStr };
  }, [chartData, maxVisitorsInChart, minVisitorsInChart]);

  // Anomaly Display Helpers
  const { isAnomaly, type: anomalyType, zScore } = prediction.anomalyStatus;
  const isSurge = isAnomaly && anomalyType === "SURGE";
  const isDrop = isAnomaly && anomalyType === "DROP";

  return (
    <div
      className={`relative w-full min-w-0 overflow-hidden rounded-xl border border-[#27272a] bg-[#121216]/90 p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#00f0ff]/40 sm:p-4 ${className}`}
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[#00f0ff]/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#10b981]/10 blur-2xl" />

      {/* Header Bar */}
      <div className="relative z-10 mb-3 flex min-w-0 items-center justify-between gap-2 border-b border-[#27272a] pb-2.5 sm:mb-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#10b981]/40 bg-[#10b981]/15 text-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <Users className="h-4 w-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold text-white sm:text-sm">
              CEO Analitik: Canlı Ziyaretçi
            </h3>
            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Sparkles className="h-2.5 w-2.5 text-[#00f0ff]" />
              <span className="truncate">Turing v1.4 AI Tahmin Motoru</span>
            </div>
          </div>
        </div>

        {/* AI Confidence & Detail Toggle */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00f0ff]"
            title={`Algoritma Doğruluğu: %${prediction.metrics.accuracyPct}`}
          >
            <Zap className="h-2.5 w-2.5" />%{Math.round(prediction.confidenceScore * 100)} Güven
          </span>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-[#27272a] bg-[#18181b] text-slate-400 transition-all hover:border-white/20 hover:text-white"
            aria-label="AI Detaylarını Aç/Kapat"
            title="Detaylı Markov ve Zaman Serisi Analizi"
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
        {/* Metric 1: Sitedeki Aktif Kişi */}
        <div className="min-w-0 rounded-lg border border-[#27272a] bg-[#18181b]/60 p-2.5 backdrop-blur-sm sm:p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 sm:text-xs">
            <span>Sitedeki Aktif Kişi</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
              Canlı
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-sm font-extrabold text-emerald-400 sm:text-base">
            <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span>{visitors}</span>
            <span className="ml-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
          </p>
          <div className="mt-1 flex items-center justify-between truncate font-mono text-[10px] text-slate-400">
            <span>Son yenilenme</span>
            <span>
              {lastCalculatedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Metric 2: Gelecek 1 Saat AI Tahmini */}
        <div className="min-w-0 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/5 p-2.5 backdrop-blur-sm sm:p-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 sm:text-xs">
            <span className="truncate font-medium text-[#00f0ff]">Gelecek 1 Saat Tahmini</span>
            <Clock className="h-3 w-3 shrink-0 text-[#00f0ff]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="font-mono text-sm font-extrabold text-white sm:text-base">
              ~{prediction.nextHourTotalVisitors}
            </p>
            <span className="font-mono text-[10px] font-bold text-[#00f0ff]">kişi / saat</span>
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
            <span>Tahmini Sayfa Görüntüleme</span>
            <span className="font-bold text-slate-300">
              ~{prediction.nextHourTotalPageviews} pv
            </span>
          </div>
        </div>

        {/* Metric 3: SEO Organik Trafik */}
        <div className="min-w-0 rounded-lg border border-[#27272a] bg-[#18181b]/60 p-2.5 backdrop-blur-sm sm:p-3">
          <p className="text-[11px] text-slate-400 sm:text-xs">SEO Organik Trafik</p>
          <p className="mt-1 flex items-center gap-1 font-mono text-sm font-extrabold text-[#00f0ff] sm:text-base">
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> {growthRate}
          </p>
          <div className="mt-1 truncate font-mono text-[10px] text-slate-400">
            Organik Arama Payı: %68.2
          </div>
        </div>

        {/* Metric 4: Anomali Z-Skoru & Güvenlik Kalkanı */}
        <div
          className={`min-w-0 rounded-lg border p-2.5 backdrop-blur-sm transition-all sm:p-3 ${
            isSurge
              ? "border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              : isDrop
                ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "border-[#27272a] bg-[#18181b]/60"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-400">Anomali Z-Skoru</span>
            {isAnomaly ? (
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-red-400">
                <AlertTriangle className="h-3 w-3 animate-bounce" />
                {anomalyType}
              </span>
            ) : (
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Kararlı
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono">
            <p
              className={`text-sm font-extrabold sm:text-base ${
                isSurge ? "text-red-400" : isDrop ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {zScore >= 0 ? `+${zScore.toFixed(2)}` : zScore.toFixed(2)} σ
            </p>
            <span className="font-mono text-[10px] text-slate-400">
              ({prediction.anomalyStatus.isAnomaly ? "Eşik Aşıldı" : "Normal Dağılım"})
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between truncate font-mono text-[10px] text-slate-400">
            <span>Beklenen Hız</span>
            <span>{prediction.anomalyStatus.expectedRate} / 5dk</span>
          </div>
        </div>
      </div>

      {/* 1-Hour Forecast Visualizer: Mini Sparkline & Confidence Band */}
      <div className="relative z-10 mt-3 border-t border-[#27272a] pt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#00f0ff]" />
            <span>Gelecek 60 Dakika Tahmin Eğrisi (5dk Dilimler)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded bg-[#00f0ff]" /> Tahmin
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded border border-[#00f0ff]/40 bg-[#00f0ff]/20" />{" "}
              %90 CI
            </span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative h-14 w-full rounded-lg border border-[#27272a]/80 bg-[#0a0a0e]/60 p-1.5">
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 280 48"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="forecastLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* 90% Confidence Interval Shaded Band */}
            {upperBandPoints && (
              <polygon
                points={upperBandPoints}
                fill="#00f0ff"
                fillOpacity="0.12"
                stroke="#00f0ff"
                strokeOpacity="0.25"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            )}

            {/* Area Fill */}
            {areaPoints && <polygon points={areaPoints} fill="url(#forecastAreaGrad)" />}

            {/* Forecast Spline Line */}
            {linePoints && (
              <polyline
                fill="none"
                stroke="url(#forecastLineGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePoints}
              />
            )}

            {/* Interval Nodes & Hover Triggers */}
            {chartData.map((d, index) => {
              const width = 280;
              const height = 48;
              const count = chartData.length || 1;
              const range = Math.max(1, maxVisitorsInChart - minVisitorsInChart);
              const x = (index / (count - 1)) * width;
              const normalizedY = (d.predictedVisitors - minVisitorsInChart) / range;
              const y = height - normalizedY * (height - 8) - 4;
              const isHovered = hoveredInterval?.minuteOffset === d.minuteOffset;

              return (
                <g key={d.minuteOffset} className="cursor-pointer">
                  {/* Outer circle for hovered pulse */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#00f0ff"
                      fillOpacity="0.4"
                      className="animate-ping"
                    />
                  )}
                  {/* Main Point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "4" : "2"}
                    fill={isHovered ? "#ffffff" : "#00f0ff"}
                    stroke="#09090b"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredInterval(d)}
                    onMouseLeave={() => setHoveredInterval(null)}
                  />
                  {/* Invisible hit area for easier touch/mouse hover */}
                  <rect
                    x={x - 10}
                    y="0"
                    width="20"
                    height="48"
                    fill="transparent"
                    onMouseEnter={() => setHoveredInterval(d)}
                    onMouseLeave={() => setHoveredInterval(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip / Status Display */}
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-slate-400">
          {hoveredInterval ? (
            <div className="flex items-center gap-2 text-[#00f0ff]">
              <span className="font-bold">+{hoveredInterval.minuteOffset} dk:</span>
              <span className="font-bold text-white">
                {hoveredInterval.predictedVisitors} ziyaretçi
              </span>
              <span className="text-slate-400">
                (90% CI: {hoveredInterval.lowerBound90} - {hoveredInterval.upperBound90})
              </span>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between">
              <span>+5 dk: {chartData[0]?.predictedVisitors ?? 0} kişi</span>
              <span className="text-slate-500">•</span>
              <span>+30 dk: {chartData[5]?.predictedVisitors ?? 0} kişi</span>
              <span className="text-slate-500">•</span>
              <span>+60 dk: {chartData[chartData.length - 1]?.predictedVisitors ?? 0} kişi</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Advanced Section: Markov User Flow & Model Quality */}
      {isExpanded && (
        <div className="animate-in fade-in relative z-10 mt-3 space-y-3 border-t border-[#27272a] pt-3 text-xs duration-200">
          {/* Markov Path Probability Distribution */}
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
              <Compass className="h-3.5 w-3.5 text-[#dcb8ff]" />
              <span>Markov Zinciri: En Olası Gelecek Ziyaretçi Rotaları</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {prediction.topPredictedPaths.slice(0, 4).map((p) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between rounded-md border border-[#27272a] bg-[#18181b]/80 px-2 py-1 font-mono text-[10px]"
                >
                  <span className="max-w-[70px] truncate text-slate-300">{p.path}</span>
                  <span className="font-bold text-[#00f0ff]">
                    %{Math.round(p.probability * 100)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Turing Model Quality & Shannon Entropy */}
          <div className="space-y-1 rounded-lg border border-[#27272a] bg-[#0d0d12] p-2.5 font-mono text-[10px] text-slate-400">
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span className="truncate">{prediction.metrics.algorithm}</span>
              <span className="text-emerald-400">%{prediction.metrics.accuracyPct} Doğruluk</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[#27272a]/60 pt-1 text-[10px]">
              <div>
                <span className="text-slate-500">MAPE:</span>{" "}
                <span className="text-slate-200">%{prediction.metrics.mape}</span>
              </div>
              <div>
                <span className="text-slate-500">RMSE:</span>{" "}
                <span className="text-slate-200">{prediction.metrics.rmse}</span>
              </div>
              <div>
                <span className="text-slate-500">Shannon Entropi:</span>{" "}
                <span className="text-slate-200">{prediction.metrics.entropy}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
