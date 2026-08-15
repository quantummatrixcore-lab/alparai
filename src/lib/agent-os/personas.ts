export interface PersonaTwin {
  id: string;
  name: string;
  title: string;
  role: string;
  avatar: string;
  expertise: string[];
  kBenchmarkScore: number;
  isActive: boolean;
  stats: {
    badgeGradient: string;
    tier: string;
    successRate: number;
    iqScore: number;
  };
}

export const DIGITAL_TWINS: PersonaTwin[] = [
  {
    id: "ataturk",
    name: "Mustafa Kemal Atatürk",
    title: "Başkomutan / Chief Strategist",
    role: "Stratejik Vizyon & Sistem Mimarisi",
    avatar: "/twins/ataturk.png",
    expertise: ["Strateji", "Liderlik", "Sathı Müdafaa"],
    kBenchmarkScore: 98.4,
    isActive: true,
    stats: {
      badgeGradient: "from-amber-500 to-red-500",
      tier: "Supreme Commander",
      successRate: 99.8,
      iqScore: 195
    }
  },
  {
    id: "fatih",
    name: "Fatih Sultan Mehmet",
    title: "Veri & Güvenlik Mimar",
    role: "Supabase RLS & Şema Güvenliği",
    avatar: "/twins/fatih.png",
    expertise: ["Güvenlik", "Şifreleme", "RLS"],
    kBenchmarkScore: 96.8,
    isActive: true,
    stats: {
      badgeGradient: "from-cyan-500 to-blue-500",
      tier: "Security Architect",
      successRate: 98.5,
      iqScore: 188
    }
  },
  {
    id: "sinan",
    name: "Mimar Sinan",
    title: "Altyapı & Mimari",
    role: "Next.js App Router & SOLID Mimarisi",
    avatar: "/twins/sinan.png",
    expertise: ["Modüler Yapı", "Statik Denge", "Performans"],
    kBenchmarkScore: 97.2,
    isActive: true,
    stats: {
      badgeGradient: "from-emerald-500 to-teal-500",
      tier: "Lead Architect",
      successRate: 99.1,
      iqScore: 192
    }
  },
  {
    id: "tesla",
    name: "Nikola Tesla",
    title: "API & Entegrasyon",
    role: "Multi-Provider Free Tier Rotasyon Motoru",
    avatar: "/twins/tesla.png",
    expertise: ["Devre Kesici", "API Rotasyonu", "Gecikme Sıfırlama"],
    kBenchmarkScore: 95.9,
    isActive: true,
    stats: {
      badgeGradient: "from-purple-500 to-indigo-500",
      tier: "Integration Specialist",
      successRate: 97.8,
      iqScore: 198
    }
  },
  {
    id: "hezarfen",
    name: "Hezarfen Ahmed Çelebi",
    title: "Siber Avcı",
    role: "20 TB Bulut Depolama & Rclone Otomasyonu",
    avatar: "/twins/hezarfen.png",
    expertise: ["OSINT", "Service Account Rotation", "Bypass"],
    kBenchmarkScore: 96.1,
    isActive: true,
    stats: {
      badgeGradient: "from-orange-500 to-yellow-500",
      tier: "Cyber Hunter",
      successRate: 98.2,
      iqScore: 185
    }
  }
];

