# 📬 ALPAR AI — PURELYMAIL + RESEND + CLOUDFLARE ALTIN MİMARİ REHBERİ
> **Alan Adı:** `alparai.com`  
> **Gelen / Posta Kutusu (Inbound):** Purelymail ($10/Yıl — Sınırsız Domain & Mailbox)  
> **Giden / Sistem (Outbound):** Resend (0 TL — 3.000 mail/ay, React Email, DKIM/SPF)  
> **DNS & Güvenlik:** Cloudflare DNS (DDoS Kalkanı, WAF, DNSSEC)

---

## 🏛️ 1. Mimari Şema

```
                           ┌───────────────────────────────────────────────┐
                           │         CLOUDFLARE DNS (alparai.com)          │
                           └───────────────────────┬───────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        [ GELEN POSTALAR & YAZIŞMALAR ]                                 [ SİTEDEN GİDEN MAİLLER ]
             📬 PURELYMAIL                                                    🚀 RESEND
    ──────────────────────────────────────                          ──────────────────────────────────────
    • ercument.erden@alparai.com                                    • Kullanıcı Şifre Sıfırlama
    • admin@alparai.com                                             • E-posta Doğrulama Linkleri
    • Webmail (Roundcube) & Telefon (IMAP)                          • Güvenlik & Denetim Alarmları
    • AI Mail Ajanı (scripts/mail-agent.js)                         • unified-mailer.ts & Resend API
    • Tüm Projeleriniz (ercuos.com vs.)                             • Yüksek Teslimat Oranı (0 Spam)
```

---

## 📋 2. Cloudflare DNS Ayar Tablosu (Tek ve Eksiksiz Liste)

Cloudflare Dashboard -> `alparai.com` -> **DNS** sekmesine giriniz. Eski Zoho MX ve SPF kayıtlarını silip aşağıdaki kayıtları tanımlayınız:

| Tür (Type) | İsim (Host) | Değer (Value / Content) | TTL | Öncelik (Priority) | Proxy Durumu | Açıklama |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `mail.purelymail.com` | Auto | **10** | DNS Only | **Purelymail:** Gelen mailleri teslim alır |
| **TXT** | `@` | `v=spf1 include:_spf.purelymail.com include:resend.com ~all` | Auto | - | DNS Only | **Birleşik SPF:** Hem Purelymail hem Resend meşru göndericidir |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@alparai.com; sp=quarantine; fo=1` | Auto | - | DNS Only | **DMARC:** Sahte ve phishing gönderimleri engeller |
| **TXT** | `purelymail._domainkey` | *(Purelymail panelinizden verilen genel anahtar)* | Auto | - | DNS Only | **Purelymail DKIM:** El ve webmail yazışmaları için dijital imza |
| **TXT** | `resend._domainkey` | *(Resend panelinizden verilen genel anahtar)* | Auto | - | DNS Only | **Resend DKIM:** Siteden giden sistem mailleri için dijital imza |
| **MX** | `bounces` | `feedback-smtp.resend.com` | Auto | **10** | DNS Only | **Resend Bounces:** İletilemeyen maillerin tespiti (Resend isterse) |
| **TXT** | `@` | *(Purelymail panelinden verilen Sahiplik Kodu)* | Auto | - | DNS Only | **Purelymail Verification:** Domain sahiplik onayı |

---

## ⚙️ 3. Ortam Değişkenleri (.env.local / Sunucu)

Projenizin `.env` veya `.env.local` dosyasına şu değişkenleri ekleyiniz:

```bash
# 1. RESEND (Siteden Giden Otomatik Mailler - https://resend.com/api-keys)
RESEND_API_KEY="re_123456789_abcdefg"

# 2. PURELYMAIL (AI Mail Ajanı ve Yedek SMTP - https://purelymail.com/manage/users)
MAIL_USER="ercument.erden@alparai.com"
MAIL_PASSWORD="PURELYMAIL_HESAP_VEYA_APP_SIFRENIZ"
MAIL_IMAP_HOST="mail.purelymail.com"
MAIL_IMAP_PORT="993"
MAIL_SMTP_HOST="mail.purelymail.com"
MAIL_SMTP_PORT="465"
```

---

## 🤖 4. Yapay Zeka Ajanının Çalıştırılması

Gelen kurumsal e-postaları yapay zekanın 7/24 okuyup özetlemesi için hazır ajanımız:

```bash
# E-postaları kontrol et ve özetle
node scripts/mail-agent.js
```
