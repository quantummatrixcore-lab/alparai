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

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.academy_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_coupons ENABLE ROW LEVEL SECURITY;

-- academy_completions policies
DROP POLICY IF EXISTS "Public can verify passed certificates" ON public.academy_completions;
CREATE POLICY "Public can verify passed certificates"
  ON public.academy_completions
  FOR SELECT
  USING (cert_code IS NOT NULL AND passed = true);

DROP POLICY IF EXISTS "Users can view own academy completions" ON public.academy_completions;
CREATE POLICY "Users can view own academy completions"
  ON public.academy_completions
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', auth.email())))
    OR (auth.role() = 'service_role')
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own academy completions" ON public.academy_completions;
CREATE POLICY "Users can insert own academy completions"
  ON public.academy_completions
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', auth.email())))
    OR (auth.role() = 'service_role')
    OR public.is_admin(auth.uid())
    OR (auth.role() = 'anon')
  );

DROP POLICY IF EXISTS "Admins and service role can update academy completions" ON public.academy_completions;
CREATE POLICY "Admins and service role can update academy completions"
  ON public.academy_completions
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins and service role can delete academy completions" ON public.academy_completions;
CREATE POLICY "Admins and service role can delete academy completions"
  ON public.academy_completions
  FOR DELETE
  USING (
    auth.role() = 'service_role'
    OR public.is_admin(auth.uid())
  );

-- academy_coupons policies
DROP POLICY IF EXISTS "Coupons can be verified by anyone" ON public.academy_coupons;
CREATE POLICY "Coupons can be verified by anyone"
  ON public.academy_coupons
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert coupons upon lesson completion" ON public.academy_coupons;
CREATE POLICY "Users can insert coupons upon lesson completion"
  ON public.academy_coupons
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', auth.email())))
    OR (auth.role() = 'service_role')
    OR public.is_admin(auth.uid())
    OR (auth.role() = 'anon')
  );

DROP POLICY IF EXISTS "Service role and admins can manage coupons" ON public.academy_coupons;
CREATE POLICY "Service role and admins can manage coupons"
  ON public.academy_coupons
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- ROLLBACK:
-- ------------------------------------------------------------------------------
-- DROP POLICY IF EXISTS "Public can verify passed certificates" ON public.academy_completions;
-- DROP POLICY IF EXISTS "Users can view own academy completions" ON public.academy_completions;
-- DROP POLICY IF EXISTS "Users can insert own academy completions" ON public.academy_completions;
-- DROP POLICY IF EXISTS "Admins and service role can update academy completions" ON public.academy_completions;
-- DROP POLICY IF EXISTS "Admins and service role can delete academy completions" ON public.academy_completions;
-- DROP POLICY IF EXISTS "Coupons can be verified by anyone" ON public.academy_coupons;
-- DROP POLICY IF EXISTS "Users can insert coupons upon lesson completion" ON public.academy_coupons;
-- DROP POLICY IF EXISTS "Service role and admins can manage coupons" ON public.academy_coupons;
-- ALTER TABLE public.academy_completions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.academy_coupons DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS public.idx_academy_coupons_code;
-- DROP INDEX IF EXISTS public.idx_academy_completions_cert;
-- DROP INDEX IF EXISTS public.idx_academy_completions_email;
-- DROP TABLE IF EXISTS public.academy_coupons;
-- DROP TABLE IF EXISTS public.academy_completions;
