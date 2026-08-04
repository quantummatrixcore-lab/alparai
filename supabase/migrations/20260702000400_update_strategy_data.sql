-- Migration: Update Strategy Data to reflect current state as of 2026-07-02
-- Timestamp: 20260702000400
-- Actions:
--   1. Refresh metrics snapshot with real Supabase counts
--   2. Close expired risks (R001, R006, R007) and extend R002
--   3. Add new risks (R011, R012, R013)
--   4. Archive outdated SWOT items (W2, W8) + add new (S8, S9, O9)
--   5. Seed valuation table with Berkus + Scorecard calculations

DO $$
DECLARE
  v_ceo_id uuid;
  v_real_users integer;
  v_real_incidents integer;
  v_real_providers integer;
BEGIN
  SELECT id INTO v_ceo_id FROM public.users WHERE role = 'ceo' LIMIT 1;

  -- Get real counts from live tables
  SELECT COUNT(*)::integer INTO v_real_users FROM public.users;
  SELECT COUNT(*)::integer INTO v_real_incidents FROM public.incidents WHERE status = 'published';
  SELECT COUNT(*)::integer INTO v_real_providers FROM public.ai_providers;

  -- =========================================================
  -- 1. METRICS SNAPSHOT — replace with real data
  -- =========================================================
  DELETE FROM public.strategy_metrics_snapshots;

  INSERT INTO public.strategy_metrics_snapshots
    (snapshot_date, total_users, total_incidents, active_providers,
     media_mentions_count, mrr_cents, runway_months, health_score)
  VALUES (
    CURRENT_DATE,
    v_real_users,
    v_real_incidents,
    v_real_providers,
    0,      -- media mentions: not tracked yet
    0,      -- MRR: pre-revenue
    NULL,   -- runway: bootstrapped, unknown
    78      -- health_score: 78/100 (strong tech/market, but 0 revenue + cold start risk)
  );

  -- =========================================================
  -- 2. RISK STATUS UPDATES
  -- =========================================================

  -- R001: .env.local credentials leak — token rotation performed → mitigated
  UPDATE public.strategy_risks
  SET
    status      = 'mitigated',
    description = 'Token rotation completed (June 2026). git rm --cached .env.local applied. IP_SALT refreshed. Risk neutralized.',
    updated_at  = now()
  WHERE code = 'R001';

  -- R002: Cold start — platform is live, users exist; extend target to end of July
  UPDATE public.strategy_risks
  SET
    status      = 'active',
    target_date = '2026-07-31',
    description = 'Platform launched 25 June 2026. Initial users onboarded. HN + Reddit launch pending. Extended to July 31 for full traction validation.',
    updated_at  = now()
  WHERE code = 'R002';

  -- R006: i18n gaps — next-intl fully implemented, legal pages translated → mitigated
  UPDATE public.strategy_risks
  SET
    status      = 'mitigated',
    description = 'EN+TR bilingual system complete via next-intl. Legal pages (KVKK, Terms, Cookie) fully translated. Risk closed.',
    updated_at  = now()
  WHERE code = 'R006';

  -- R007: Spam/Trolling — rate limiting, IP throttle, moderation queue active → mitigated
  UPDATE public.strategy_risks
  SET
    status      = 'mitigated',
    description = 'Rate limiting (100 req/min/IP), moderation queue, and AI-assisted triage are all active. CAPTCHA can be added if trolling escalates.',
    updated_at  = now()
  WHERE code = 'R007';

  -- =========================================================
  -- 3. NEW RISKS
  -- =========================================================
  INSERT INTO public.strategy_risks
    (code, title, description, probability, impact, owner_user_id, mitigation_plan, target_date, status)
  VALUES
    ('R011',
     'HN/Reddit lansmanı başarısızlığı',
     'Show HN gönderisinin downvote yemesi, Reddit''te "spam" olarak kaldırılması veya traction yaratmaması.',
     3, 4, v_ceo_id,
     'HN kurallarına uygun içerik hazırla. Timing: Salı-Perşembe 16:00 TR. İlk yorumları önceden planla. Her subreddit için özelleştirilmiş post yaz.',
     '2026-07-15', 'active'),

    ('R012',
     'API token / credential süresi dolumu',
     'Vercel, Supabase veya diğer servis token''larının sessizce süresi dolması — deployment kesilir.',
     3, 5, v_ceo_id,
     'Token expiry tarihlerini calendar''a ekle. Supabase ve Vercel dashboard''larında aktif token listesini kontrol et. Rotation SOP belgesi yaz.',
     '2026-07-15', 'active'),

    ('R013',
     'Sosyal medya hesap açılmama riski',
     'Twitter/X, LinkedIn, YouTube ve diğer platformlarda hesap açılmaması — lansmanın etki alanını daraltan kritik eksiklik.',
     4, 4, v_ceo_id,
     'Tüm hesapları bu hafta aç. Bio, logo ve link''leri eksiksiz doldur. İçerik takvimi oluştur.',
     '2026-07-09', 'active')
  ON CONFLICT (code) DO NOTHING;

  -- =========================================================
  -- 4. SWOT UPDATES
  -- =========================================================

  -- Archive W2: Design has been fully updated (dark mode + emerald + glassmorphism)
  UPDATE public.strategy_swot_items
  SET
    status      = 'done',
    description = 'Dark mode + emerald renk paleti + glassmorphism ile profesyonel editorial tasarım tamamlandı. Admin panel, Leaderboard ve Press Kit yeniden tasarlandı. (2 Temmuz 2026)',
    updated_at  = now()
  WHERE title LIKE 'W2%' AND category = 'weakness';

  -- Archive W8: i18n gaps resolved
  UPDATE public.strategy_swot_items
  SET
    status      = 'done',
    description = 'next-intl ile tam EN+TR çeviri sistemi uygulandı. Legal sayfalar (KVKK, Cookie, Terms) dahil tüm UI i18n kapsamında. (2 Temmuz 2026)',
    updated_at  = now()
  WHERE title LIKE 'W8%' AND category = 'weakness';

  -- Update W3: Token rotation done
  UPDATE public.strategy_swot_items
  SET
    description = 'Token rotation gerçekleştirildi (Haziran 2026). git rm --cached .env.local uygulandı. Risk önemli ölçüde azaltıldı. Kalıcı çözüm için secret manager değerlendirilmeli.',
    updated_at  = now()
  WHERE title LIKE 'W3%' AND category = 'weakness';

  -- Add new SWOT strengths
  INSERT INTO public.strategy_swot_items
    (category, title, description, weight, owner_user_id, status)
  VALUES
    ('strength',
     'S8: Public Developer API',
     '/api/v1/leaderboard, /api/v1/incidents, /api/v1/providers, /api/v1/stats — araştırmacı ve gazeteciler için açık, CORS-enabled, rate-limited REST API. Akademik güvenilirlik ve medya erişimi için kritik diferansiasyon.',
     'medium', v_ceo_id, 'active'),

    ('strength',
     'S9: Otomatik Dış Haber Toplama Pipeline',
     'Reddit, HackerNews ve RSS connector''ları ile harici AI ihlali haberlerini otomatik olarak external_incidents_queue''ya çeken Vercel cron pipeline. Sürekli içerik besleme sağlıyor.',
     'medium', v_ceo_id, 'active'),

    ('opportunity',
     'O9: HackerNews / Reddit Viral Potansiyeli',
     'Grok pasaport hikayesi güçlü bir Show HN narrative''i. "I built Trustpilot for AI after Grok asked for my passport" başlığı viral potansiyel taşıyor. r/MachineLearning + r/artificial topluluğu hedef.',
     'high', v_ceo_id, 'active');

  -- =========================================================
  -- 5. VALUATION — Berkus + Scorecard + Average
  -- =========================================================

  -- Clear existing (if any)
  DELETE FROM public.strategy_valuations;

  INSERT INTO public.strategy_valuations
    (method, inputs, result_pre_money, notes, snapshot_date, created_by)
  VALUES
    ('berkus',
     '{
       "sound_idea": 500000,
       "prototype_quality": 500000,
       "quality_management": 250000,
       "strategic_relationships": 250000,
       "product_rollout_or_sales": 0,
       "rationale": {
         "sound_idea": "AI accountability gap is real, novel and EU-timed",
         "prototype": "Production-grade Next.js 15 + Supabase EU, 140 pages deployed",
         "management": "Solo founder penalty — fast execution but key-person risk",
         "strategic": "EU AI Act in force, KVKK market, Grok founding story",
         "rollout": "Pre-revenue, no paying customers yet"
       }
     }'::jsonb,
     1500000.00,
     'Berkus Metodu (pre-revenue startup standardı). Güçlü: teknik altyapı kalitesi + EU AI Act zamanlaması. Zayıf: solo founder, sıfır gelir, cold start aşaması.',
     CURRENT_DATE,
     v_ceo_id),

    ('scorecard',
     '{
       "base_median_valuation": 1500000,
       "weights": {
         "management_team": 0.30,
         "market_size": 0.25,
         "product_technology": 0.15,
         "competitive_environment": 0.10,
         "marketing_sales": 0.10,
         "funding_need": 0.05,
         "other": 0.05
       },
       "scores": {
         "management_team": 0.70,
         "market_size": 1.30,
         "product_technology": 1.20,
         "competitive_environment": 1.40,
         "marketing_sales": 0.60,
         "funding_need": 1.00,
         "other": 1.10
       },
       "rationale": {
         "management_team": "Solo founder -30%: key-person risk, no co-founder yet",
         "market_size": "+30%: EU AI Act demand wave, global addressable market",
         "product_technology": "+20%: production-grade, AGPL open source, PII guardian",
         "competitive_environment": "+40%: genuine blue ocean, no EU-based competitors",
         "marketing_sales": "-40%: zero marketing channels, no social media yet",
         "funding_need": "0%: bootstrapped, no urgency",
         "other": "+10%: RLHF dataset B2B opportunity"
       }
     }'::jsonb,
     1560000.00,
     'Scorecard Metodu (medyan pre-revenue $1.5M baz). Pazar büyüklüğü ve rekabet avantajı değerlemeyi yukarı çekiyor. Pazarlama kanalı eksikliği ve solo founder drag yaratıyor.',
     CURRENT_DATE,
     v_ceo_id),

    ('average',
     '{
       "berkus": 1500000,
       "scorecard": 1560000,
       "methodology_note": "Simple average of Berkus and Scorecard methods"
     }'::jsonb,
     1530000.00,
     'Berkus + Scorecard ortalaması. Pre-seed referans değerleme: ~$1.53M. Kıyaslama: benzer EU AI compliance startup''lar 2024-2025''te $1-3M pre-seed değerlemeyle kapandı. Traction arttıkça (1K kullanıcı + HN lansmanı) $2-3M revize hedefleniyor.',
     CURRENT_DATE,
     v_ceo_id);

END $$;
