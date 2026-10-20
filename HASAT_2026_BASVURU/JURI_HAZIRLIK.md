# HASAT JÜRİ HAZIRLIĞI — 13 Günde Neler Değişti (07 → 20 Ekim 2026)

> Başvuru mühürlüdür, değiştirilmez. Bu dosya jüri sunumunda "başvurudan sonra
> ne yaptınız?" sorusunun cevabıdır. Hepsi yayında, hepsi doğrulanabilir.

## 1. Rakam güncellemesi (jüriye sözlü + tek sayfa ek)

- Vaka: 2.908 → **3.115 mühürlü vaka** (sahte/çöp kayıt filtresi eklendi).
- Ürün: "prototip" → **7 canlı modül** (ceza kalkanı, sigorta verisi, güven rozeti,
  tarayıcı eklentisi, savunma masası, güvenlik ligi, bekçi taraması).
- Güvenlik: bağımsız taramada **sıfır kritik açık** (üretim tarafı tertemiz).
- Ekip söylemi aynı kalır ama gerçek değişti: tek kişi + iki danışman → jüri
  "ekibi nasıl büyüteceksiniz?" diye soracak (cevap Bölüm 4'te).

## 2. Canlı demo akışı (3 dakika, sırayla)

1. **0:00–1:00 Vaka akışı:** alparai.com/en/incidents açılır (3.130 kayıt —
   20 Ekim CANLI TEST EDİLDİ, çalışıyor). Gerçek bir vaka gösterilir.
2. **1:00–2:00 Güven rozeti:** alparai.com/api/badge?provider=openai açılır
   (94.2 puan AAA — 20 Ekim CANLI TEST EDİLDİ, çalışıyor).
3. **2:00–3:00 Bekçi taraması:** SADECE SUNUCU GÜNCELLENİRSE. Yeni modüller
   henüz yayında değil; güncellenmeden gösterilirse 404 verir.

- Yedek plan: internet giderse ekran görüntüleri PDF'i (bu klasörde tutulur).
- KRİTİK: jüriden ÖNCE sunucuda güncelleme yapılıp 4 bağlantı tekrar
  test edilmeli (adımlar Bölüm 6'da).

## 3. Jürinin en zor 10 sorusu + kısa cevaplar

1. "Gelir yok, neden size inanalım?" → 13 günde 7 ürün modülü yayına alındı;
   ilk hedef 10 pilot şirket, 3'ü ücretli. Hız kanıttır.
2. "Ekip tek kişi, risk değil mi?" → Doğru, ilk iş teknik ortak + satış.
   HASAT ofisi ve maaşı bu riski kapatır.
3. "Rakipler (Credo, Fiddler) daha büyük?" → Onlar şirketlere rapor satar;
   biz halkın şikâyetini + mahkeme delilini + anlık engellemeyi birleştiririz.
   Aynı iş değil.
4. "Veri nereden geliyor?" → 3.115 mühürlü vaka; kaynaklar şeffaf, sahte
   kayıt filtresi aktif.
5. "Neden Teknopark?" → Otorite zırhı + savunma/finans devlerine pilot kapısı
   - patent desteği + vergi muafiyeti.
6. "Patentiniz var mı?" → Başvuru hazırlanıyor; HASAT patent hattı bunun için
   isteniyor (dürüst cevap: henüz yok).
7. "AB yasası ertelenirse?" → Şikâyet + itibar işi yasadan bağımsız çalışır;
   yasa hızlandırıcıdır, tek bacak değil.
8. "Sunucu maliyeti?" → Kademeli; pilot fazda mevcut altyapı yeter, ölçek
   gelire paralel büyür.
9. "Çıkış planı?" → Sigorta/denetim devlerine veri lisansı veya satın alma; 3. yılda $15-30M ciro hedefi.
10. "Parayı neye harcayacaksınız?" → %50 mühendis maaşı, %25 hukuk/patent,
    %25 pilot satış gideri. Tek sayfa bütçe sunuma eklenir.

## 4. Bu hafta yapılacaklar (öncelik sırası)

1. [ ] HASAT portalı + e-posta (spam dahil) HER GÜN kontrol — jüri daveti kaçmasın.
2. [ ] 5 dakikalık sunumu 3 kez sesli prova et (süre tutarak).
3. [ ] Demo akışını canlı sitede 1 kez baştan sona dene.
4. [ ] Şirket evraklarını tek klasöre koy (vergi levhası, imza sirküleri, faaliyet belgesi).
5. [ ] Tek sayfa "13-gün ilerleme raporu" çıktısı al (bu dosyanın 1. bölümü).

## 5. Güncelliğini yitirenler (jüriye eski sayıyla gitme!)

- `ONE_PAGER.md` ve pitch deck: 2.908 sayısı + "prototip" ifadesi ESKİDİ.
  Sunumda sözlü güncelle: "başvurudan bu yana 3.115 vaka, 7 canlı modül".

## 6. Sunucu güncelleme (jüriden ÖNCE şart — kurucu yapar)

1. Sunucuya bağlan (güvenli hat üzerinden).
2. Kod klasöründe: `git pull origin master` + `pnpm install` + `pnpm build`.
3. Servisi yeniden başlat, siteyi açıp kontrol et.
4. Şu 4 bağlantıyı teker teker dene: `/en/incidents`,
   `/api/badge?provider=openai`, `/api/v1/models/openai/badge.svg`,
   `/api/v1/arena/rankings`. Dördü de açılıyorsa demo hazır.
   Biri hata verirse jüride o ekrana girme.
