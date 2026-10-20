-- 0010 — Mini-Okul (Etik Kullanıcı Sertifikası + %15 kupon).
--
-- Ders tanımları kodda yaşar (src/lib/academy/lessons.ts); burada SADECE
-- kullanıcı ilerlemesi ve kuponlar tutulur. Sertifika "katılım belgesidir",
-- akredite diploma DEĞİLDİR (tabloda da böyle yazar).
--
-- Akış: ders bitir (quiz %70+) → completion kaydı + benzersiz belge kodu →
-- e-posta başına TEK kupon (%15, tek kullanımlık, 30 gün geçerli).

CREATE TABLE IF NOT EXISTS public.academy_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  lesson_slug text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  passed boolean NOT NULL DEFAULT false,
  cert_code text UNIQUE,
  certificate_kind text NOT NULL DEFAULT 'etik-kullanici-katilim-belgesi',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_academy_email_lesson UNIQUE (email, lesson_slug)
);

CREATE TABLE IF NOT EXISTS public.academy_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL UNIQUE,
  percent integer NOT NULL DEFAULT 15 CHECK (percent > 0 AND percent <= 50),
  used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_academy_coupon_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_academy_completions_email
  ON public.academy_completions (email);
CREATE INDEX IF NOT EXISTS idx_academy_completions_cert
  ON public.academy_completions (cert_code);
CREATE INDEX IF NOT EXISTS idx_academy_coupons_code
  ON public.academy_coupons (code);
