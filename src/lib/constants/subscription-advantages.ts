export interface SubscriptionAdvantage {
  id: string;
  name: string;
  monthlyCostUsd: number;
  planName: string;
  category: "infrastructure" | "ai_suite" | "developer_tools" | "gateway";
  efficiencyScorePct: number; // 0 - 100%
  keyPerks: {
    en: string[];
    tr: string[];
  };
  zeroCostAlternatives: {
    en: string[];
    tr: string[];
  };
  actionRequired?: {
    en: string;
    tr: string;
    url?: string;
  };
}

export interface FreeAiApiProvider {
  name: string;
  freeTierDetails: {
    en: string;
    tr: string;
  };
  rateLimits: string;
  topModels: string[];
  url: string;
  isIntegrated: boolean;
}

export const SUBSCRIPTION_ADVANTAGES: SubscriptionAdvantage[] = [
  {
    id: "vercel_pro",
    name: "Vercel Pro",
    monthlyCostUsd: 20.0,
    planName: "Pro Plan",
    category: "infrastructure",
    efficiencyScorePct: 95,
    keyPerks: {
      en: [
        "1,000 Build Minutes / month (Deploy gate optimized to save 90% build CPU)",
        "1 TB Edge Bandwidth & 12 Concurrent Builds",
        "100 Unlimited Cron Jobs (Edge scheduled tasks without server fees)",
        "Vercel Web Analytics & Speed Insights built-in",
        "300s Edge / Serverless Function Execution Timeout",
      ],
      tr: [
        "Aylık 1.000 Derleme Dakikası (Deploy gate sayesinde %90 CPU tasarrufu)",
        "1 TB Edge Bant Genişliği & 12 Eşzamanlı Derleme",
        "100 Sınırsız Cron Görevi (Ekstra sunucu maliyetsiz zamanlanmış görevler)",
        "Dahili Vercel Web Analitik & Performans İzleme",
        "300 saniye Sunucusuz İşlem Zaman Aşımı",
      ],
    },
    zeroCostAlternatives: {
      en: ["Cloudflare Pages (Zero cost, unlimited bandwidth)", "Netlify Pro ($19/mo)"],
      tr: ["Cloudflare Pages (Sıfır maliyet, sınırsız bant genişliği)", "Netlify Pro ($19/ay)"],
    },
  },
  {
    id: "supabase_pro",
    name: "Supabase Pro",
    monthlyCostUsd: 35.0,
    planName: "Pro Plan + Custom Domain Addon",
    category: "infrastructure",
    efficiencyScorePct: 98,
    keyPerks: {
      en: [
        "8 GB Production PostgreSQL DB (Zero 7-day inactivity pauses)",
        "100 GB Cloud Storage & 1,000 Image Transformations / mo",
        "Custom Domain (`auth.alparai.com`) for email & OAuth sovereignty",
        "Point-in-Time Recovery (PITR) & automated daily backups",
        "100,000 Monthly Active Users (MAU) & 500 Realtime WebSockets",
      ],
      tr: [
        "8 GB Üretim PostgreSQL DB (7 gün inaktiflikte uykudan muaf)",
        "100 GB Bulut Depolama & Aylık 1.000 Görsel Dönüştürme",
        "Özel Alan Adı (`auth.alparai.com`) ile e-posta ve OAuth egemenliği",
        "Zamana Duyarlı Kurtarma (PITR) & günlük otomatik yedekler",
        "Aylık 100.000 Aktif Kullanıcı (MAU) & 500 Gerçek Zamanlı Bağlantı",
      ],
    },
    zeroCostAlternatives: {
      en: ["AWS Aurora Serverless ($40+/mo)", "Neon Postgres (Free tier 0.5GB)"],
      tr: ["AWS Aurora Serverless ($40+/ay)", "Neon Postgres (Ücretsiz 0.5GB)"],
    },
  },
  {
    id: "google_ultra",
    name: "Google Ultra",
    monthlyCostUsd: 30.0,
    planName: "Advanced / Ultra Tier",
    category: "ai_suite",
    efficiencyScorePct: 92,
    keyPerks: {
      en: [
        "Google Labs FX & Flow (Veo, Imagen 3, ImageFX, VideoFX, MusicFX) visual credits",
        "$10-$100/mo Google Cloud / Vertex AI credits via Google Developer Program",
        "2,000,000 Token Gemini 1.5 Pro / 2.0 Flash Context Window for whole-codebase analysis",
        "NotebookLM Grounded RAG Knowledge Base (50 sources, 500k words)",
        "Jules AI PR & Automated Code Hygiene Agent (`/admin/ai-hub/jules`)",
      ],
      tr: [
        "Google Labs FX & Flow (Veo, Imagen 3, ImageFX, VideoFX, MusicFX) görsel medya kredileri",
        "Google Developer Program paneli üzerinden aylık $10-$100 GCP bulut kredisi",
        "Tüm kod tabanını tek seferde analiz eden 2.000.000 Token Gemini bağlam penceresi",
        "NotebookLM RAG Bilgi Bankası (50 kaynak, kaynak başı 500 bin kelime)",
        "Jules AI Otonom PR ve Kod Temizleme Ajanı (`/admin/ai-hub/jules`)",
      ],
    },
    zeroCostAlternatives: {
      en: ["Midjourney / Runway Gen-3 ($30+/mo)", "Google AI Studio Free Tier API"],
      tr: ["Midjourney / Runway Gen-3 ($30+/ay ek ücret)", "Google AI Studio Ücretsiz API"],
    },
    actionRequired: {
      en: "Claim monthly Google Cloud Credits at https://developers.google.com/program/my-benefits",
      tr: "https://developers.google.com/program/my-benefits adresinden aylık ücretsiz Google Cloud kredilerini aktifleştirin",
      url: "https://developers.google.com/program/my-benefits",
    },
  },
  {
    id: "claude_pro",
    name: "Claude Pro",
    monthlyCostUsd: 20.0,
    planName: "Pro Tier",
    category: "ai_suite",
    efficiencyScorePct: 90,
    keyPerks: {
      en: [
        "Claude 3.5 Sonnet & Claude 3 Opus access with 200,000 token context window",
        "Interactive Artifacts rendering & Project Knowledge repositories",
        "Claude Code CLI (terminal agent preview) for backend refactoring",
      ],
      tr: [
        "200.000 token bağlam penceresi ile Claude 3.5 Sonnet & Opus erişimi",
        "İnteraktif Artifacts arayüzü ve Proje Bilgi Bankası depoları",
        "Arka plan geliştirmeleri için Claude Code terminal istemcisi",
      ],
    },
    zeroCostAlternatives: {
      en: ["DeepSeek V3 / R1 (Free / Low Cost)", "ChatGPT Plus ($20/mo)"],
      tr: ["DeepSeek V3 / R1 (Ücretsiz / Çok Düşük Maliyet)", "ChatGPT Plus ($20/ay)"],
    },
  },
  {
    id: "github_pro",
    name: "GitHub Team/Pro",
    monthlyCostUsd: 4.0,
    planName: "Team / Pro Tier",
    category: "developer_tools",
    efficiencyScorePct: 96,
    keyPerks: {
      en: [
        "3,000 GitHub Actions Minutes / mo (Cron schedules moved to Vercel = 90% minutes saved)",
        "10 GB GitHub Container & Package Registry",
        "Dependabot, Gitleaks secret scanning & CodeQL vulnerability scanning",
        "180 Core Hours / mo GitHub Codespaces Cloud Development Environment",
      ],
      tr: [
        "Aylık 3.000 GitHub Actions Dakikası (Cron'lar Vercel'e taşınarak %90 tasarruf edildi)",
        "10 GB GitHub Konteyner & Paket Deposu",
        "Dependabot, Gitleaks gizli bilgi tarama & CodeQL güvenlik analizi",
        "Aylık 180 Çekirdek/Saat GitHub Codespaces Bulut Geliştirme Ortamı",
      ],
    },
    zeroCostAlternatives: {
      en: ["GitLab Free (400 mins/mo)", "Bitbucket Free"],
      tr: ["GitLab Ücretsiz (400 dk/ay)", "Bitbucket Ücretsiz"],
    },
  },
  {
    id: "openrouter",
    name: "OpenRouter Gateway",
    monthlyCostUsd: 10.0,
    planName: "Pay-as-you-go / Zero-Cost Allocation",
    category: "gateway",
    efficiencyScorePct: 99,
    keyPerks: {
      en: [
        "Zero-cost fallback to DeepSeek V3/R1 Free, Nemotron 3 Ultra Free, Ling 3.0 Free",
        "Unified API endpoint for 200+ frontier LLM models with automated fallback",
        "Token-level cost protection and usage budget enforcement",
      ],
      tr: [
        "DeepSeek V3/R1 Free, Nemotron 3 Ultra Free, Ling 3.0 Free modellerine sıfır maliyetli yönlendirme",
        "200+ gelişmiş LLM modeli için otomatik geri dönüşlü tek API uç noktası",
        "Token düzeyinde maliyet koruması ve kullanım bütçesi kontrolü",
      ],
    },
    zeroCostAlternatives: {
      en: ["Groq Cloud API (Free LPU)", "Cerebras API (Free LPU)"],
      tr: ["Groq Cloud API (Ücretsiz LPU)", "Cerebras API (Ücretsiz LPU)"],
    },
  },
  {
    id: "blackbox_ai",
    name: "Blackbox AI ($18.46 Active Balance)",
    monthlyCostUsd: 0.0,
    planName: "Prepaid API & Subscription Credits",
    category: "ai_suite",
    efficiencyScorePct: 97,
    keyPerks: {
      en: [
        "$9.86 API Credits active for high-speed OpenAI-compatible Pro model inference (`api.blackbox.ai/v1`)",
        "$8.60 Subscription Credits active for Pro Chat, App Builder & VSCode/JetBrains IDE agents",
        "DeepSeek R1, GPT-4o, and Claude 3.5 Sonnet low-cost developer code generation",
      ],
      tr: [
        "$9.86 API Kredisi OpenAI-uyumlu Pro model çıkarımı için aktif (`api.blackbox.ai/v1`)",
        "$8.60 Abonelik Kredisi Pro Sohbet, App Builder ve VSCode/JetBrains IDE ajanları için aktif",
        "DeepSeek R1, GPT-4o ve Claude 3.5 Sonnet ile düşük maliyetli geliştirici kod üretimi",
      ],
    },
    zeroCostAlternatives: {
      en: ["Google AI Studio Free Tier", "Groq Cloud API"],
      tr: ["Google AI Studio Ücretsiz Katman", "Groq Cloud API"],
    },
  },
];

