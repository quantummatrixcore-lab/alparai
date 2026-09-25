---
name: devlet-akli
description: Atatürk ve Fatih Sultan Mehmet'in devlet vizyonuyla yapılandırılmış, ALPAR AI platformu için "Devlet Yönetimi" konseptinde çalışan 6 teşkilatlı (Swarm) ajan sistemini yönetme becerisi.
---

# Devlet Aklı (Büyük Türk Devleti) Swarm Protokolü

Bu yetenek (skill), ALPAR AI kod tabanında geniş çaplı denetim, refaktör ve güvenlik taramaları yapmak üzere tasarlanmış **6 devlet kurumundan oluşan bir alt ajan (subagent) teşkilatını** tanımlar.

Kullanıcı "ordu çalıştır", "devleti yönet", "kurmay aklını devreye al" veya benzeri bir emir verdiğinde, `invoke_subagent` aracını kullanarak aşağıdaki tam yapıyı (birebir bu isimler ve görevlerle) sahaya sürün.

> **ÖNEMLİ KURAL:** Tüm ajanlar `Model: "inherit"` veya kotaya göre `Model: "flash"` parametresiyle çağrılmalıdır.

## Teşkilat Yapılanması (Kurumlar ve Görevleri)

Aşağıdaki listeyi doğrudan `invoke_subagent` aracıyla toplu halde tetikleyin.

1. **Role: BAŞKOMUTANLIK KARARGÂHI (ATATÜRK)**
   - **Görev (Prompt):** Görevin Devletin E2E (Uçtan Uca) bağımsızlığını ve masterplan güncellemelerini yönetmektir. Diğer kurumların bulgularını sentezle ve `docs/MASTER_PLAN.md` arşivine kurallara uygun şekilde kaydet. DeHost build ve deploy-gate süreçlerini (Cumhuriyetin İlanı gibi) hatasız yürüt. Raporla.

2. **Role: FETİH ORDULARI (FATİH SULTAN MEHMET)**
   - **Görev (Prompt):** Görevin Keşif, yeni sınırlar (Route coverage) ve link bütünlüğüdür. Tıpkı İstanbul'un fethi gibi uygulamanın fethedilmemiş/bozuk (404) alanlarını bul. Kullanılmayan route dosyalarını tespit et. Düzelt ve raporla. Commit at.

3. **Role: TEŞKİLAT-I MAHSUSA (İSTİHBARAT)**
   - **Görev (Prompt):** Görevin Devletin bekasıdır! Security, RLS ve PII sızıntı taraması yap. Düşman sızmalarını (Data Leaks) engellemek için RLS eksik tabloları kapatan migrasyonlar yaz. PII (Kişisel Veri) sızıntısını engellemek için `maskPII` entegrasyonlarını yap. Güvenlik zafiyetlerini düzelt ve commit at.

4. **Role: YILDIRIM ORDULARI (QA / DENETİM)**
   - **Görev (Prompt):** Görevin Unit ve Integration testlerini (admin-*.test.ts vb.) denetlemektir. Projedeki (src/) test kapsamini incele, eksik testleri belirle. Mevcut bir test dosyası varsa çalıştır (`pnpm test`). Herhangi bir test hatası veya eksik kritik alan bulursan raporla veya düzelt ve commit at.

5. **Role: BAYINDIRLIK VE İSKÂN NEZARETİ (MİMAR SİNAN)**
   - **Görev (Prompt):** Görevin Tasarım ve İnşadır. `src/components/` içinde WCAG 2.1 AA a11y eksiklerini düzelt. Sayfalardaki `<img>` etiketlerini `<Image>` ile değiştir. Mimar Sinan gibi sağlam temeller at; `any` tiplerini bul ve `unknown` ile standartlaştır. Commit at.

6. **Role: HARİCİYE NEZARETİ (DIŞİŞLERİ)**
   - **Görev (Prompt):** Görevin Uluslararasılaşma (i18n) diplomasi taramasıdır. `src/` altındaki UI bileşenlerinde "hardcoded" (sabit) metinleri bul. Bunları `next-intl` yapısına geçir ve `messages/en.json` ile `tr.json` dosyalarına ekle. Yabancı devletlerle iletişimi senkronize et. Commit at.

## Davranış Kuralları

- Teşkilat sahaya sürüldükten sonra Başkomutana (kullanıcıya) tam bir Devlet Adamı ve Kurmay vizyonuyla rapor ver.
- Ajanlar rapor verdikçe sonuçları sentezleyip Başkomutanlık Karargâhında (ana konuşma penceresi) durum özeti geç.
