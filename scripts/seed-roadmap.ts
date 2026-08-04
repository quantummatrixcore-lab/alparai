import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local if present
function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.substring(0, index).trim();
      let val = trimmed.substring(index + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local or environment.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const milestones = [
  {
    quarter: "2026-Q3",
    title: "Launch Gate — Go Live Aug 2",
    okr_text: "Pass final smoke test (Item 88); zero P0 defects; freeze Aug 1-9",
    progress: 95,
    status: "in_progress",
    linked_metric: "launch_gate",
  },
  {
    quarter: "2026-Q3",
    title: "First-Story Offensive",
    okr_text: "Publish 3 flagship incident stories from the 400+ registry; ≥5 media pickups",
    progress: 10,
    status: "planned",
    linked_metric: "media_mentions_count",
  },
  {
    quarter: "2026-Q3",
    title: "İş Bank AI Factory Application",
    okr_text: "Submit application (docs/APPLICATIONS/001); reach interview shortlist",
    progress: 60,
    status: "in_progress",
    linked_metric: "funding_pipeline",
  },
  {
    quarter: "2026-Q3",
    title: "1,000 Registered Users",
    okr_text: "Convert launch traffic; activate Founding Reporter badge loop",
    progress: 5,
    status: "planned",
    linked_metric: "total_users",
  },
  {
    quarter: "2026-Q4",
    title: "K-BENCHMARK Public Credibility",
    okr_text: "Methodology Committee ≥3 named members; FAccT paper submitted",
    progress: 25,
    status: "planned",
    linked_metric: "expert_count",
  },
  {
    quarter: "2026-Q4",
    title: "Enterprise Pilot ×3",
    okr_text: "3 corporate pilots (bank/telecom/insurer) on B2B risk-score API",
    progress: 0,
    status: "planned",
    linked_metric: "enterprise_pilots",
  },
  {
    quarter: "2026-Q4",
    title: "Revenue Ignition",
    okr_text: "Stripe live; first paying Pro subscribers; MRR > 0",
    progress: 0,
    status: "planned",
    linked_metric: "mrr_cents",
  },
  {
    quarter: "2026-Q4",
    title: "Regulator Bridge",
    okr_text: "KVKK + TR AISI working contact; OECD AIM feed cited",
    progress: 30,
    status: "planned",
    linked_metric: "regulator_contacts",
  },
  {
    quarter: "2027-Q1",
    title: "EU Art. 73 Readiness Product",
    okr_text: "Compliance-report generator for Dec 2, 2027 deadline; 10 beta customers",
    progress: 0,
    status: "planned",
    linked_metric: "art73_beta",
  },
  {
    quarter: "2027-Q2",
    title: "Certified AI Auditor Program",
    okr_text: "Academy certification cohort #1 (≥25 auditors)",
    progress: 0,
    status: "planned",
    linked_metric: "certification",
  },
  {
    quarter: "2027-Q3",
    title: "EU Market Entry",
    okr_text: "EN/DE landing; 2 EU enterprise customers; EU entity decision",
    progress: 0,
    status: "planned",
    linked_metric: "eu_customers",
  },
  {
    quarter: "2027-Q4",
    title: "Series-A Readiness",
    okr_text: "≥$20K MRR, ≥5K incidents, ≥2 regulator citations → raise",
    progress: 0,
    status: "planned",
    linked_metric: "series_a_gate",
  },
];

const todos = [
  // Priority 1
  {
    title: "Cloudflare Email Routing: hello@, press@, academy@, security@ → ercuerden@gmail.com",
    priority: 1,
    is_completed: false,
  },
  { title: "Twitter/X hesabı aç: @alparai_official", priority: 1, is_completed: false },
  {
    title: "LinkedIn Şirket Sayfası aç: linkedin.com/company/alparai",
    priority: 1,
    is_completed: false,
  },
  { title: "YouTube Kanalı aç: ALPAR AI", priority: 1, is_completed: false },
  {
    title:
      'HackerNews Show HN gönderisi yayınla — "I built Trustpilot for AI after Grok asked for my passport"',
    priority: 1,
    is_completed: false,
  },
  {
    title: "Reddit gönderileri: r/MachineLearning, r/artificial, r/ArtificialIntelligence",
    priority: 1,
    is_completed: false,
  },
  {
    title: "Prof. Dr. İsmail Hakkı Aydın davet maili gönder (ALPAR AI Uzman Paneli)",
    priority: 1,
    is_completed: false,
  },
  {
    title: 'LinkedIn Video 1 "The Lie" — Google Flow + CapCut, soru ile bitecek caption',
    priority: 1,
    is_completed: false,
  },
  {
    title: "KVKK resmi şikayet: kvkk.gov.tr — Şikayet metni hazır",
    priority: 1,
    is_completed: false,
  },
  {
    title: "Paul Maréchal görüşmesi — Ercüment açacak, Ali devralacak",
    priority: 1,
    is_completed: false,
  },
  { title: "Ahmet'e 7 haberi gönder (AHMET_7_HABER_FINAL.md)", priority: 1, is_completed: false },

  // Priority 2
  {
    title:
      "AI Influencer Outreach: Gary Marcus, Timnit Gebru, Emily Bender, Margaret Mitchell, Ethan Mollick",
    priority: 2,
    is_completed: false,
  },
  {
    title:
      "AI Medya Outreach: MIT Technology Review, 404 Media, Import AI (Jack Clark), Semafor, The Information",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Uluslararası Medya: TechCrunch, Wired, Guardian WhatsApp, BBC WhatsApp",
    priority: 2,
    is_completed: false,
  },
  {
    title: "AI Güvenlik Kuruluşları: AI Incident Database, AI Now Institute, DAIR Institute, EFF",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Anthropic Verified Respondent teklifi gönder: press@anthropic.com",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Anthropic API Kredisi başvurusu: anthropic.com/startups",
    priority: 2,
    is_completed: false,
  },
  { title: "Google for Startups başvurusu: startup.google.com", priority: 2, is_completed: false },
  { title: "AWS Activate başvurusu: aws.amazon.com/activate", priority: 2, is_completed: false },
  {
    title: "TÜBİTAK 1512 ön kayıt: bigg.team — 200.000 TL hibe, sıfır hisse",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Expert Panel — İlk 10 uzman davet et (Akademisyen, Avukat, Doktor, Etik Uzman)",
    priority: 2,
    is_completed: false,
  },
  {
    title: "ercumenterden.com güncellemesi (Antigravity master prompt hazır)",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Site güncellemeleri (SITE_GUNCELLEME_MASTER_PROMPT.md)",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Sosyal medya içerik takvimi: Haftada 3 gönderi minimum, video öncelikli",
    priority: 2,
    is_completed: false,
  },
  {
    title: 'LinkedIn Video 2 "The Mirror" — Sycophancy konusu, profesyonel kitleye',
    priority: 2,
    is_completed: false,
  },
  {
    title: 'LinkedIn Video 3 "The Question" — AI silah sorusu, tartışma yaratır',
    priority: 2,
    is_completed: false,
  },
  {
    title: 'Newsletter başlat: "ALPAR AI Monthly Trust Report" — Substack ücretsiz',
    priority: 2,
    is_completed: false,
  },
  {
    title: "Product Hunt lansmanı planla: 2-3 hafta sonra, 500 upvote için topluluk oluştur",
    priority: 2,
    is_completed: false,
  },
  {
    title:
      "Podcast outreach: Latent Space, Practical AI (changelog.com/practicalai), Last Week in AI",
    priority: 2,
    is_completed: false,
  },
  {
    title: "Instagram hesabı aç: @alparai.official (Reels/video içerik)",
    priority: 2,
    is_completed: false,
  },
  { title: "TikTok hesabı aç: @alparai (genç kitleye ulaşmak)", priority: 2, is_completed: false },

  // Priority 3
  {
    title: "EIC Pre-Accelerator Başvurusu: ec.europa.eu/eic — €500K-1M, sıfır hisse",
    priority: 3,
    is_completed: false,
  },
  {
    title: "University MOU Outreach: Boğaziçi, ODTÜ veya İTÜ — AI etik araştırma grubu",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Product Hunt Launch: producthunt.com/posts/alpar-ai — 500+ upvote hedefi",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Advisory Board — 3 Kişi: Akademisyen + Hukukçu + Güvenlik Uzmanı (ücretsiz)",
    priority: 3,
    is_completed: false,
  },
  {
    title: "GitHub Repo Split: Public frontend + veri şeması / Private moderasyon algoritması",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Response Rate Metric: Leaderboard ve provider profil sayfalarına yanıt oranı ekle",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Developer API: Güvenlik araştırmacıları için programatik erişim (v1/leaderboard)",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Lloyd's of London ilk temas: insurtech@lloyds.com — sigorta sektörü ortaklığı",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Future of Life Institute Grant: futureoflife.org/grants — AI safety odaklı",
    priority: 3,
    is_completed: false,
  },
  {
    title: "Open Philanthropy Grant Başvurusu: openphilanthropy.org",
    priority: 3,
    is_completed: false,
  },
  { title: "Şirket tescili: Hukuki süreç başlatılmalı", priority: 3, is_completed: false },
  { title: "Gizlilik politikası tam değil: Avukat incelemesi", priority: 3, is_completed: false },
];

async function main() {
  // Fetch existing milestones
  const { data: existingMilestones, error: fetchMErr } = await supabase
    .from("strategy_milestones")
    .select("title");

  if (fetchMErr) {
    console.error("Error fetching strategy milestones:", fetchMErr.message);
    process.exit(1);
  }
  const existingMilestoneTitles = new Set(existingMilestones.map((m) => m.title));

  console.log("Seeding roadmap strategy milestones...");
  const milestonesToInsert = milestones.filter((m) => !existingMilestoneTitles.has(m.title));
  if (milestonesToInsert.length > 0) {
    const { error: insertErr } = await supabase
      .from("strategy_milestones")
      .insert(milestonesToInsert);
    if (insertErr) {
      console.error("Error inserting milestones:", insertErr.message);
    } else {
      console.log(`✓ Inserted ${milestonesToInsert.length} milestones.`);
    }
  } else {
    console.log("No new milestones to insert.");
  }

  // Fetch existing todos
  const { data: existingTodos, error: fetchTErr } = await supabase
    .from("strategy_todos")
    .select("title");

  if (fetchTErr) {
    console.error("Error fetching strategy todos:", fetchTErr.message);
    process.exit(1);
  }
  const existingTodoTitles = new Set(existingTodos.map((t) => t.title));

  console.log("Seeding roadmap strategy todos...");
  const todosToInsert = todos.filter((t) => !existingTodoTitles.has(t.title));
  if (todosToInsert.length > 0) {
    const { error: insertErr } = await supabase.from("strategy_todos").insert(todosToInsert);
    if (insertErr) {
      console.error("Error inserting todos:", insertErr.message);
    } else {
      console.log(`✓ Inserted ${todosToInsert.length} todos.`);
    }
  } else {
    console.log("No new todos to insert.");
  }

  console.log("Roadmap seeding complete!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
