const http = require('http');
const fs = require('fs');

const logFile = 'D:/AlparAi/.scratch/audit_log.txt';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(msg);
}

fs.writeFileSync(logFile, '--- AUTOPILOT AUDIT START ---\n');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', async () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!target) return log('Target tab not found');

    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let cmdId = 1;
    function evaluate(expression) {
      return new Promise((resolve, reject) => {
        const id = cmdId++;
        const onMsg = (msg) => {
          const resp = JSON.parse(msg.data);
          if (resp.id === id) {
            ws.removeEventListener('message', onMsg);
            if (resp.error) reject(new Error(resp.error.message));
            else resolve(resp.result?.result?.value);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({
          id,
          method: 'Runtime.evaluate',
          params: { expression, awaitPromise: true, returnByValue: true }
        }));
      });
    }

    ws.onopen = async () => {
      try {
        log('Connected to CDP');

        // Check active dialogs first and close them
        const closeRes = await evaluate(`(() => {
          let closed = 0;
          document.querySelectorAll('.ui-dialog:not([style*="display: none"])').forEach(d => {
            const closeBtn = d.querySelector('.fa-times')?.closest('a');
            if (closeBtn) { closeBtn.click(); closed++; }
          });
          return { closed };
        })()`);
        log(`Initial cleanup closed: ${closeRes.closed} dialogs`);

        const cards = [
          {
            id: '15',
            name: 'Proje Hedefleri',
            fields: {
              'KazanimveSonuclar': 'Projenin temel hedefi; büyük dil modelleri (LLM) ve otonom yapay zeka sistemlerinin karar alma mekanizmalarını, yanlılık (bias), halüsinasyon, veri sızıntısı ve güvenlik zafiyetlerini, modelin tescilli ağırlıklarını ve ticari sırlarını ifşa etmeksizin Sıfır-Bilgi İspatları (Zero-Knowledge Proofs - ZKP) ile matematiksel olarak denetleyen, 17 farklı vektörde adversarial stres testine tabi tutan ve AB Yapay Zeka Yasası (EU AI Act Article 6, 52) ile ISO/IEC 42001 standartlarına uyumluluğunu otonom olarak sertifikalandıran AI Audit Score™ motorunu geliştirmektir. Somut Hedefler: 1) Halüsinasyon tespitinde <25ms P95 gecikme ve %98+ doğruluk. 2) PII Guardian ile sıfır kişisel veri sızıntısı. 3) EU AI Act yüksek riskli sistemler için tam otomatik akreditasyon raporlaması.'
            }
          },
          {
            id: '19',
            name: 'Proje Nitelikleri',
            fields: {
              'ArgeNiteligi': 'Mevcut yapay zeka denetim araçları salt istatistiksel girdi-çıktı gözlemine ve harici kural tabanlı filtrelere dayanmaktadır; modelin iç tensöryel dönüşümlerini doğrulayamaz. Projemizde ise transformatör modellerinin içsel tensör operasyonları ve ağırlık uzayları Circom ve SnarkJS temelli ZK-SNARK aritmetik devrelerine indirgenmektedir. Modelin gizli parametreleri dışarıya sızdırılmaksızın çıktının güvenlik sınırlarına uygun üretildiği matematiksel kriptografik kanıtlarla (Groth16/Plonk zk-proofs) formal olarak ispatlanmaktadır. Milyarlarca parametreli derin öğrenme modellerinin sıfır-bilgi devrelerine minimum hesaplama maliyetiyle dönüştürülmesi dünyada çözülmemiş en ileri kriptolojik Ar-Ge problemlerinden biridir.',
              'YenilikciYonu': 'Proje; donanım seviyesinde çalışan ZKP kanıtlayıcıları (Prover/Verifier), çok-ajanlı dağıtık mutabakat (multi-agent consensus) mimarisi ve 17-vektörlü otonom adversarial kırmızı takım (red-teaming) motorunu tek bir çatı altında birleştiren ilk yerli ve küresel güvenilirlik altyapısıdır. Model sahiplerinin fikri mülkiyetini korurken denetleyicilere ve düzenleyici otoritelere %100 matematiksel doğrulama güvencesi sunmasıyla sektördeki kara-kutu (black-box) denetim çıkmazını kökten çözmektedir.',
              'MilliHedef_Uygunluk_ED': 'T.C. Cumhurbaşkanlığı Dijital Dönüşüm Ofisi ve T.C. Sanayi ve Teknoloji Bakanlığı tarafından yayımlanan Ulusal Yapay Zeka Stratejisi (UYZS) hedefleri doğrultusunda; kritik kamu altyapıları, savunma sanayii, bankacılık ve sağlık sektörlerinde kullanılacak yapay zeka sistemlerinin yabancı bulut platformlarına ve denetim mekanizmalarına bağımlı kalmaksızın, milli ve egemen kriptografik standartlarla denetlenmesini, belgelendirilmesini ve siber egemenliğimizin korunmasını sağlayacaktır.'
            }
          },
          {
            id: '25',
            name: 'Arge Aşamaları',
            fields: {
              'Mevcut_THS': 'ALPAR AI çekirdek doğrulama mimarisi, ZKP tabanlı denetim algoritmaları ve 17-vektörlü adversarial test betikleri laboratuvar ortamında doğrulanmış ve çalışan bir MVP altyapısına (alparai.com) kavuşturulmuştur. Platform 72 üretim API ucu, 1.130+ başarılı birim test ve 103 SQL migrasyonu ile TRL 5 (bileşenlerin laboratuvar ortamında geçerli kılınması) aşamasındadır.',
              'Hedef_THS': '18 aylık Ar-Ge süreci sonunda, ALPAR AI platformu gerçek kurumsal çalışma ortamında (bankacılık, fintek ve kamu veri merkezleri) pilot modeller üzerinde çalıştırılacak, donanım seviyesinde ZKP hızlandırma optimizasyonları tamamlanacak ve sistem operasyonel ortamda kanıtlanmış ticari ürün olarak TRL 7 seviyesine ulaşacaktır.'
            }
          },
          {
            id: '27',
            name: 'Proje Detayı',
            fields: {
              'Detay': 'ALPAR AI MİMARİSİ VE 18 AYLIK AR-GE İŞ PAKETLERİ\n\n1. MİMARİ KATMANLAR:\n- Kriptografik ZKP Doğrulama Katmanı: Model çıkarım matrislerini Circom/SnarkJS devrelerine indirger.\n- 17-Vektörlü Adversarial Stres Testi: Prompt injection, jailbreak, halüsinasyon, veri zehirleme ve üyelik çıkarımı açıklarını otonom test eder.\n- Dağıtık Çok-Ajanlı Mutabakat: Denetim bulgularını BFT konsensüsü ile birleştirerek manipüle edilemez AI Audit Score™ üretir.\n\n2. 18 AYLIK İŞ PAKETLERİ DAĞILIMI (DOC-03 GANTT ŞEMASI İLE %100 MUTABIK):\n- İP-1 (Ay 1-4, Ekim 2026 – Ocak 2027): Ticari API Platformu, Kriptografik ZKP Devre Tasarımı ve Çekirdek Halüsinasyon Tespit Motoru v2.0.\n- İP-2 (Ay 5-9, Şubat – Haziran 2027): 17-Vektörlü Adversarial Test Motoru, Sigorta Risk Verisi API ve EU AI Act Hukuki Uyum Modülü.\n- İP-3 (Ay 10-14, Temmuz – Kasım 2027): Dağıtık Çok-Ajanlı Mutabakat (Consensus), B2G Kamu Entegrasyonu ve TÜBİTAK/KOSGEB Ar-Ge Fazı.\n- İP-4 (Ay 15-18, Aralık 2027 – Mart 2028): Saha Pilot Testleri, Uluslararası Pazar Entegrasyonu, Global Patent Başvuruları ve ISO/IEC 42001 Sertifikasyonu.'
            }
          },
          {
            id: '30',
            name: 'Ortaklar-Anahtar Kelimeler',
            fields: {
              'TGBDisGorevGerekce': '4691 sayılı Teknoloji Geliştirme Bölgeleri Kanunu kapsamında; projenin niteliği gereği finans, savunma ve sağlık alanındaki kurumsal paydaşların kapalı devre veri merkezlerinde yerinde testlerin yürütülmesi, pilot sunucu altyapı kurulumları, üniversite laboratuvarlarındaki yüksek başarımlı hesaplama (HPC) entegrasyonları ve akademik saha çalışmaları için Ar-Ge personelinin bölge dışında görevlendirilmesi zorunluluk arz etmektedir.'
            }
          },
          {
            id: '33',
            name: 'Teknopark Hizmetleri',
            fields: {
              'Teknoparkta_Yer_Alma_Nedeni_T': 'Teknopark İstanbul ve Cube Incubation ekosistemi; derin teknoloji (DeepTech), yapay zeka güvenliği ve kriptoloji alanındaki Ar-Ge projemizin hızla ticarileşmesi, TTO aracılığıyla uluslararası patent (PCT/EPO) tescil süreçleri, savunma ve fintek kümeleme ağlarıyla stratejik iş birlikleri kurulması ve kurumsal yatırımcı ağlarına erişim sağlanması açısından en ideal inovasyon üssüdür.',
              'Teknoparkta_Etkilesimde_Bulunan_Firmalar_T': 'Teknopark İstanbul bünyesinde yer alan finansal teknolojiler, siber güvenlik, savunma sanayii ve büyük veri analitiği şirketleriyle ortak pilot testler ve entegrasyon protokolleri yürütülecektir.'
            }
          },
          {
            id: '38',
            name: 'Ekonomik Değer',
            fields: {
              'EkonomikDegeri': 'Gartner ve Stanford AI Index verilerine göre küresel AI Governance ve Trust pazarı 2026 itibarıyla 4.8 Milyar Dolar TAM büyüklüğüne ulaşmıştır; pazar yıllık bileşik büyüme oranı (CAGR) %42.5 seviyesindedir. ALPAR AI; 1) Halüsinasyon API, 2) Etik Denetim API, 3) Hukuki Uyum API, 4) Sigorta Risk Verisi API, 5) Trust Oracle ve 6) Whistleblower olmak üzere 6 katmanlı gelir modeliyle 12 ay sonunda 12M TL, 24 ay sonunda %65i döviz bazlı 45M TL ciro hedeflemektedir.',
              'Proje_Musterisi_ED': 'Öncelikli hedef kitlemiz: 1) Bankacılık ve fintek kurumları (kredi ve dolandırıcılık tespiti yapan LLM modellerinin denetimi), 2) Sağlık ve biyoteknoloji şirketleri (veri gizliliği ve medikal teşhis güvenilirliği), 3) Sigorta şirketleri (Lloyds ve Munich Re aktüeryal yapay zeka risk modellemesi), 4) Kamu kurumları ve regülatörler (AB Yapay Zeka Yasası ve KVKK uyum denetimleri).',
              'HedefPazar_Lokal_Global_ED': '1. Yerli Pazar (Türkiye): Ulusal Yapay Zeka Stratejisi doğrultusunda kamu, savunma ve fintek sektöründeki 200+ kurumsal yapının yapay zeka güvenlik akreditasyonu. 2. Küresel Pazar (AB ve Körfez): AB Yapay Zeka Yasasının yürürlüğe girmesiyle birlikte yüksek riskli yapay zeka sağlayıcılarına zorunlu tutulan bağımsız denetim ve ZKP akreditasyon hizmeti ihracatı.',
              'Rekabet_Analizi_ED': 'Küresel rakipler (Credo AI, Arthur AI, Robust Intelligence) yalnızca bulut bağımlı ve istatistiksel kara-kutu gözlemi sunmakta, yerli dil ve mevzuata tam uyum sağlayamamaktadır. ALPAR AI ise Circom/SnarkJS tabanlı ZKP kriptografik kanıtlama, 17-vektörlü otonom red-teaming ve KVKK + EU AI Act çift regülasyon uyumu ile dünyadaki ilk tam egemen ve matematiksel doğrulama altyapısıdır.'
            }
          },
          {
            id: '39',
            name: 'Çevreye Etkileri',
            fields: {
              'CevreyeEtkileri': 'Proje Yeşil Bilişim (Green Computing) mimarisiyle tasarlanmıştır. Modellerin milyarlarca parametresini sürekli yeniden eğitmek (fine-tuning) yerine geliştirdiğimiz hafif ZKP çıkarım doğrulaması ve tensöryel projeksiyon algoritmalarımız sayesinde donanım enerji tüketiminde %60 oranında tasarruf sağlanmakta; sunucu karbon ayak izi minimize edilerek çevre dostu ve sürdürülebilir bir hesaplama altyapısı sunulmaktadır.',
              'Surdurulebilirlik': 'Çevresel sürdürülebilirlik ilkelerine tam uyumlu olarak sunucu optimizasyonlarında sıfır-tahsisli bellek yönetimi kullanılmakta; ekonomik sürdürülebilirlik açısından ise 6 farklı ticari gelir katmanı ve B2B kurumsal aboneliklerle güçlü ve sürekli bir nakit akışı hedeflenmektedir.'
            }
          },
          {
            id: '40',
            name: 'Dış Hizmetler',
            fields: {
              'AlinacakDisHizmetler': 'Proje kapsamında alınacak dış hizmetler:\n1. Akademik Kriptoloji ve Matematiksel Kanıt Danışmanlığı: Circom/SnarkJS aritmetik devre tasarımları için üniversite öğretim üyelerinden akademik destek.\n2. Uluslararası Hukuk ve Regülasyon Danışmanlığı: Selçuk Üniversitesi Hukuk Fakültesi Milletlerarası Özel Hukuk Anabilim Dalı Başkanı Prof. Dr. Musa AYGÜL liderliğinde AB Yapay Zeka Yasası (EU AI Act) ve MÖHUK tam akreditasyon danışmanlığı.\n3. Bağımsız Kırmızı Takım (Red-Teaming) ve Sızma Testi: Uluslararası akredite siber güvenlik firmasından adversarial denetim ve stres testi hizmeti.'
            }
          }
        ];

        // Process cards in 3 complete passes
        for (let pass = 1; pass <= 3; pass++) {
          log(`\n=== PASS ${pass} / 3 ===`);

          for (let card of cards) {
            log(`Processing [Pass ${pass}] -> ${card.name} (id: ${card.id})`);

            // Step 1: Open card
            const openRes = await evaluate(`(() => {
              const btn = document.getElementById('${card.id}');
              if (!btn) return { error: 'Btn not found' };
              btn.click();
              return { success: true };
            })()`);

            if (openRes.error) {
              log(`ERROR opening ${card.name}: ${openRes.error}`);
              continue;
            }

            // Wait for dialog to open
            await new Promise(r => setTimeout(r, 1200));

            // Step 2: Inject fields
            const injectRes = await evaluate(`(() => {
              const dialog = Array.from(document.querySelectorAll('.ui-dialog'))
                .find(d => d.offsetParent !== null && d.style.display !== 'none');
              if (!dialog) return { error: 'Dialog not visible' };

              const fields = ${JSON.stringify(card.fields)};
              let modified = 0;
              let matchCount = 0;

              for (let fId in fields) {
                const el = document.getElementById(fId);
                if (!el) continue;

                const target = fields[fId].trim();
                const current = el.value.trim();

                if (current !== target) {
                  el.value = target;
                  if (window.$) {
                    window.$(el).val(target).trigger('input').trigger('change');
                  } else {
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                  modified++;
                } else {
                  matchCount++;
                }
              }

              return { modified, matchCount };
            })()`);

            if (injectRes.error) {
              log(`ERROR injecting ${card.name}: ${injectRes.error}`);
            } else {
              log(`[${card.name}] Modified: ${injectRes.modified}, Matches: ${injectRes.matchCount}`);
            }

            // Step 3: If modified, save via Kaydet (F3)
            if (injectRes.modified > 0) {
              log(`[${card.name}] Saving via Kaydet (F3)...`);
              const saveRes = await evaluate(`(() => {
                const dialog = Array.from(document.querySelectorAll('.ui-dialog'))
                  .find(d => d.offsetParent !== null && d.style.display !== 'none');
                if (!dialog) return { error: 'Dialog not found' };

                const saveBtn = dialog.querySelector('.saveButton')
                  || Array.from(dialog.querySelectorAll('a, button')).find(b => /kaydet/i.test(b.innerText || ''));
                if (!saveBtn) return { error: 'Save button not found' };

                saveBtn.click();
                if (window.$) window.$(saveBtn).trigger('click');
                return { success: true };
              })()`);
              log(`[${card.name}] Save clicked: ${JSON.stringify(saveRes)}`);
              await new Promise(r => setTimeout(r, 1500));
            }

            // Step 4: Close the dialog via top-right 'x'
            const closeRes = await evaluate(`(() => {
              const dialog = Array.from(document.querySelectorAll('.ui-dialog'))
                .find(d => d.offsetParent !== null && d.style.display !== 'none');
              if (!dialog) return { closed: true };

              const closeBtn = dialog.querySelector('.jarviswidget-ctrls a:has(.fa-times), .fa-times')?.closest('a');
              if (closeBtn) {
                closeBtn.click();
                return { closed: true, method: 'fa-times' };
              }
              return { closed: false };
            })()`);

            log(`[${card.name}] Closed dialog: ${JSON.stringify(closeRes)}`);
            await new Promise(r => setTimeout(r, 600));
          }
        }

        log('\n--- 3 PASSES FINISHED SUCCESSFULLY ---');

        // Capture clean screen
        const screenshotResp = await new Promise((resolve) => {
          const id = cmdId++;
          const onMsg = (msg) => {
            const resp = JSON.parse(msg.data);
            if (resp.id === id) {
              ws.removeEventListener('message', onMsg);
              resolve(resp.result);
            }
          };
          ws.addEventListener('message', onMsg);
          ws.send(JSON.stringify({
            id,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        });

        if (screenshotResp && screenshotResp.data) {
          fs.writeFileSync('D:/AlparAi/.scratch/final_autopilot_screen.png', Buffer.from(screenshotResp.data, 'base64'));
          log('Clean desktop screenshot saved to D:/AlparAi/.scratch/final_autopilot_screen.png');
        }

        ws.close();
        process.exit(0);

      } catch (err) {
        log(`FATAL ERROR: ${err.message}\n${err.stack}`);
        ws.close();
        process.exit(1);
      }
    };

    ws.onerror = (err) => log(`WebSocket Error: ${err.message}`);
  });
});
