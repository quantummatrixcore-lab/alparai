"use client";

import React, { useState } from "react";
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
    createdAt: "2026-01-10T10:00:00Z" 
  },
  { 
    id: "uuid-2", 
    name: "Mimar Sinan", 
    totalCalls: 850000, 
    revenueUsd: 8900, 
    isActive: true, 
    createdAt: "2026-02-14T10:00:00Z" 
  },
  { 
    id: "uuid-3", 
    name: "Atatürk", 
    totalCalls: 2100000, 
    revenueUsd: 21000, 
    isActive: true, 
    createdAt: "2025-11-05T10:00:00Z" 
  },
  { 
    id: "uuid-4", 
    name: "Nikola Tesla", 
    totalCalls: 420000, 
    revenueUsd: 4100, 
    isActive: false, 
    createdAt: "2026-05-20T10:00:00Z" 
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
        description: "İşleminiz 24 saat içinde hesabınıza aktarılacaktır."
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 w-full animate-fade-up">
      {/* Üst Kısım - Başlık ve Aksiyon */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg-primary">Gelir Paylaşımı</h2>
          <p className="text-sm text-fg-muted mt-1">AI Personalarınızın API kullanım metrikleri ve kazanç raporları.</p>
        </div>
        <Button 
          onClick={handleWithdraw} 
          isLoading={isWithdrawing}
          leftIcon={<DollarSign className="w-4 h-4" />}
          className="glow-brand"
        >
          Para Çek
        </Button>
      </div>

      {/* Özet Metrik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 group-hover:scale-110">
            <Activity className="w-24 h-24 text-accent-400" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-fg-muted flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-400" /> Toplam API İsteği
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-fg-primary">4,615,000</div>
            <p className="text-xs text-success-400 flex items-center mt-2 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% geçen haftaya göre
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 group-hover:scale-110">
            <DollarSign className="w-24 h-24 text-success-400" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-fg-muted flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success-400" /> Toplam Kazanç
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-gradient-neon">$46,450.00</div>
            <p className="text-xs text-success-400 flex items-center mt-2 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +8.2% geçen haftaya göre
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 group-hover:scale-110">
            <Award className="w-24 h-24 text-warning-400" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-fg-muted flex items-center gap-2">
              <Award className="w-4 h-4 text-warning-400" /> Aktif Persona (En Yüksek)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-bold text-fg-primary truncate">Atatürk</div>
            <p className="text-xs text-fg-muted mt-2 flex items-center gap-1.5 font-medium">
               Global Rank: <span className="text-warning-400 bg-warning-500/10 px-1.5 py-0.5 rounded text-xs border border-warning-500/20">#1</span>
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
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
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
                    backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                    backdropFilter: 'blur(12px)',
                    borderColor: 'var(--border-strong)', 
                    borderRadius: '12px',
                    color: 'var(--fg-primary)',
                    boxShadow: 'var(--glow-brand)'
                  }}
                  itemStyle={{ color: 'var(--brand-400)', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--fg-muted)', marginBottom: '4px' }}
                  formatter={(value: number) => [formatNumber(value), "API İstek"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="var(--brand-400)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCalls)" 
                  activeDot={{ r: 6, fill: "var(--brand-400)", stroke: "var(--bg-primary)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detaylı Tablo */}
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="border-b border-border-subtle bg-bg-secondary/20">
          <CardTitle className="text-lg">Dijital İkiz Kullanım Dağılımı</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-fg-muted uppercase bg-bg-secondary/40">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Persona (İkiz)</th>
                <th className="px-6 py-4 font-medium tracking-wider">API Çağrısı</th>
                <th className="px-6 py-4 font-medium tracking-wider">Gelir Payı ($)</th>
                <th className="px-6 py-4 font-medium tracking-wider">Durum</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {personaData.map((item) => (
                <tr key={item.id} className="hover:bg-bg-elevated/60 transition-colors group">
                  <td className="px-6 py-4 font-medium text-fg-primary flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs shadow-glow-brand opacity-90 group-hover:opacity-100 transition-opacity">
                      {item.name.charAt(0)}
                    </div>
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-fg-secondary font-medium">
                    {formatNumber(item.totalCalls)}
                  </td>
                  <td className="px-6 py-4 text-success-400 font-semibold">
                    {formatCurrency(item.revenueUsd)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5",
                      item.isActive 
                        ? "bg-success-500/10 text-success-400 border-success-500/20" 
                        : "bg-fg-disabled/10 text-fg-muted border-border-subtle"
                    )}>
                      {item.isActive && <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />}
                      {item.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-fg-muted group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
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
