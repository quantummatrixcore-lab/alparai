"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Activity, Award, ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Supabase'den gelecek veri modelleri
export interface DailyVolume {
  date: string;
  calls: number;
  revenue: number;
}

export interface DigitalTwinUsage {
  id: string;
  name: string;
  totalCalls: number;
  revenueUsd: number;
  isActive: boolean;
  createdAt: string;
}

// Dummy veriler (Supabase entegrasyonu için yapılandırıldı)
const chartData: DailyVolume[] = [
  { date: "Pzt", calls: 12000, revenue: 150 },
  { date: "Sal", calls: 19000, revenue: 230 },
  { date: "Çar", calls: 15000, revenue: 180 },
  { date: "Per", calls: 22000, revenue: 290 },
  { date: "Cum", calls: 28000, revenue: 350 },
  { date: "Cmt", calls: 35000, revenue: 420 },
  { date: "Paz", calls: 42000, revenue: 510 },
];

const personaData: DigitalTwinUsage[] = [
  {
    id: "uuid-1",
    name: "Fatih Sultan Mehmet",
    totalCalls: 1245000,
    revenueUsd: 12450,
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "uuid-2",
    name: "Mimar Sinan",
    totalCalls: 850000,
    revenueUsd: 8900,
    isActive: true,
    createdAt: "2026-02-14T10:00:00Z",
  },
  {
    id: "uuid-3",
    name: "Atatürk",
    totalCalls: 2100000,
    revenueUsd: 21000,
    isActive: true,
    createdAt: "2025-11-05T10:00:00Z",
  },
  {
    id: "uuid-4",
    name: "Nikola Tesla",
    totalCalls: 420000,
    revenueUsd: 4100,
    isActive: false,
    createdAt: "2026-05-20T10:00:00Z",
  },
];

// Sayı formatlayıcı yardımcılar
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
};

export function RevenueShare() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    // Gerçek senaryoda API'ye POST atılacak (örn: supabase.functions.invoke('withdraw'))
    setTimeout(() => {
      setIsWithdrawing(false);
      toast.success("Para çekme talebi başarıyla alındı.", {
        description: "İşleminiz 24 saat içinde hesabınıza aktarılacaktır.",
      });
    }, 1500);
  };

  return (
    <div className="animate-fade-up w-full space-y-6">
      {/* Üst Kısım - Başlık ve Aksiyon */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-fg-primary text-fg-secondaryxl font-semibold tracking-tight">
            Gelir Paylaşımı
          </h2>
          <p className="text-fg-muted mt-1 text-sm">
            AI Personalarınızın API kullanım metrikleri ve kazanç raporları.
          </p>
        </div>
        <Button
          onClick={handleWithdraw}
          isLoading={isWithdrawing}
          leftIcon={<DollarSign className="h-4 w-4" />}
          className="glow-brand"
        >
          Para Çek
        </Button>
      </div>

      {/* Özet Metrik Kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card variant="glass" className="group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity duration-300 group-hover:scale-110 group-hover:opacity-10">
            <Activity className="text-accent-400 h-24 w-24" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-medium">
              <Activity className="text-accent-400 h-4 w-4" /> Toplam API İsteği
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-fg-primary text-3xl font-bold">4,615,000</div>
            <p className="text-success-400 mt-2 flex items-center text-xs font-medium">
              <TrendingUp className="mr-1 h-3 w-3" /> +12.5% geçen haftaya göre
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity duration-300 group-hover:scale-110 group-hover:opacity-10">
            <DollarSign className="text-success-400 h-24 w-24" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-medium">
              <DollarSign className="text-success-400 h-4 w-4" /> Toplam Kazanç
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-gradient-neon text-3xl font-bold">Ölçülmedi</div>
            <p className="text-success-400 mt-2 flex items-center text-xs font-medium">
              <TrendingUp className="mr-1 h-3 w-3" /> +8.2% geçen haftaya göre
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity duration-300 group-hover:scale-110 group-hover:opacity-10">
            <Award className="text-warning-400 h-24 w-24" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-medium">
              <Award className="text-warning-400 h-4 w-4" /> Aktif Persona (En Yüksek)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-fg-primary truncate text-xl font-bold">Atatürk</div>
            <p className="text-fg-muted mt-2 flex items-center gap-1.5 text-xs font-medium">
              Global Rank:{" "}
              <span className="text-warning-400 bg-warning-500/10 border-warning-500/20 rounded border px-1.5 py-0.5 text-xs">
                #1
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik Alanı */}
      <Card variant="glass" className="p-2 sm:p-4">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg">Son 7 Günlük API Hacmi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--border-subtle)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--fg-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--fg-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    backdropFilter: "blur(12px)",
                    borderColor: "var(--border-strong)",
                    borderRadius: "12px",
                    color: "var(--fg-primary)",
                    boxShadow: "var(--glow-brand)",
                  }}
                  itemStyle={{ color: "var(--brand-400)", fontWeight: 600 }}
                  labelStyle={{ color: "var(--fg-muted)", marginBottom: "4px" }}
                  formatter={(value) => [formatNumber(Number(value) || 0), "API İstek"]}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="var(--brand-400)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                  activeDot={{
                    r: 6,
                    fill: "var(--brand-400)",
                    stroke: "var(--bg-primary)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detaylı Tablo */}
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="border-border-subtle bg-bg-secondary/20 border-b">
          <CardTitle className="text-lg">Dijital İkiz Kullanım Dağılımı</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-fg-muted bg-bg-secondary/40 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Persona (İkiz)</th>
                <th className="px-6 py-4 font-medium tracking-wider">API Çağrısı</th>
                <th className="px-6 py-4 font-medium tracking-wider">Gelir Payı ($)</th>
                <th className="px-6 py-4 font-medium tracking-wider">Durum</th>
                <th className="px-6 py-4 text-right font-medium tracking-wider">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-border-subtle divide-y">
              {personaData.map((item) => (
                <tr key={item.id} className="hover:bg-bg-elevated/60 group transition-colors">
                  <td className="text-fg-primary flex items-center gap-3 px-6 py-4 font-medium">
                    <div className="bg-gradient-brand shadow-glow-brand flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white opacity-90 transition-opacity group-hover:opacity-100">
                      {item.name.charAt(0)}
                    </div>
                    {item.name}
                  </td>
                  <td className="text-fg-secondary px-6 py-4 font-medium">
                    {formatNumber(item.totalCalls)}
                  </td>
                  <td className="text-success-400 px-6 py-4 font-semibold">
                    {formatCurrency(item.revenueUsd)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        item.isActive
                          ? "bg-success-500/10 text-success-400 border-success-500/20"
                          : "bg-fg-disabled/10 text-fg-muted border-border-subtle",
                      )}
                    >
                      {item.isActive && (
                        <span className="bg-success-500 h-1.5 w-1.5 animate-pulse rounded-full" />
                      )}
                      {item.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-fg-muted group-hover:text-brand-400 group-hover:bg-brand-500/10 h-8 w-8 transition-colors"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">Detay Görüntüle</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
