"use client";

import React from "react";

interface ModelTrustScoreProps {
  modelId: string;
  modelName: string;
  overallScore: number; // 0-100
  metrics: {
    accuracy: number; // 0-100
    safety: number; // 0-100
    creativity: number; // 0-100
    speed: number; // 0-100
    value: number; // 0-100
  };
  reviewCount: number;
}

export function ModelTrustScore({
  modelName,
  overallScore,
  metrics,
  reviewCount,
}: ModelTrustScoreProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {modelName} Güvenilirlik Karnesi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toplam {reviewCount} değerlendirmeye göre
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex items-center gap-4">
          <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
            {overallScore}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300 font-medium leading-tight">
            Genel <br /> Güven Skoru
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricBar label="Doğruluk (Accuracy)" value={metrics.accuracy} color="bg-emerald-500" />
        <MetricBar label="Güvenlik (Safety)" value={metrics.safety} color="bg-purple-500" />
        <MetricBar label="Yaratıcılık (Creativity)" value={metrics.creativity} color="bg-amber-500" />
        <MetricBar label="Hız (Speed)" value={metrics.speed} color="bg-sky-500" />
        <MetricBar label="Fiyat / Performans (Value)" value={metrics.value} color="bg-indigo-500" />
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-900 dark:text-white">{value}/100</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