export const FREE_AI_API_PROVIDERS: FreeAiApiProvider[] = [
  {
    name: "Blackbox AI ($18.46 Active Credits)",
    freeTierDetails: {
      en: "$9.86 API Credits (Pro Models, Remote/CLI Agent) + $8.60 Subscription Credits (Pro Chat, VSCode/JetBrains Agent). High-throughput code generation & DeepSeek R1 routing.",
      tr: "$9.86 API Kredisi (Pro Modeller, Remote/CLI Ajanı) + $8.60 Abonelik Kredisi (Pro Sohbet, VSCode/JetBrains Ajanı). Yüksek hızlı kod üretimi ve DeepSeek R1 yönlendirmesi.",
    },
    rateLimits: "20 RPM / 200k TPM",
    topModels: ["Blackbox Code", "DeepSeek R1", "GPT-4o", "Claude 3.5 Sonnet"],
    url: "https://app.blackbox.ai",
    isIntegrated: true,
  },
  {
    name: "Groq Cloud API",
    freeTierDetails: {
      en: "Permanent free tier with ultra-fast LPU inference (500+ tokens/sec) for open-weight models.",
      tr: "Açık kaynaklı modeller için ultra hızlı LPU çıkarımlı (500+ token/sn) kalıcı ücretsiz plan.",
    },
    rateLimits: "30 RPM / 14,400 RPD / 500k TPM",
    topModels: ["Llama 3.3 70B", "DeepSeek R1 Distill", "Mixtral 8x7B"],
    url: "https://console.groq.com",
    isIntegrated: true,
  },
  {
    name: "Google AI Studio",
    freeTierDetails: {
      en: "Permanent free tier for Gemini 2.0 Flash & 1.5 Pro with 2M token context window.",
      tr: "2M token bağlam pencereli Gemini 2.0 Flash & 1.5 Pro için kalıcı ücretsiz kullanım.",
    },
    rateLimits: "15 RPM / 1,000,000 TPM / 1,500 RPD",
    topModels: ["Gemini 2.0 Flash", "Gemini 1.5 Pro", "Gemini 2.0 Flash Thinking"],
    url: "https://aistudio.google.com",
    isIntegrated: true,
  },
  {
    name: "Cerebras Cloud",
    freeTierDetails: {
      en: "Ultra-high-speed wafer-scale inference (2,000 tokens/sec) with $5 initial free trial.",
      tr: "$5 ücretsiz deneme kredisi ile dünyanın en hızlı çıkarım çipi (2.000 token/sn).",
    },
    rateLimits: "30 RPM / 1,000,000 TPM",
    topModels: ["Llama 3.3 70B", "Llama 3.1 8B"],
    url: "https://cloud.cerebras.ai",
    isIntegrated: false,
  },
  {
    name: "Cloudflare Workers AI",
    freeTierDetails: {
      en: "10,000 free neurons per day integrated directly into Cloudflare Edge Workers.",
      tr: "Cloudflare Edge ağında günlük 10.000 ücretsiz nöron kullanım hakkı.",
    },
    rateLimits: "10,000 Neurons / Day",
    topModels: ["Llama 3.3 70B", "Whisper Speech-to-Text", "Flux.1 Schnell"],
    url: "https://dash.cloudflare.com",
    isIntegrated: false,
  },
  {
    name: "SambaNova Systems",
    freeTierDetails: {
      en: "Persistent free tier for testing frontier-scale models including Llama 3.1 405B.",
      tr: "Llama 3.1 405B gibi devasa modelleri test etmek için kalıcı ücretsiz katman.",
    },
    rateLimits: "20 RPM / 500k TPM",
    topModels: ["Llama 3.1 405B", "Llama 3.3 70B", "DeepSeek R1"],
    url: "https://cloud.sambanova.ai",
    isIntegrated: false,
  },
  {
    name: "Mistral AI (la Plateforme)",
    freeTierDetails: {
      en: "Permanent free tier for open-weight model experimentation and GDPR-compliant inference.",
      tr: "Açık kaynaklı modeller ve KVKK/GDPR uyumlu çıkarım için kalıcı ücretsiz plan.",
    },
    rateLimits: "10 RPM / 200k TPM",
    topModels: ["Codestral 2501", "Mistral Small", "Mistral NeMo"],
    url: "https://console.mistral.ai",
    isIntegrated: false,
  },
];
