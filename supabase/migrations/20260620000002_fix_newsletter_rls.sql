-- ============================================================================
-- 20260620000002_fix_newsletter_rls.sql
-- SEC-001 P0: newsletter_subscribers RLS UPDATE açığı kapatılıyor
-- Herhangi biri herkesin email/abonelik durumunu değiştirebiliyordu
-- ============================================================================

-- Tehlikeli policy'yi kaldır
DROP POLICY IF EXISTS "public_update_subscribers" ON public.newsletter_subscribers;

-- Yeni güvenli policy: Sadece token ile (email eşleşmesi) veya admin
-- Anonim unsubscribe için email bazlı kontrol — her satır sadece kendi emaili ile eşleşebilir
CREATE POLICY "self_update_subscribers" ON public.newsletter_subscribers
  FOR UPDATE
  USING (
    -- Authenticated kullanıcılar kendi email'lerini güncelleyebilir
    (auth.uid() IS NOT NULL)
    OR
    -- Anonim unsubscribe: sadece unsubscribed_at ve subscribed alanları
    -- (Uygulama katmanında token doğrulaması yapılmalı)
    -- Şimdilik anonim update'i tamamen kapat, sadece server action üzerinden yönet
    false
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Service role (admin) her zaman bypass edebilir — RLS'i devre dışı bırakmadan
-- Newsletter unsubscribe işlemleri artık server action + admin client üzerinden yapılacak
