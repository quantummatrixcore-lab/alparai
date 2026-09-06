# P1 - CSP Tightening Plan

## 1. Mevcut CSP Analizi
- **Sorun:** Next.js ortamında React'ın (ve third-party scriptlerin) ihtiyaç duyduğu `unsafe-inline` ve `unsafe-eval` kullanımları, XSS risk vektörlerini açık bırakmaktadır. P0 denetimi sırasında bu eksiklik tespit edilmiştir.
- **Hedef:** Strict CSP'ye (Nonce tabanlı) geçiş yapmak ve `unsafe-inline` kullanımını kaldırmak.

## 2. Aksiyon Planı (Nonce/Hash Model)

### Faz 1: Middleware Üzerinden Nonce Üretimi
`src/middleware.ts` güncellenerek her istekte kriptografik olarak güvenli bir nonce (örn. `crypto.randomUUID()`) üretilecek ve `Content-Security-Policy` header'ına eklenecektir.

\`\`\`typescript
const nonce = crypto.randomUUID();
const cspHeader = \`
  default-src 'self';
  script-src 'self' 'nonce-\${nonce}' 'strict-dynamic';
  style-src 'self' 'nonce-\${nonce}';
  ...
\`;
\`\`\`

### Faz 2: Next.js Entegrasyonu
Next.js'in `<Head>` ve script enjeksiyonlarının bu nonce değerini kullanması için `next.config.mjs` ve root layout (veya `_document.tsx` / `_app.tsx` karşılığı App Router bileşenleri) üzerinden `nonce` prop'u geçirilecektir.

### Faz 3: Third-Party Script İzolasyonu
Analytics (PostHog), CAPTCHA (Turnstile) ve Ödeme (Stripe) scriptleri analiz edilecek, hash'leri hesaplanarak veya dinamik nonce'lar kullanılarak allowlist'e alınacaktır.

## 3. Tarihli Teslimat Planı (Roadmap)
- **Hafta 1:** Nonce jeneratörünün middleware'e entegrasyonu (Test ortamında).
- **Hafta 2:** App Router `nonce` aktarımının sağlanması ve console hatalarının (XSS/CSP Violation Report) izlenmesi.
- **Hafta 3:** `unsafe-inline` tamamen kaldırılarak Production ortamına deploy edilmesi.
