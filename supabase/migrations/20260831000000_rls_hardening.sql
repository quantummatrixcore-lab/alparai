-- ============================================================================
-- Migration: 20260831000000_rls_hardening.sql
-- Security Hardening & RLS Sentinel Remediation Pass (P0 Critical Vulnerabilities)
--
-- 1. Mutasyon Zafiyeti Onarımı (Madde 4):
--    - `social_accounts`, `marketing_drafts`, `newsletter_subscribers` tablolarındaki
--      tüm eski ve gevşek INSERT/UPDATE/DELETE/ALL politikaları kaldırıldı.
--    - Yetkisiz anonim/public müdahaleleri önlemek için sadece yöneticilere ('admin', 'ceo', 'moderator')
--      ve backend yetkili servislerine (`service_role`) izin veren sıkı RLS politikaları tanımlandı.
--
-- 2. Korumasız Hassas Tabloların Kilitlenmesi (Madde 5):
--    - `cross_audit_runs`, `audit_log`, `cease_and_desist_logs` tablolarında anonim kullanıcılara
--      açık olan kısıtlamasız SELECT (USING true) politikaları DROP edildi.
--    - Yalnızca `service_role` veya yönetici ('admin' / 'moderator') rolleri için erişim sağlandı.
--
-- 3. RLS'in Tamamen Kapalı Olduğu Tabloların Güvenliğe Alınması (Madde 6):
--    - `embeddings`, `profiles`, `documents` tabloları için `ENABLE ROW LEVEL SECURITY` komutu çalıştırıldı.
--    - Yetkisiz erişimleri varsayılan olarak engelleyen ve sadece yetkili aktörlere izin veren kurallar eklendi.
-- ============================================================================

-- ============================================================================
-- BÖLÜM 1: MUTASYON ZAFİYETİ ONARIMI (MADDE 4)
-- ============================================================================

-- 1.1. social_accounts
ALTER TABLE IF EXISTS public.social_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Service role full access social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "public_insert_social_accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "public_update_social_accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "public_delete_social_accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "social_accounts_all" ON public.social_accounts;
DROP POLICY IF EXISTS "Admin and service role full access on social_accounts" ON public.social_accounts;

CREATE POLICY "Admin and service role full access on social_accounts"
  ON public.social_accounts
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));

-- 1.2. marketing_drafts
ALTER TABLE IF EXISTS public.marketing_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage marketing drafts" ON public.marketing_drafts;
DROP POLICY IF EXISTS "Service role full access marketing drafts" ON public.marketing_drafts;
DROP POLICY IF EXISTS "public_insert_marketing_drafts" ON public.marketing_drafts;
DROP POLICY IF EXISTS "public_update_marketing_drafts" ON public.marketing_drafts;
DROP POLICY IF EXISTS "public_delete_marketing_drafts" ON public.marketing_drafts;
DROP POLICY IF EXISTS "marketing_drafts_all" ON public.marketing_drafts;
DROP POLICY IF EXISTS "Admin and service role full access on marketing_drafts" ON public.marketing_drafts;

CREATE POLICY "Admin and service role full access on marketing_drafts"
  ON public.marketing_drafts
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));

-- 1.3. newsletter_subscribers
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_update_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "self_update_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "public_insert_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "admin_select_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow all access to newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin and service role full access on newsletter_subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admin and service role full access on newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));


-- ============================================================================
-- BÖLÜM 2: KORUMASIZ HASSAS TABLOLARIN KİLİTLENMESİ (MADDE 5)
-- ============================================================================

-- 2.1. cross_audit_runs
ALTER TABLE IF EXISTS public.cross_audit_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to cross_audit_runs" ON public.cross_audit_runs;
DROP POLICY IF EXISTS "Allow mod all access to cross_audit_runs" ON public.cross_audit_runs;
DROP POLICY IF EXISTS "Public read cross_audit_runs" ON public.cross_audit_runs;
DROP POLICY IF EXISTS "Enable read access for all users on cross_audit_runs" ON public.cross_audit_runs;
DROP POLICY IF EXISTS "Admin and service role full access on cross_audit_runs" ON public.cross_audit_runs;

CREATE POLICY "Admin and service role full access on cross_audit_runs"
  ON public.cross_audit_runs
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

