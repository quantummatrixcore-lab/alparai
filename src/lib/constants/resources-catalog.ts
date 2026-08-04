export interface Vendor {
  id: string;
  name: string;
  category: string;
  plan: string;
  cost: string;
  criticality: "high" | "medium" | "low";
  prosCons: { en: string; tr: string };
  alternatives: { en: string; tr: string };
  url: string;
}

export const VENDORS: Vendor[] = [
  // 1. Infrastructure
  {
    id: "vercel",
    name: "Vercel",
    category: "Hosting & Edge",
    plan: "Hobby Plan",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Zero cost, instant Git deployments. Con: Shared bandwidth, 10s serverless timeout, Hobby team limitations.",
      tr: "Artı: Sıfır maliyet, anında Git dağıtımları. Eksi: Paylaşımlı bant genişliği, 10 saniye sunucusuz işlem zaman aşımı limitleri.",
    },
    alternatives: {
      en: "Netlify (Medium switch cost, DNS changes required), Cloudflare Pages (Low cost, near-zero migration).",
      tr: "Netlify (Orta geçiş maliyeti, DNS değişikliği), Cloudflare Pages (Düşük maliyet, neredeyse sıfır göç).",
    },
    url: "https://vercel.com",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Database & Auth",
    plan: "Free Tier",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Real-time DB, integrated Auth & Storage, auto RLS. Con: 500MB DB limit, project pauses after 7 days inactivity.",
      tr: "Artı: Gerçek zamanlı veri tabanı, entegre Auth & Depolama, otomatik RLS. Eksi: 500MB DB limiti, 7 gün inaktiflikte durma.",
    },
    alternatives: {
      en: "Firebase (High migration cost), AWS Aurora Serverless + Auth0 (Very high switch cost, database refactoring needed).",
      tr: "Firebase (Yüksek geçiş maliyeti), AWS Aurora Serverless + Auth0 (Çok yüksek geçiş maliyeti, şema değişimi gerektirir).",
    },
    url: "https://supabase.com",
  },
  {
    id: "upstash",
    name: "upstash",
    category: "Redis / Rate Limiting",
    plan: "Free Tier",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Serverless Redis, zero-maintenance, HTTP client support. Con: 10,000 daily commands ceiling on free tier.",
      tr: "Artı: Sunucusuz Redis, sıfır bakım, HTTP istemci desteği. Eksi: Ücretsiz planda günlük 10.000 komut sınırı.",
    },
    alternatives: {
      en: "Redis Cloud (Low migration cost, URL change only), Self-hosted Redis on Fly.io (Medium complexity, maintenance cost).",
      tr: "Redis Cloud (Düşük geçiş maliyeti, sadece URL değişimi), Fly.io üzerinde kendinden barındırmalı Redis (Orta karmaşıklık).",
    },
    url: "https://upstash.com",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "DNS & Security",
    plan: "Free Tier",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Industry-standard DDoS protection, fast DNS resolution, global edge caching. Con: Edge rule limits on free plan.",
      tr: "Artı: Sektör standardı DDoS koruması, hızlı DNS çözümleme, küresel edge önbellekleme. Eksi: Ücretsiz planda kural sınırları.",
    },
    alternatives: {
      en: "AWS Route 53 (Medium switch cost, pay-per-query), Akamai (Enterprise tier, extremely high switch cost).",
      tr: "AWS Route 53 (Orta geçiş maliyeti, sorgu başına ödeme), Akamai (Kurumsal sınıf, çok yüksek geçiş maliyeti).",
    },
    url: "https://cloudflare.com",
  },
  {
    id: "resend",
    name: "Resend",
    category: "Email Services",
    plan: "Free Tier",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Modern developer-friendly API, fast deliverability. Con: 3,000 monthly emails limit, domain warm-up needed.",
      tr: "Artı: Geliştirici dostu modern API, hızlı teslimat. Eksi: Aylık 3.000 e-posta limiti, yeni alan adı ısınma ihtiyacı.",
    },
    alternatives: {
      en: "SendGrid (Low migration cost, API client replacement), Mailgun (Medium cost, SMTP configuration change).",
      tr: "SendGrid (Düşük maliyet, API istemci değişimi), Mailgun (Orta maliyet, SMTP yapılandırma değişimi).",
    },
    url: "https://resend.com",
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "Error & Crash Logs",
    plan: "Developer Free",
    cost: "$0.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Automatic stack traces, performance monitoring, Next.js SDK. Con: 5,000 errors/mo cap on free tier.",
      tr: "Artı: Otomatik yığın izleri, performans izleme, Next.js SDK. Eksi: Ücretsiz planda aylık 5.000 hata sınırı.",
    },
    alternatives: {
      en: "LogRocket (High cost, session replay focus), GlitchTip (Open source, self-hosting maintenance overhead).",
      tr: "LogRocket (Yüksek maliyet, oturum kaydı odaklı), GlitchTip (Açık kaynak, kendinden barındırma yükü).",
    },
    url: "https://sentry.io",
  },
  {
    id: "plausible",
    name: "Plausible Analytics",
    category: "Analytics & Telemetry",
    plan: "Growth Plan",
    cost: "$9.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Fully KVKK/GDPR compliant, lightweight script (< 1KB), zero cookies. Con: Paid-only, basic goal tracking.",
      tr: "Artı: Tam KVKK/GDPR uyumlu, hafif izleme betiği (< 1KB), çerezsiz. Eksi: Yalnızca ücretli, temel hedef takibi.",
    },
    alternatives: {
      en: "Umami Cloud (Free tier available, low switch cost), Google Analytics 4 (Free, but heavy script and compliance risks).",
      tr: "Umami Cloud (Ücretsiz plan mevcut, düşük geçiş maliyeti), Google Analytics 4 (Ücretsiz ama KVKK riskli).",
    },
    url: "https://plausible.io",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments Infrastructure",
    plan: "Pay-as-you-go",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Global payout capabilities, sleek Checkout forms, robust subscription billing API. Con: 2.9% + 30c base fee.",
      tr: "Artı: Küresel ödeme altyapısı, şık Checkout formları, abonelik API'si. Eksi: İşlem başına %2.9 + 30c temel ücret.",
    },
    alternatives: {
      en: "Paddle (Low migration, merchant of record), Adyen (Complex integration, enterprise focus only).",
      tr: "Paddle (Düşük göç maliyeti, kayıtlı satıcı), Adyen (Karmaşık entegrasyon, yalnızca kurumsal odaklı).",
    },
    url: "https://stripe.com",
  },

  // 2. AI Providers
  {
    id: "openrouter",
    name: "OpenRouter",
    category: "AI Gateway",
    plan: "Pay-as-you-go",
    cost: "~$2.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Single API for 200+ LLMs, auto-fallbacks, detailed logging, token-efficient. Con: Marginal network latency.",
      tr: "Artı: 200+ LLM için tek API, otomatik geri dönüşler, detaylı günlükleme. Eksi: Küçük de olsa ek ağ gecikmesi.",
    },
    alternatives: {
      en: "Direct API Integration (High complexity, separate billing), LiteLLM Proxy (Self-hosted maintenance needed).",
      tr: "Doğrudan API Entegrasyonu (Yüksek karmaşıklık, ayrı faturalar), LiteLLM Proxy (Sunucu bakım maliyeti).",
    },
    url: "https://openrouter.ai",
  },
  {
    id: "vertex",
    name: "Vertex AI",
    category: "AI Provider (Gemini)",
    plan: "Free Tier Creds",
    cost: "$0.00 / mo",
    criticality: "high",
    prosCons: {
      en: "Pro: Enterprise grade Gemini APIs, Imagen 3 access, high security. Con: Complex billing dashboard, strict IAM.",
      tr: "Artı: Kurumsal sınıf Gemini API'leri, Imagen 3 erişimi, yüksek güvenlik. Eksi: Karmaşık faturalandırma paneli.",
    },
    alternatives: {
      en: "AWS Bedrock (High migration cost, model coverage difference), Azure OpenAI (High compliance cost, enterprise focus).",
      tr: "AWS Bedrock (Yüksek geçiş maliyeti), Azure OpenAI (Yüksek uyumluluk maliyeti, kurumsal odaklı).",
    },
    url: "https://cloud.google.com/vertex-ai",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "AI Inference",
    plan: "Free Hub Tier",
    cost: "$0.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Host model weights, free inference endpoints for popular models. Con: Rate limits, cold starts on unused spaces.",
      tr: "Artı: Model ağırlıklarını barındırma, popüler modeller için ücretsiz çıkarım. Eksi: Hız limitleri, soğuk başlatma gecikmesi.",
    },
    alternatives: {
      en: "Replicate (Pay-per-second, high minimum cost), AWS SageMaker (Enterprise tier complexity, very high base cost).",
      tr: "Replicate (Saniye başına ödeme, yüksek taban), AWS SageMaker (Kurumsal karmaşıklık, çok yüksek taban maliyeti).",
    },
    url: "https://huggingface.co",
  },
  {
    id: "cohere",
    name: "Cohere",
    category: "AI Provider",
    plan: "Pay-as-you-go",
    cost: "$0.00 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: Industry-leading multilingual embeddings and rerank endpoints. Con: Limited general generative capabilities.",
      tr: "Artı: Sektör lideri çok dilli gömme (embeddings) ve rerank uç noktaları. Eksi: Sınırlı genel üretici yetenekleri.",
    },
    alternatives: {
      en: "OpenAI Embeddings (Low switch cost, vector dimensions match), Voyage AI (High performance, minor code changes).",
      tr: "OpenAI Embeddings (Düşük geçiş maliyeti, benzer vektör boyutları), Voyage AI (Yüksek performans).",
    },
    url: "https://cohere.com",
  },
  {
    id: "blackbox",
    name: "Blackbox AI",
    category: "AI Provider",
    plan: "Pay-as-you-go",
    cost: "$0.00 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: Fast code-generation endpoints, specialized programming intelligence. Con: Less general reasoning performance.",
      tr: "Artı: Hızlı kod üretme uç noktaları, uzmanlaşmış programlama zekası. Eksi: Daha zayıf genel akıl yürütme performansı.",
    },
    alternatives: {
      en: "Copilot API (Low switch cost, IDE-focused), Tabnine (Self-hosted options, medium switch cost).",
      tr: "Copilot API (Düşük geçiş maliyeti, IDE odaklı), Tabnine (Kendi sunucunda barındırma seçeneği).",
    },
    url: "https://blackbox.ai",
  },
  {
    id: "nvidia_ngc",
    name: "NVIDIA NGC",
    category: "AI GPU Cloud",
    plan: "Pay-as-you-go",
    cost: "$0.00 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: High-throughput NIM container deployments, hardware optimized. Con: Complex enterprise pricing, setup time.",
      tr: "Artı: Yüksek verimli NIM konteyner dağıtımları, optimize edilmiş donanım. Eksi: Karmaşık fiyatlandırma yapısı.",
    },
    alternatives: {
      en: "Replicate (Low switch cost, serverless API), RunPod (Low cost, raw container hosting, medium complexity).",
      tr: "Replicate (Düşük geçiş, sunucusuz API), RunPod (Düşük maliyet, ham konteyner barındırma).",
    },
    url: "https://catalog.ngc.nvidia.com",
  },
  {
    id: "openai",
    name: "OpenAI API",
    category: "Evaluation Fallback",
    plan: "Pay-as-you-go",
    cost: "~$1.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Standard GPT-4o capabilities, robust JSON schemas. Con: Strictly paid-only tier, require prepaid credits.",
      tr: "Artı: Standart GPT-4o yetenekleri, kararlı JSON şemaları. Eksi: Yalnızca ücretli kullanım, ön ödemeli kredi.",
    },
    alternatives: {
      en: "Anthropic API (High migration cost, prompt differences), DeepSeek API (Low cost, compatibility mode available).",
      tr: "Anthropic API (Yüksek geçiş maliyeti, prompt farkları), DeepSeek API (Düşük maliyet, uyumluluk modu).",
    },
    url: "https://openai.com",
  },

  // 3. AI Tooling Subscriptions
  {
    id: "claude_code",
    name: "Claude Code",
    category: "AI Tooling (CLI)",
    plan: "Pro Tier",
    cost: "$0.00 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: Seamless terminal-based code generation, fast context loading. Con: Tied to individual Anthropic billing.",
      tr: "Artı: Terminal tabanlı kusursuz kod üretimi, hızlı bağlam yükleme. Eksi: Bireysel Anthropic faturalandırması.",
    },
    alternatives: {
      en: "Aider (Open-source CLI, low switch cost, client-only), Cursor CLI (High feature parity, medium switch cost).",
      tr: "Aider (Açık kaynak terminal istemcisi, düşük geçiş maliyeti), Cursor CLI (Benzer özellikler).",
    },
    url: "https://anthropic.com/claude",
  },
  {
    id: "claude_pro",
    name: "Claude Pro",
    category: "AI Chat Interface",
    plan: "Paid Subscription",
    cost: "$20.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Access to top-tier Sonnet models, artifact rendering, large context windows. Con: Usage caps on peak hours.",
      tr: "Artı: En üst sınıf Sonnet modellerine erişim, interaktif arayüz. Eksi: Yoğun saatlerde kullanım kotaları.",
    },
    alternatives: {
      en: "ChatGPT Plus (Low switch cost, general usage), Gemini Advanced (High ecosystem integration, low switch cost).",
      tr: "ChatGPT Plus (Düşük geçiş maliyeti, genel kullanım), Gemini Advanced (Yüksek ekosistem entegrasyonu).",
    },
    url: "https://claude.ai",
  },
  {
    id: "opencode",
    name: "OpenCode",
    category: "UI/Frontend Agent",
    plan: "Developer Tier",
    cost: "$0.00 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: Dedicated frontend builder agent, fast tailwind/component scaffolding. Con: Specialized context limits.",
      tr: "Artı: Özelleşmiş ön yüz geliştirici ajanı, hızlı Tailwind ve bileşen iskeleti. Eksi: Sınırlı bağlam kapasitesi.",
    },
    alternatives: {
      en: "v0 by Vercel (Low switch cost, prompt-to-component), Lovable.dev (High capability, high switch cost).",
      tr: "v0 by Vercel (Düşük geçiş maliyeti, prompt ile bileşen üretimi), Lovable.dev (Yüksek yetenek).",
    },
    url: "https://opencode.dev",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    category: "Backend Agent",
    plan: "Developer Tier",
    cost: "$0.00 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: Full backend logic orchestration, DB migrations, automated test runs. Con: Requires deep codebase context.",
      tr: "Artı: Tüm arka plan lojik orkestrasyonu, veri tabanı göçleri, otomatik testler. Eksi: Derin kod tabanı bağlamı gereksinimi.",
    },
    alternatives: {
      en: "Cursor AI (Low switch cost, developer-driven), GitHub Copilot Workspace (High integration, medium switch cost).",
      tr: "Cursor AI (Düşük geçiş maliyeti, yazılımcı kontrolünde), GitHub Copilot Workspace (Yüksek entegrasyon).",
    },
    url: "https://antigravity.ai",
  },
  {
    id: "google_ultra",
    name: "Google Ultra",
    category: "AI Chat Interface",
    plan: "Advanced Tier",
    cost: "$19.99 / mo",
    criticality: "low",
    prosCons: {
      en: "Pro: High integration with Google Workspace, multimodal reasoning. Con: Subscriptions managed outside company billing.",
      tr: "Artı: Google Workspace ile yüksek entegrasyon, çok modlu akıl yürütme. Eksi: Şirket dışı abonelik yönetimi.",
    },
    alternatives: {
      en: "Claude Pro (Low switch cost, coding preference), ChatGPT Plus (Low switch cost, general reasoning preference).",
      tr: "Claude Pro (Düşük geçiş maliyeti), ChatGPT Plus (Düşük geçiş maliyeti, genel kullanım tercihi).",
    },
    url: "https://one.google.com/explore-plan/gemini-advanced",
  },

  // 4. Domains & Misc
  {
    id: "resend_domains_primary",
    name: "DNS & Domains",
    category: "Domain Registry",
    plan: "Custom Domain",
    cost: "$12.00 / yr",
    criticality: "high",
    prosCons: {
      en: "Pro: Identity sovereignty, required for brand outreach emails and SSL certs. Con: Annual recurring renewal cost.",
      tr: "Artı: Kimlik egemenliği, kurumsal e-postalar ve SSL sertifikaları için zorunlu. Eksi: Yıllık yenileme maliyeti.",
    },
    alternatives: {
      en: "Namecheap (Low migration cost, DNS transfer), GoDaddy (High renewal cost, aggressive upselling).",
      tr: "Namecheap (Düşük göç maliyeti, DNS transferi), GoDaddy (Yüksek yenileme maliyeti, agresif satış stratejileri).",
    },
    url: "https://resend.com/domains",
  },
  {
    id: "umami",
    name: "Umami Analytics",
    category: "Analytics & Telemetry",
    plan: "Free Cloud Tier",
    cost: "$0.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Privacy-friendly, GDPR/KVKK compliant, open-source engine, lightweight script. Con: 10,000 monthly events limit.",
      tr: "Artı: Gizlilik dostu, GDPR/KVKK uyumlu, hafif izleme betiği. Eksi: Ücretsiz planda aylık 10.000 olay sınırı.",
    },
    alternatives: {
      en: "Plausible Analytics (Paid only, high base cost), Google Analytics 4 (Intrusive, GDPR compliance issues).",
      tr: "Plausible Analytics (Yalnızca ücretli, yüksek taban), Google Analytics 4 (KVKK/GDPR uyum sorunları).",
    },
    url: "https://umami.is",
  },
  {
    id: "slack",
    name: "Slack Webhooks",
    category: "Operational Alerts",
    plan: "Free Workspace",
    cost: "$0.00 / mo",
    criticality: "medium",
    prosCons: {
      en: "Pro: Real-time incident & whitelist notifications directly to development channels. Con: 10k messages history limit.",
      tr: "Artı: Geliştirici kanallarına gerçek zamanlı bildirimler ve uyarılar. Eksi: 10 bin mesajlık geçmiş sınırı.",
    },
    alternatives: {
      en: "Discord Webhooks (Zero cost, minor payload structure adjustment), Telegram Bot API (Very low switch cost).",
      tr: "Discord Webhooks (Sıfır maliyet, küçük yapı değişikliği), Telegram Bot API (Çok düşük geçiş maliyeti).",
    },
    url: "https://slack.com",
  },
];
