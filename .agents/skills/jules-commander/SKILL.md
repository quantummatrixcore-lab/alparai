---
name: jules-commander
description: "Tarayıcı (openchrome) üzerinden JULES (Google AI Agent) paneline bağlanıp görev atama ve yönetme becerisi."
---

# JULES-KOMUTANI (Google AI Agent Orchestrator)

Bu yetenek, Antigravity/Agent-OS ajanlarının `jules.google.com` üzerinden devasa kod tabanı (multi-repo) refaktörleri, mimari denetimler ve geniş kapsamlı PR'lar için Jules ajanını otonom olarak kullanmasını sağlar. JULES, günlük 300 oturum hakkına sahip, GitHub repolarıyla doğrudan entegre "Ağır Siklet" bir ajandır.

## Ön Koşullar (Pre-flight Checks)

1. Chrome tarayıcısında `quantum.matrix.core@gmail.com` oturumu açık olmalı.
2. `http://localhost:9222/json` aktif olmalı (Değilse kural 6'daki `Start-Process` ile başlat).

## Görev Verme Prosedürü (Execution Flow)

Jules'a bir görev atayacağın zaman şu adımları izle:

1. **Keşif:** `tabs_context` aracı ile `jules.google.com` sekmesinin açık olup olmadığını kontrol et. Açık değilse, aktif tabId'yi kullanarak `navigate` ile `https://jules.google.com` adresine git.
2. **Görev Başlatma:** Sayfa yüklendiğinde `read_page` ile DOM'u oku. `.new-task-button` (New Task) butonuna tıklamak için `interact` aracını kullan.
3. **Repo Seçimi:** Hedef depoyu (Örn: `quantummatrixcore-lab/Agent-Os`) seç.
4. **Prompt Enjeksiyonu:** Görev talimatını (Prompt) sayfadaki `.cdk-textarea-autosize` form elemanına `interact` veya `javascript_tool` kullanarak yaz.
5. **Ateşleme:** Submit (Gönder) butonuna bas (`.submit-button`).
6. **Bekleme ve Onay:** Jules plan hazırladığında ekranda "Approve Plan" butonu çıkacaktır. Bunu bekleyip onayla.
7. **Raporlama:** Görev `Plan approved` veya `Completed` statüsüne geldiğinde Kurmay Karargahına rapor ver.

## Kullanım Alanları (Ne Zaman Jules Kullanılır?)

- **Lokal sınırları aşan işler:** 40.000+ token gerektiren çoklu dosya (multi-file) değişimleri.
- **GitHub PR Yönetimi:** Kodu klonlamadan doğrudan repo üzerinden dal (branch) açıp PR gönderilmesi gereken işler.
- **Mimari Audit:** Tüm projeyi kapsayan RLS, güvenlik, PII sızıntı veya i18n taramaları.

> 🚨 **STRICT BROWSER RULE:** Bu işlemleri yaparken ASLA yeni sekme açma! Mevcut açık sekmeyi (`tabId`) kullan. Yeni sekme açmak BotGuard korumalarını tetikler.
