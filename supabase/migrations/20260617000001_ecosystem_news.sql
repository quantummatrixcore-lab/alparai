create table public.ecosystem_news (
  id           uuid primary key default gen_random_uuid(),
  title_en     text not null,
  title_tr     text,
  summary_en   text,
  summary_tr   text,
  url          text,
  source       text,
  category     text not null default 'news',
  severity     text not null default 'medium' check (severity in ('critical', 'high', 'medium', 'low')),
  is_featured  boolean not null default false,
  is_active    boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.ai_polls
  add column if not exists context_news_id uuid references public.ecosystem_news(id) on delete set null;

alter table public.ecosystem_news enable row level security;

create policy "public_read_news"
  on public.ecosystem_news
  for select
  using (is_active = true);

create policy "admin_all_news"
  on public.ecosystem_news
  for all
  using (public.is_moderator(auth.uid()));

create index ecosystem_news_published_at_idx on public.ecosystem_news (published_at desc);
create index ecosystem_news_severity_idx on public.ecosystem_news (severity);

insert into public.ecosystem_news (title_en, title_tr, summary_en, summary_tr, url, source, category, severity, is_featured) values
(
  'Trump Administration Bans Claude Fable 5 and Mythos 5 for Foreign Users',
  'Trump Yönetimi Claude Fable 5 ve Mythos 5''i Yabancı Kullanıcılara Yasakladı',
  'The US Department of Commerce directed Anthropic to restrict access to its latest Claude models for all foreign nationals, citing national security risks related to potential jailbreaking by entities linked to China. Anthropic, unable to distinguish users by nationality, shut down the models globally.',
  'ABD Ticaret Bakanlığı, Anthropic''e en yeni Claude modellerine tüm yabancı uyruklu kullanıcıların erişimini kısıtlamasını emretti. Gerekçe: Çin bağlantılı kuruluşların jailbreak yoluyla hassas güvenlik bilgilerine ulaşması riski. Anthropic, kullanıcıları uyrukla ayırt edemeyeceğini belirterek modelleri küresel ölçekte kapattı.',
  'https://www.anthropic.com',
  'Anthropic / US DoC',
  'regulation',
  'critical',
  true
),
(
  'EU AI Act Article 50 Now in Force: Chatbots Must Disclose AI Origin',
  'AB AI Yasası Madde 50 Yürürlükte: Chatbotlar AI Kökenini Açıklamak Zorunda',
  'As of August 1, 2026, the EU AI Act''s transparency requirements are fully binding. AI-generated content, deepfakes, and chatbot interactions must now carry machine-readable disclosures. Non-compliance carries fines up to €15M or 3% of global annual turnover.',
  '1 Ağustos 2026 itibarıyla AB AI Yasası''nın şeffaflık gereklilikleri tam bağlayıcı hale geldi. AI üretilen içerikler, deepfake''ler ve chatbot etkileşimlerinin artık makine tarafından okunabilir açıklamalar taşıması zorunlu. Uyumsuzluk: 15M€ veya küresel yıllık ciromun %3''üne kadar para cezası.',
  'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
  'European Commission',
  'regulation',
  'high',
  false
),
(
  'South Korea AI Act Includes Criminal Penalties — A Global First',
  'Güney Kore AI Yasası Hapis Cezası İçeriyor — Küresel Bir İlk',
  'South Korea''s second comprehensive AI law, effective January 2026, introduces criminal liability for AI-related violations — the first jurisdiction globally to do so. Violations involving high-risk AI systems in healthcare, transportation, and critical infrastructure can result in prison terms.',
  'Ocak 2026''da yürürlüğe giren Güney Kore''nin ikinci kapsamlı AI yasası, AI ihlalleri için cezai yaptırım getiriyor — küresel bir ilk. Sağlık, ulaşım ve kritik altyapıdaki yüksek riskli AI sistemlerini kapsayan ihlaller hapis cezasıyla sonuçlanabilir.',
  'https://www.korea.kr',
  'Republic of Korea',
  'regulation',
  'high',
  false
),
(
  'EchoLeak: Zero-Click Vulnerability Exposed Enterprise AI Chat Data',
  'EchoLeak: Sıfır Tıklamayla Kurumsal AI Sohbet Verisi Sızdırıldı',
  'Security researchers disclosed "EchoLeak," a zero-click vulnerability affecting multiple enterprise AI tools that allowed attackers to exfiltrate conversation history without user interaction. Affected vendors have patched the issue, but incident raises questions about AI tool security auditing.',
  'Güvenlik araştırmacıları, kurumsal AI araçlarını etkileyen ve kullanıcı etkileşimi olmadan sohbet geçmişini sızdıran "EchoLeak" adlı sıfır tıklamalı açığı ortaya koydu. Etkilenen satıcılar açığı kapattı; ancak olay, AI araçlarının güvenlik denetimi konusunda ciddi sorular doğurdu.',
  null,
  'Security Research',
  'security',
  'critical',
  false
),
(
  'AI Governance Platform Spending Reaches $492M in 2026',
  'AI Yönetim Platformu Harcamaları 2026''da 492 Milyon Dolara Ulaştı',
  'Organizations are investing heavily in AI governance infrastructure. Spending on platforms providing model approval, bias testing, audit logging, and risk assessment automation reached $492M in 2026 — a 340% increase from 2024. Organizations using governance platforms achieve 3.4x more effective oversight vs. manual processes.',
  'Kuruluşlar AI yönetim altyapısına ağır yatırım yapıyor. Model onay, önyargı testi, denetim kaydı ve risk değerlendirmesi otomasyonu sağlayan platformlara 2026''daki harcamalar 492 milyon dolara ulaştı — 2024''e göre %340 artış. Yönetim platformu kullanan kuruluşlar, manuel süreçlere kıyasla 3,4 kat daha etkili denetim sağlıyor.',
  null,
  'Industry Research',
  'research',
  'medium',
  false
);
