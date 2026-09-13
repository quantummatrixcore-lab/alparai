const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dehost', 'migrations', '0003_seeds.sql');
let s = fs.readFileSync(filePath, 'utf8');

const targetStart = "-- Table: public.strategy_milestones (13 statements, guarded)";
const targetEnd = "-- Table: public.strategy_valuations (1 statements, guarded)";

const startIdx = s.indexOf(targetStart);
const endIdx = s.indexOf(targetEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error("Indices not found!", startIdx, endIdx);
  process.exit(1);
}

const rawRows = [
  ["2026-Q3", "1,000 Registered Users", "Convert launch traffic; activate Founding Reporter badge loop", 5, "planned", "total_users"],
  ["2026-Q3", "Academy Sayfası Canlıya Alma", "ALPAR AI Academy sayfasını yayınla, nav+footer entegre et.", 90, "in_progress", "academy_page"],
  ["2026-Q3", "AI Güvenlik Kuruluşları — Ortaklık", "AI Incident Database, AI Now Institute, DAIR Institute, EFF, Mozilla Foundation — misyon uyumu görüşmeleri başlat.", 0, "planned", "org_partnership"],
  ["2026-Q3", "AI Influencer Outreach", "Gary Marcus, Timnit Gebru, Emily M. Bender, Margaret Mitchell, Ethan Mollick — doğrudan mesaj gönder.", 100, "done", "influencer_outreach"],
  ["2026-Q3", "AI Medya Outreach", "MIT Technology Review, The Information, Semafor, 404 Media, Import AI (Jack Clark), Last Week in AI — haber pitchi gönder.", 100, "done", "media_outreach"],
  ["2026-Q3", "Anthropic Verified Respondent Teklifi", "press@anthropic.com'a Verified Respondent Program teklifini ilet. Ayrı olarak startups@anthropic.com'a API kredisi başvurusu yap.", 100, "done", "partnership"],
  ["2026-Q3", "EIC Pre-Accelerator Başvurusu", "EU Funding & Tenders portalı üzerinden İngilizce başvuru tamamla. Türkiye widening country olarak uygun. Hedef: €500K-1M hibe, sıfır hisse.", 0, "planned", "funding"],
  ["2026-Q3", "First-Story Offensive", "Publish 3 flagship incident stories from the 400+ registry; ≥5 media pickups", 10, "planned", "media_mentions_count"],
  ["2026-Q3", "HackerNews & Reddit — AI Topluluğu", "Show HN gönderisi yayınla. r/MachineLearning, r/artificial, r/ArtificialIntelligence paylaşımları tamamla.", 0, "planned", "community_outreach"],
  ["2026-Q3", "İlk 3 MOU İmzası", "Boğaziçi, ODTÜ veya İTÜ'den en az 1 pilot MOU al.", 15, "in_progress", "mou_count"],
  ["2026-Q3", "İş Bank AI Factory Application", "Submit application (docs/APPLICATIONS/001); reach interview shortlist", 60, "in_progress", "funding_pipeline"],
  ["2026-Q3", "Kurumsal Mail Aktivasyonu", "hello@alparai.com, press@alparai.com, academy@alparai.com, security@alparai.com adreslerini Cloudflare Email Routing ile aktif et.", 0, "planned", "infrastructure"],
  ["2026-Q3", "Launch Gate — Go Live Aug 2", "Pass final smoke test (Item 88); zero P0 defects; freeze Aug 1-9", 95, "in_progress", "launch_gate"],
  ["2026-Q3", "TÜBİTAK 1512 BiGG Başvurusu", "Uygulayıcı kuruluş seç, ön kayıt tamamla, iş planı hazırla. Hedef: 200.000 TL hibe.", 0, "planned", "funding"],
  ["2026-Q3", "Türk AI Ekosistemi Outreach", "Deep Learning Türkiye, Global AI Hub, TÜSİAD Dijital Türkiye Platformu — içerik paylaşımı ve iletişim.", 0, "planned", "local_ecosystem"],
  ["2026-Q3", "Uzman Panel — 10 Onaylı Başvuru", "Farklı disiplinlerden 10 uzman başvurusunu değerlendir ve onayla.", 20, "planned", "expert_count"],
  ["2026-Q4", "Academy Beta Portalı", "Akademisyenler için vaka kütüphanesi ve erişim platformu.", 0, "planned", "academy_beta"],
  ["2026-Q4", "Enterprise Pilot ×3", "3 corporate pilots (bank/telecom/insurer) on B2B risk-score API", 0, "planned", "enterprise_pilots"],
  ["2026-Q4", "K-BENCHMARK Public Credibility", "Methodology Committee ≥3 named members; FAccT paper submitted", 25, "planned", "expert_count"],
  ["2026-Q4", "Regulator Bridge", "KVKK + TR AISI working contact; OECD AIM feed cited", 30, "planned", "regulator_contacts"],
  ["2026-Q4", "Revenue Ignition", "Stripe live; first paying Pro subscribers; MRR > 0", 0, "planned", "mrr_cents"],
  ["2027-Q1", "EU Art. 73 Readiness Product", "Compliance-report generator for Dec 2, 2027 deadline; 10 beta customers", 0, "planned", "art73_beta"],
  ["2027-Q1", "Global Sertifikasyon Programı", "ALPAR AI Certified AI Auditor programı başlatılsın.", 0, "planned", "certification"],
  ["2027-Q2", "Certified AI Auditor Program", "Academy certification cohort #1 (≥25 auditors)", 0, "planned", "certification"],
  ["2027-Q3", "EU Market Entry", "EN/DE landing; 2 EU enterprise customers; EU entity decision", 0, "planned", "eu_customers"],
  ["2027-Q4", "Series-A Readiness", "≥$20K MRR, ≥5K incidents, ≥2 regulator citations → raise", 0, "planned", "series_a_gate"]
];

const valuesSql = rawRows.map(r => {
  const q = r[0].replace(/'/g, "''");
  const t = r[1].replace(/'/g, "''");
  const o = r[2].replace(/'/g, "''");
  const p = r[3];
  const st = r[4];
  const l = r[5];
  return `        ('${q}', '${t}', '${o}', ${p}, '${st}', '${l}')`;
}).join(",\n");

const newBlock = `-- Table: public.strategy_milestones (26 statements, guarded)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategy_milestones') THEN
    IF NOT EXISTS (SELECT 1 FROM public.strategy_milestones LIMIT 1) THEN
      INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric) VALUES
${valuesSql}
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
`;

s = s.substring(0, startIdx) + newBlock + s.substring(endIdx);
fs.writeFileSync(filePath, s, 'utf8');
console.log("Successfully replaced strategy_milestones block!");
