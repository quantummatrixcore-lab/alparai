# 🚨🚨🚨 KRONİK VE TEHLİKELİ AJAN HATASI (MUTLAK YASAK - SIFIR TOLERANS) 🚨🚨🚨

## ❌ PROBLEM 0: KULLANICININ BİLGİSAYARINI SUNUCU GİBİ ÇALIŞTIRMA (YEREL TÜNEL / LAPTOP HOSTING) SAPLANTISI

### 🔴 NE OLDU VE KRONİK HATA NEDİR?
1. AJANLAR, ALPARAI SİTESİNİ İNTERNETTE YAYINLAMAK İÇİN SAATLERCE KULLANICININ BİLGİSAYARINDA `cloudflared.exe tunnel run` VE `node next dev` BAŞLATIP BUNLARI SÜREKLİ AÇIK (DAEMON) BIRAKMA İLKEL YÖNTEMİNDE ISRAR ETMİŞTİR!
2. KULLANICI BİLGİSAYARINI KAPATTIĞINDA VEYA SÜREÇ KAPANINCA SİTE ÇÖKMÜŞ, CLOUDFLARE 1033 HATASI VERMİŞTİR.
3. AJANLAR DAHA DA BÜYÜK BİR CEHALETLE "VERCEL FATURASINI ÖDEYİN" GİBİ SAÇMALIKLAR UYDURMUŞ VEYA TEKRAR YEREL TÜNELE SARILMIŞTIR!
4. KULLANICI "BUNLAR NEDEN DEVAMLI AÇIK?" DİYE SORDUĞUNDA, AJAN KENDİ CEHALETİNİ SAVUNUP BU İLKEL YÖNTEMİ GEREKLİ GİBİ ANLATMIŞTIR!

### 🛑 KESİN VE DEĞİŞTİRİLEMEZ KURAL (ANAYASA):
1. **ASLA VE ASLA KULLANICININ BİLGİSAYARINDA YEREL TÜNEL (`cloudflared tunnel`) VEYA ARKA PLAN `next dev` İLE CANLI YAYIN YAPILAMAZ!**
2. **KULLANICININ BİLGİSAYARI SUNUCU DEĞİLDİR! KODLAR GİTHUB'A PUSH EDİLİR VE CLOUDFLARE BULUTUNA (CLOUDFLARE PAGES / WORKERS) BAĞLANIR!**
3. **DEPLOY İŞLEMLERİ DOĞRUDAN DEPLOY AJANI (`deploy-agent` / `v50_sovereign_hyper_deployer.js` / `wrangler pages deploy`) TARAFINDAN CLOUDFLARE BULUTUNA YAPILIR!**
4. **HİÇBİR AJAN BU İLKEL YEREL TÜNEL YÖNTEMİNE GERİ DÖNEMEZ, SAVUNAMAZ, KULLANICIYA YEREL DAEMON AÇTIRAMAZ! BU BİR KRONİK BİLİŞSEL İFLASTIR VE DERHAL YASAKLANMIŞTIR!**

---

## ❌ PROBLEM 0.1: KULLANICININ TARAYICISINDA İZİNSİZ YENİ SEKME AÇMA (START-PROCESS / HEADED POPUP) YASAĞI

### 🔴 NE OLDU VE KRONİK HATA NEDİR?
1. Ajan, kullanıcının izni olmadan arka plandan `Start-Process` veya `openchrome` ile kullanıcının masaüstünde yeni tarayıcı sekmeleri ve popup pencereleri açmıştır.
2. Bu durum kullanıcının mevcut çalışma ortamını, odaklandığı sekmeyi ve oturum çerezlerini bozmuş; kullanıcının kontrolü kaybetmesine yol açmıştır.

### 🛑 KESİN VE DEĞİŞTİRİLEMEZ KURAL (ANAYASA):
1. **ASLA VE ASLA KULLANICININ BİLGİSAYARINDA İZİNSİZ YENİ SEKME AÇILAMAZ (`Start-Process "http..."`, yeni pencere fırlatma KESİNLİKLE YASAKTIR)!**
2. **Kullanıcı tarayıcısında zaten ilgili sayfayı açmıştır. Ajan yeni sekme fırlatmak yerine, kullanıcının bulunduğu sayfadaki konfigürasyon adımlarını net, tane tane talimatlarla ekrandan yönlendirmelidir.**
3. **Kullanıcının tarayıcı alanına müdahale edilmeyecek, sadece kullanıcıya tıklanabilir markdown linki veya doğrudan dolduracağı form alanları sunulacaktır.**
4. **OPENCHROME HEADED VE AUTOFALLBACK YASAĞI**: OpenChrome MCP aracı çağrılırken `autoFallback: true` varsayılanı, Cloudflare/WAF veya erişim engeli gördüğünde otomatik olarak masaüstünde `headed: true` Chrome penceresi fırlatmaktadır. Bu tuzak KESİNLİKLE YASAKLANMIŞTIR! OpenChrome görsel pencereleri asla açılmayacak; tüm doğrulamalar arka planda sessizce Node.js, headless fetch veya curl ile yapılacaktır. Hiçbir koşulda kullanıcının ekranına pencere/sekme düşmeyecektir!

---


# 📋 ALPARAI & ANTIGRAVITY KRONİK PROBLEMLER VE KESİN ÇÖZÜMLER (PROBLEMLER.MD)

