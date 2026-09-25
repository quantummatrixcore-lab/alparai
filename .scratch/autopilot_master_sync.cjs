const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!target) return console.error('Target tab not found');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      const expr = `(async () => {
        const updates = [
          {
            cardId: '15',
            name: 'Proje Hedefleri',
            fields: {
              'KazanimveSonuclar': 'Projenin temel hedefi; buyuk dil modelleri (LLM) ve otonom yapay zeka sistemlerinin karar alma mekanizmalarini, yanlilik (bias), halusinasyon, veri sizintisi ve guvenlik zafiyetlerini, modelin tescilli agirliklarini ve ticari sirlarini ifsa etmeksizin Sifir-Bilgi Ispatlari (Zero-Knowledge Proofs - ZKP) ile matematiksel olarak denetleyen, 17 farkli vektorde adversarial stres testine tabi tutan ve AB Yapay Zeka Yasasi (EU AI Act Article 6, 52) ile ISO/IEC 42001 standartlarina uyumlulugunu otonom olarak sertifikalandiran AI Audit Score™ motorunu gelistirmektir. Somut Hedefler: 1) Halusinasyon tespitinde <25ms P95 gecikme ve %98+ dogruluk. 2) PII Guardian ile sifir kisisel veri sizintisi. 3) EU AI Act yuksek riskli sistemler icin tam otomatik akreditasyon raporlamasi.'
            }
          },
          {
            cardId: '19',
            name: 'Proje Nitelikleri',
            fields: {
              'ArgeNiteligi': 'Mevcut yapay zeka denetim araclari salt istatistiksel girdi-cikti gozlemine ve harici kural tabanli filtrelere dayanmaktadir; modelin ic tensor donusumlerini dogrulayamaz. Projemizde ise transformator modellerinin ic tensoryel operasyonlari ve agirlik uzaylari Circom ve SnarkJS temelli ZK-SNARK aritmetik devrelerine indirgenmektedir. Modelin gizli parametreleri disariya sizdirilmaksizin ciktinin guvenlik sinirlarina uygun uretildigi matematiksel kriptografik kanitlarla (Groth16/Plonk zk-proofs) formal olarak ispatlanmaktadir. Milyarlarca parametreli derin ogrenme modellerinin sifir-bilgi devrelerine minimum hesaplama maliyetiyle donusturulmesi dunyada cozulmemis en ileri kriptolojik Ar-Ge problemlerinden biridir.',
              'YenilikciYonu': 'Proje; donanim seviyesinde calisan ZKP kanitlayicilari (Prover/Verifier), cok-ajanli dagitik mutabakat (multi-agent consensus) mimarisi ve 17-vektorlu otonom adversarial kirmizi takim (red-teaming) motorunu tek bir cati altinda birlestiren ilk yerli ve kuresel guvenilirlik altyapisidir. Model sahiplerinin fikri mulkiyetini korurken denetleyicilere ve duzenleyici otoritelere %100 matematiksel dogrulama guvencesi sunmasiyla sektordeki kara-kutu (black-box) denetim cikmazini kokten cozmektedir.',
              'MilliHedef_Uygunluk_ED': 'T.C. Cumhurbaskanligi Dijital Donusum Ofisi ve T.C. Sanayi ve Teknoloji Bakanligi tarafindan yayimlanan Ulusal Yapay Zeka Stratejisi (UYZS) hedefleri dogrultusunda; kritik kamu altyapilari, savunma sanayii, bankacilik ve saglik sektorlerinde kullanilacak yapay zeka sistemlerinin yabanci bulut platformlarina ve denetim mekanizmalarina bagimli kalmaksizin, milli ve egemen kriptografik standartlarla denetlenmesini, belgelendirilmesini ve siber egemenligimizin korunmasini saglayacaktir.'
            }
          },
          {
            cardId: '25',
            name: 'Arge Asamalari',
            fields: {
              'Mevcut_THS': 'ALPAR AI cekirdek dogrulama mimarisi, ZKP tabanli denetim algoritmalari ve 17-vektorlu adversarial test scriptleri laboratuvar ortaminda dogrulanmis ve calisan bir MVP altyapisina (alparai.com) kavusturulmustur. Platform 72 uretim API ucu, 1.130+ basarili birim test ve 103 SQL migrasyonu ile TRL 5 (bilesenlerin laboratuvar ortaminda gecerli kilinmasi) asamasindadir.',
              'Hedef_THS': '18 aylik Ar-Ge sureci sonunda, ALPAR AI platformu gercek kurumsal calisma ortaminda (bankacilik, fintek ve kamu veri merkezleri) pilot modeller uzerinde calistirilacak, donanim seviyesinde ZKP hizlandirma optimizasyonlari tamamlanacak ve sistem operasyonel ortamda kanitlanmis ticari urun olarak TRL 7 seviyesine ulasacaktir.'
            }
          },
          {
            cardId: '27',
            name: 'Proje Detayi',
            fields: {
              'Detay': 'ALPAR AI MİMARİSİ VE 18 AYLIK AR-GE İŞ PAKETLERİ\\n\\n1. MİMARİ KATMANLAR:\\n- Kriptografik ZKP Doğrulama Katmanı: Model çıkarım matrislerini Circom/SnarkJS devrelerine indirger.\\n- 17-Vektörlü Adversarial Stres Testi: Prompt injection, jailbreak, halüsinasyon, veri zehirleme ve üyelik çıkarımı açıklarını otonom test eder.\\n- Dağıtık Çok-Ajanlı Mutabakat: Denetim bulgularını BFT konsensüsü ile birleştirerek manipüle edilemez AI Audit Score™ üretir.\\n\\n2. 18 AYLIK İŞ PAKETLERİ DAĞILIMI (DOC-03 GANTT ŞEMASI İLE %100 MUTABIK):\\n- İP-1 (Ay 1-4, Ekim 2026 – Ocak 2027): Ticari API Platformu, Kriptografik ZKP Devre Tasarımı ve Çekirdek Halüsinasyon Tespit Motoru v2.0.\\n- İP-2 (Ay 5-9, Şubat – Haziran 2027): 17-Vektörlü Adversarial Test Motoru, Sigorta Risk Verisi API ve EU AI Act Hukuki Uyum Modülü.\\n- İP-3 (Ay 10-14, Temmuz – Kasım 2027): Dağıtık Çok-Ajanlı Mutabakat (Consensus), B2G Kamu Entegrasyonu ve TÜBİTAK/KOSGEB Ar-Ge Fazı.\\n- İP-4 (Ay 15-18, Aralık 2027 – Mart 2028): Saha Pilot Testleri, Uluslararası Pazar Entegrasyonu, Global Patent Başvuruları ve ISO/IEC 42001 Sertifikasyonu.'
            }
          },
          {
            cardId: '30',
            name: 'Ortaklar-Anahtar Kelimeler',
            fields: {
              'TGBDisGorevGerekce': '4691 sayili Teknoloji Gelistirme Bolgeleri Kanunu kapsaminda; projenin niteligi geregi finans, savunma ve saglik alanindaki kurumsal paydaslarin kapali devre veri merkezlerinde yerinde testlerin yurutulmesi, pilot sunucu altyapi kurulumlari, universite laboratuvarlarindaki yuksek basarimli hesaplama (HPC) entegrasyonlari ve akademik saha calismalari icin Ar-Ge personelinin bolge disinda gorevlendirilmesi zorunluluk arz etmektedir.'
            }
          },
          {
            cardId: '33',
            name: 'Teknopark Hizmetleri',
            fields: {
              'Teknoparkta_Yer_Alma_Nedeni_T': 'Teknopark Istanbul ve Cube Incubation ekosistemi; derin teknoloji (DeepTech), yapay zeka guvenligi ve kriptoloji alanindaki Ar-Ge projemizin hizla ticarilesmesi, TTO araciligiyla uluslararasi patent (PCT/EPO) tescil surecleri, savunma ve fintek kumeleme aglariyla stratejik is birlikleri kurulmasi ve kurumsal yatirimci aglarina erisim saglanmasi acisindan en ideal inovasyon ussudur.',
              'Teknoparkta_Etkilesimde_Bulunan_Firmalar_T': 'Teknopark Istanbul bunyesinde yer alan finansal teknolojiler, siber guvenlik, savunma sanayii ve buyuk veri analitigi sirketleriyle ortak pilot testler ve entegrasyon protokolleri yurutulecektir.'
            }
          },
          {
            cardId: '38',
            name: 'Ekonomik Deger',
            fields: {
              'EkonomikDegeri': 'Gartner ve Stanford AI Index verilerine gore kuresel AI Governance ve Trust pazari 2026 itibariyla 4.8 Milyar Dolar TAM buyuklugune ulasmistir; pazar yillik bilesik buyume orani (CAGR) %42.5 seviyesindedir. ALPAR AI; 1) Halusinasyon API, 2) Etik Denetim API, 3) Hukuki Uyum API, 4) Sigorta Risk Verisi API, 5) Trust Oracle ve 6) Whistleblower olmak uzere 6 katmanli gelir modeliyle 12 ay sonunda 12M TL, 24 ay sonunda %65i doviz bazli 45M TL ciro hedeflemektedir.',
              'Proje_Musterisi_ED': 'Oncelikli hedef kitlemiz: 1) Bankacilik ve fintek kurumlari (kredi ve dolandiricilik tespiti yapan LLM modellerinin denetimi), 2) Saglik ve biyoteknoloji sirketleri (veri gizliligi ve medikal teshis guvenilirligi), 3) Sigorta sirketleri (Lloyds ve Munich Re aktueryal yapay zeka risk modellemesi), 4) Kamu kurumlari ve regulatorler (AB Yapay Zeka Yasasi ve KVKK uyum denetimleri).',
              'HedefPazar_Lokal_Global_ED': '1. Yerli Pazar (Turkiye): Ulusal Yapay Zeka Stratejisi dogrultusunda kamu, savunma ve fintek sektorundeki 200+ kurumsal yapinin yapay zeka guvenlik akreditasyonu. 2. Kuresel Pazar (AB ve Korfez): AB Yapay Zeka Yasasinin yururluge girmesiyle birlikte yuksek riskli yapay zeka saglayicilarina zorunlu tutulan bagimsiz denetim ve ZKP akreditasyon hizmeti ihracati.',
              'Rekabet_Analizi_ED': 'Kuresel rakipler (Credo AI, Arthur AI, Robust Intelligence) yalnizca bulut bagimli ve istatistiksel kara-kutu gozlemi sunmakta, yerli dil ve mevzuata tam uyum saglayamamaktadir. ALPAR AI ise Circom/SnarkJS tabanli ZKP kriptografik kanitlama, 17-vektorlu otonom red-teaming ve KVKK + EU AI Act cift regulasyon uyumu ile dunyadaki ilk tam egemen ve matematiksel dogrulama altyapisidir.'
            }
          },
          {
            cardId: '39',
            name: 'Cevreye Etkileri',
            fields: {
              'CevreyeEtkileri': 'Proje Yesil Bilisim (Green Computing) mimarisiyle tasarlanmistir. Modellerin milyarlarca parametresini surekli yeniden egitmek (fine-tuning) yerine gelistirdigimiz hafif ZKP cikarim dogrulamasi ve tensoryel projeksiyon algoritmalarimiz sayesinde donanim enerji tuketiminde %60 oraninda tasarruf saglanmakta; sunucu karbon ayak izi minimize edilerek cevre dostu ve surdurulebilir bir hesaplama altyapisi sunulmaktadir.',
              'Surdurulebilirlik': 'Cevresel surdurulebilirlik ilkelerine tam uyumlu olarak sunucu optimizasyonlarinda sifir-tahsisli bellek yonetimi kullanilmakta; ekonomik surdurulebilirlik acisindan ise 6 farkli ticari gelir katmani ve B2B kurumsal aboneliklerle guclu ve surekli bir nakit akisi hedeflenmektedir.'
            }
          },
          {
            cardId: '40',
            name: 'Dis Hizmetler',
            fields: {
              'AlinacakDisHizmetler': 'Proje kapsaminda alinacak dis hizmetler:\\n1. Akademik Kriptoloji ve Matematiksel Kanit Danismanligi: Circom/SnarkJS aritmetik devre tasarımları icin universite ogretim uyelerinden akademik destek.\\n2. Uluslararasi Hukuk ve Regülasyon Danismanligi: Selcuk Universitesi Hukuk Fakultesi Milletlerarasi Ozel Hukuk Anabilim Dali Baskani Prof. Dr. Musa AYGUL liderliginde AB Yapay Zeka Yasasi (EU AI Act) ve MOHUK tam akreditasyon danismanligi.\\n3. Bagimsiz Kirmizi Takim (Red-Teaming) ve Sizma Testi: Uluslararasi akredite siber guvenlik firmasindan adversarial denetim ve stres testi hizmeti.'
            }
          }
        ];

        let logReport = [];

        for (let pass = 1; pass <= 3; pass++) {
          logReport.push('=== STARTING PASS ' + pass + ' ===');

          for (let item of updates) {
            const btn = document.getElementById(item.cardId);
            if (!btn) {
              logReport.push('[Pass ' + pass + '] Button not found for: ' + item.name + ' (' + item.cardId + ')');
              continue;
            }

            btn.click();
            await new Promise(r => setTimeout(r, 1200));

            let changed = false;
            for (let fieldId in item.fields) {
              const el = document.getElementById(fieldId);
              if (!el) {
                logReport.push('[Pass ' + pass + '] Field ' + fieldId + ' not found in ' + item.name);
                continue;
              }

              const targetVal = item.fields[fieldId];
              if (el.value.trim() !== targetVal.trim()) {
                el.value = targetVal;
                $(el).val(targetVal).trigger('input').trigger('change');
                changed = true;
              }
            }

            if (changed) {
              await new Promise(r => setTimeout(r, 500));
              const saveBtns = Array.from(document.querySelectorAll('.saveButton')).filter(b => b.offsetParent !== null);
              if (saveBtns.length > 0) {
                saveBtns[0].click();
                await new Promise(r => setTimeout(r, 2000));
                logReport.push('[Pass ' + pass + '] Updated & Saved: ' + item.name);
              } else {
                logReport.push('[Pass ' + pass + '] Save button not found for: ' + item.name);
              }
            } else {
              logReport.push('[Pass ' + pass + '] 100% Verified Match: ' + item.name);
            }
          }
        }

        return { logReport };
      })()`;

      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true, returnByValue: true }
      }));
    };

    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('SYNC RESULT:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