-- 2.2. audit_log
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users on audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "Public read access on audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admin and service role can select audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "Admin and service role full access on audit_log" ON public.audit_log;

CREATE POLICY "Admin and service role can select audit_log"
  ON public.audit_log
  FOR SELECT
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()));

-- 2.3. cease_and_desist_logs
ALTER TABLE IF EXISTS public.cease_and_desist_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cease_and_desist_logs" ON public.cease_and_desist_logs;
DROP POLICY IF EXISTS "Admin write cease_and_desist_logs" ON public.cease_and_desist_logs;
DROP POLICY IF EXISTS "Admin and service role full access on cease_and_desist_logs" ON public.cease_and_desist_logs;

CREATE POLICY "Admin and service role full access on cease_and_desist_logs"
  ON public.cease_and_desist_logs
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));


-- ============================================================================
-- BÖLÜM 3: RLS'İN TAMAMEN KAPALI OLDUĞU TABLOLARIN GÜVENLİĞE ALINMASI (MADDE 6)
-- ============================================================================

-- 3.1. embeddings
ALTER TABLE IF EXISTS public.embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin and service role full access on embeddings" ON public.embeddings;
CREATE POLICY "Admin and service role full access on embeddings"
  ON public.embeddings
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));

-- 3.2. profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin and service role full access on profiles" ON public.profiles;
CREATE POLICY "Admin and service role full access on profiles"
  ON public.profiles
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));

-- 3.3. documents
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin and service role full access on documents" ON public.documents;
CREATE POLICY "Admin and service role full access on documents"
  ON public.documents
  FOR ALL
  TO authenticated, service_role
  USING (auth.role() = 'service_role' OR public.is_admin(auth.uid()))
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin(auth.uid()));


-- ============================================================================
-- ROLLBACK:
-- ============================================================================
-- -- 1. Rollback social_accounts, marketing_drafts, newsletter_subscribers
-- DROP POLICY IF EXISTS "Admin and service role full access on social_accounts" ON public.social_accounts;
-- CREATE POLICY "Admins can manage social accounts" ON public.social_accounts FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'ceo')));
--
-- DROP POLICY IF EXISTS "Admin and service role full access on marketing_drafts" ON public.marketing_drafts;
-- CREATE POLICY "Admins can manage marketing drafts" ON public.marketing_drafts FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'ceo')));
--
-- DROP POLICY IF EXISTS "Admin and service role full access on newsletter_subscribers" ON public.newsletter_subscribers;
-- CREATE POLICY "admin_select_subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_moderator(auth.uid()));
-- CREATE POLICY "public_insert_subscribers" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Admins can update newsletter subscribers" ON public.newsletter_subscribers FOR UPDATE USING (public.is_moderator(auth.uid()));
--
-- -- 2. Rollback cross_audit_runs, audit_log, cease_and_desist_logs
-- DROP POLICY IF EXISTS "Admin and service role full access on cross_audit_runs" ON public.cross_audit_runs;
-- CREATE POLICY "Allow public read access to cross_audit_runs" ON public.cross_audit_runs FOR SELECT USING (true);
-- CREATE POLICY "Allow mod all access to cross_audit_runs" ON public.cross_audit_runs FOR ALL USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
--
-- DROP POLICY IF EXISTS "Admin and service role can select audit_log" ON public.audit_log;
-- CREATE POLICY "Enable read access for all users on audit_log" ON public.audit_log FOR SELECT USING (true);
-- CREATE POLICY "Admins can view audit log" ON public.audit_log FOR SELECT USING (public.is_admin(auth.uid()));
--
-- DROP POLICY IF EXISTS "Admin and service role full access on cease_and_desist_logs" ON public.cease_and_desist_logs;
-- CREATE POLICY "Public read cease_and_desist_logs" ON public.cease_and_desist_logs FOR SELECT USING (true);
-- CREATE POLICY "Admin write cease_and_desist_logs" ON public.cease_and_desist_logs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
--
-- -- 3. Rollback embeddings, profiles, documents
-- DROP POLICY IF EXISTS "Admin and service role full access on embeddings" ON public.embeddings;
-- DROP POLICY IF EXISTS "Admin and service role full access on profiles" ON public.profiles;
-- DROP POLICY IF EXISTS "Admin and service role full access on documents" ON public.documents;
-- ALTER TABLE IF EXISTS public.embeddings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;