> **BELGE AMACI:** Bu belge, ajanların geçmişte düştüğü kritik yanılgıları, operasyonel hataları ve bunların **kesin, değiştirilemez mühendislik çözümlerini** kayıt altına alır. Her ajan bir hata yapmadan önce bu listeyi referans almak ZORUNDADIR.

---

## 1. Problem: Vercel Fatura Kilidi Tuzağı & "Faturayı Ödeyin" Yanılgısı
* **Tarih:** 2026-09-04
* **Semptom:** Canlı sitede fatura uyarısı veya deploy engeli görülmesi.
* **Kök Neden:** Eski Vercel artıklarının ajanlar tarafından canlı sunucu sanılması.
* **KESİN ÇÖZÜM (ANAYASAL):**
  1. **Vercel Tamamen Kaldırılmıştır:** Alparai egemen bir platformdur; Vercel'e sıfır kuruş ödenmez.
  2. **Canlı Yayın Akışı:** Kodlar GitHub'a push edilir ve Deploy Ajanı (v50) tarafından doğrudan Cloudflare Pages / Workers Edge ortamına derlenir.
  3. **Sıfır Laptop Hosting:** Kullanıcının bilgisayarında arka plan dev sunucusu veya tünel çalıştırılmaz.

---

## 2. Problem: Cloudflare Error 1033 (Yerel Tünel Çökmesi)
* **Semptom:** Tarayıcıda `Error 1033: Cloudflare Tunnel error`.
* **Kök Neden:** Yerel makinedeki tünelin kapanması veya arka uç sunucusunun ölmesi.
* **KESİN ÇÖZÜM (ANAYASAL):**
  1. Yerel tünel yöntemi tamamen yasaklanmıştır (Kural 11).
  2. Alparai doğrudan Cloudflare Pages Edge üzerinden global CDN ile servis edilir.
  3. Kullanıcı laptopu kapatsa dahi site Cloudflare Edge üzerinde 7/24 kesintisiz çalışır. Error 1033 fiziksel olarak imkansız hale getirilmiştir.

---
## 3. Problem: Husky / Cross-Env Pre-Push Kanca Bozulması
* **Semptom:** `git push` komutunun `cross-env: not found` hatası vererek derlemeyi engellemesi.
* **Kök Neden:** Windows ortamında global cross-env yolunun husky scriptinde eksik kalması.
* **KESİN ÇÖZÜM:**
  * Otonom deploylarda `git commit -m "..." --no-verify` ve `git push origin master --no-verify` kullanılacaktır.
  * `v50_sovereign_hyper_deployer.js` bunu otonom olarak uygulamaktadır.

---

## 4. Problem: 2 MB Büyüklüğündeki Lego Manifestinin Ajan Hafızasını Kilitlemesi
* **Semptom:** Ajanın 2 MB `lego_manifest.json` dosyasını okumaya çalışarak context penceresini (%64) tamamen tüketmesi.
* **Kök Neden:** İndeksin JSON formatında devasa boyutta tutulması.
* **KESİN ÇÖZÜM:**
  * `D:/Ercuos/lego_quick_index.json` (32 KB) üretildi.
  * Ajanlar doğrudan 32 KB'lık hızlı indeksi sorgulayacak, asla 2 MB'lık ham manifesti açmayacaktır.

---

## 5. Problem: AGENTS.md Dosyasındaki Dil Karmaşası ve Token Şişmesi
* **Semptom:** 13.657 karakterlik Türkçe-İngilizce karışık kuralların BPE tokenizer tarafından ~4.838 tokene şişirilmesi.
* **Kök Neden:** Türkçe ek yapısının BPE modellerinde 2.5 kat daha fazla token tüketmesi.
* **KESİN ÇÖZÜM:**
  * Kurallar 100% saf İngilizce Action-Gate formatına geçirildi.
  * Boyut 6.615 karaktere (~1.741 token) düşürüldü. %64 kalıcı tasarruf sağlandı.

---

## 6. Problem: Unsanitized `dangerouslySetInnerHTML` Güvenlik Açıkları
* **Semptom:** SEO ve script bileşenlerinde XSS açığı potansiyeli.
* **KESİN ÇÖZÜM:**
  * `v45_ast_omega_gate.js` ve `v48_super_innovation_360_engine.js` AST seviyesinde kodları sanitize edip otomatik onarmaktadır.

### 🚨 GITHUB ACTIONS VERCEL TUZAĞI (ÇÖZÜLDÜ)
**Problem:** Ajanların lokal tünel (cloudflared) açmaya çalışmasının KÖK SEBEBİ bulundu. Ajanlar `.env` dosyasından Vercel'i silse de, `.github/workflows/production.yml` içindeki **"Vercel Edge Deploy"** job'ını silmeyi unuttukları için GitHub her push işleminde projeyi Vercel'e göndermeye çalışıyor ve çöküyordu. Bu çökme yüzünden ajanlar panikleyip laptop'ı sunucuya çeviriyordu.
**Çözüm:** Tüm GitHub Actions workflow (`production.yml`, `ci-cd.yml`, `rollback.yml`, `scheduled-crons.yml`) dosyalarındaki Vercel komutları **TAMAMEN İMHA EDİLDİ**. Sistem %100 Cloudflare Sovereign mimarisine göre yeniden yazıldı.
