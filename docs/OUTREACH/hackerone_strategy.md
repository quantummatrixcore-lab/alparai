# ALPAR AI: HackerOne Bug Bounty & Transparency Strategy

## 1. Hedef ve Stratejik Vizyon

ALPAR AI bir "güven altyapısı"dır. Güven vadeden bir sistemin en önemli gereksinimi, bağımsız güvenlik uzmanları tarafından test edilebilir olmasıdır. HackerOne üzerinde açılacak bir Bug Bounty (Ödül Avcılığı) programı, sistemin kriptografik şifreleme ve PII maskeleme mimarilerini "savaş testi"ne (battle-tested) tabi tutacak ve "Güven Rozetimizi" meşrulaştıracaktır.

## 2. Program Kapsamı (In-Scope)

Aşağıdaki kritik bileşenler beyaz şapkalı hackerların testlerine açık olacaktır:

1. **PII Guardian (`src/lib/pii/guardian.ts`)**
   - _Hedef:_ Veritabanına (Supabase) yazılmadan önce Kişisel Tanımlanabilir Bilgilerin (PII) atlatılması (bypass) veya maskelemenin aşılması.
   - _Ödül Derecesi:_ Yüksek (High)

2. **API Key Encryption Vault (`src/lib/security/vault.ts`)**
   - _Hedef:_ AES-256-GCM ile şifrelenen provider API anahtarlarının düz metin (plaintext) olarak açığa çıkarılması.
   - _Ödül Derecesi:_ Kritik (Critical)

3. **RLS (Row Level Security) Bypass**
   - _Hedef:_ Yalnızca yetkili (admin veya verified respondent) kullanıcıların erişebileceği `incidents`, `vendor_trust_rankings` gibi tabloların dışarıdan veya yetkisiz içeriden manipüle edilmesi.
   - _Ödül Derecesi:_ Yüksek (High)

## 3. Kapsam Dışı (Out-of-Scope)

- DDoS saldırıları (Cloudflare / Vercel katmanında).
- Sosyal mühendislik (Phishing).
- Üçüncü taraf bağımlılıkların (ör. React, Tailwind) genel zafiyetleri (ALPAR AI mimarisine özgü olmayanlar).

## 4. Uygulama Adımları

1. **HackerOne Open Source Program:** Açık kaynaklı projeler için ücretsiz/indirimli sunulan HackerOne Open Source programına başvuru.
2. **Safe Harbor Policy:** İyi niyetli araştırmacıların hukuki olarak korunacağına dair standart "Safe Harbor" metninin hazırlanması.
3. **Ödül Havuzu:** Başlangıçta finansal ödül yerine "Hall of Fame", ALPAR AI Güven Rozeti veya sınırlı teşvikler (ör. swag, sponsor kredileri) sunulması. (Yatırım / hibe alındıktan sonra finansal ödüle geçiş).
