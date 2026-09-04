# 📬 ALPAR AI — ZOHO MAIL & CLOUDFLARE DNS YAPILANDIRMA REHBERİ
> **Alan Adı:** `alparai.com`  
> **E-Posta Servisi:** Zoho Mail Enterprise (AB Sunucuları - GDPR Uyumlu)  
> **DNS Sağlayıcı:** Cloudflare DNS

---

## 1. Cloudflare DNS Ayar Tablosu (Tam Liste)

Aşağıdaki kayıtları Cloudflare Dashboard'da `alparai.com` DNS Yönetim paneline giriniz:

### A. MX (Mail Exchanger) Kayıtları
| Tür | İsim (Host) | Değer (Mail Server) | TTL | Öncelik (Priority) | Proxy Durumu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `mx.zoho.eu` | Auto | **10** | DNS Only (Gri Bulut) |
| **MX** | `@` | `mx2.zoho.eu` | Auto | **20** | DNS Only (Gri Bulut) |
| **MX** | `@` | `mx3.zoho.eu` | Auto | **50** | DNS Only (Gri Bulut) |

> ⚠️ **ÖNEMLİ:** Cloudflare Email Routing aktif ise, Cloudflare Dashboard -> **Email** sekmesinden Email Routing'i **Disable (Devre Dışı)** bırakınız. Aksi halde Cloudflare kendi MX kayıtlarını zorlar ve Zoho mailleri teslim alamaz.

---

### B. SPF (Sender Policy Framework) Kaydı
Spam filtrelerine takılmamak ve sahte e-posta gönderimini engellemek için TXT kaydı:

| Tür | İsim (Host) | Değer | TTL | Proxy Durumu |
| :--- | :--- | :--- | :--- | :--- |
| **TXT** | `@` | `v=spf1 include:zoho.eu ~all` | Auto | DNS Only |

---

### C. DKIM (DomainKeys Identified Mail) Kaydı
Zoho Mail panelinden (`Admin Console -> Domains -> Email Configuration -> DKIM`) üretilen anahtar:

| Tür | İsim (Host) | Değer | TTL | Proxy Durumu |
| :--- | :--- | :--- | :--- | :--- |
| **TXT** | `zoho._domainkey` | `v=DKIM1; k=rsa; p=ZOHO_PANELINDEN_ALINAN_PUBLIC_KEY` | Auto | DNS Only |

---

### D. DMARC (Domain-based Message Authentication) Kaydı
Alan adınız üzerinden kimlik avını (phishing) engelleyen güvenlik politikası:

| Tür | İsim (Host) | Değer | TTL | Proxy Durumu |
| :--- | :--- | :--- | :--- | :--- |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@alparai.com; ruf=mailto:admin@alparai.com; sp=quarantine; fo=1` | Auto | DNS Only |

---

## 2. Otomatik Cloudflare API Yükleme Betiği (PowerShell)

Cloudflare API Token'ınız varsa, aşağıdaki PowerShell komutu ile DNS kayıtlarını tek hamlede girebilirsiniz:

```powershell
$CF_API_TOKEN = "CLOUDFLARE_API_TOKEN_BURAYA"
$ZONE_ID = "ALPARAI_ZONE_ID_BURAYA"

$headers = @{
    "Authorization" = "Bearer $CF_API_TOKEN"
    "Content-Type"  = "application/json"
}

# 1. MX 10
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body (@{
    type = "MX"; name = "@"; content = "mx.zoho.eu"; priority = 10; ttl = 1
} | ConvertTo-Json)

# 2. MX 20
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body (@{
    type = "MX"; name = "@"; content = "mx2.zoho.eu"; priority = 20; ttl = 1
} | ConvertTo-Json)

# 3. MX 50
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body (@{
    type = "MX"; name = "@"; content = "mx3.zoho.eu"; priority = 50; ttl = 1
} | ConvertTo-Json)

# 4. SPF
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body (@{
    type = "TXT"; name = "@"; content = "v=spf1 include:zoho.eu ~all"; ttl = 1
} | ConvertTo-Json)

# 5. DMARC
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body (@{
    type = "TXT"; name = "_dmarc"; content = "v=DMARC1; p=quarantine; rua=mailto:admin@alparai.com"; ttl = 1
} | ConvertTo-Json)

Write-Host "✅ Zoho Mail DNS kayıtları başarıyla Cloudflare'e yüklendi!" -ForegroundColor Green
```
