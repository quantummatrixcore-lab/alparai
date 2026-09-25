const WebSocket = require('ws');
const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const mailTab = tabs.find(t => t.url && t.url.includes('inbox.purelymail.com'));
    if (!mailTab) {
      console.log('Mail tab not found');
      return;
    }
    console.log('Connecting to mail tab:', mailTab.id);
    const ws = new WebSocket(mailTab.webSocketDebuggerUrl);

    function sendCmd(id, method, params = {}) {
      return new Promise((resolve) => {
        const handler = (msg) => {
          const resp = JSON.parse(msg);
          if (resp.id === id) {
            ws.removeListener('message', handler);
            resolve(resp.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.on('open', async () => {
      console.log('1. Navigating to fresh compose page...');
      await sendCmd(1, 'Page.navigate', { url: 'https://inbox.purelymail.com/?_task=mail&_action=compose' });
      await new Promise(r => setTimeout(r, 3000));

      console.log('2. Filling form fields (To, Cc, Subject, Body)...');
      const emailBody = `Sayın Yusuf Bey ve Sayın Ali İhsan Bey,

17.09.2026 tarihli bildiriminiz ve Teknopark İstanbul Kuluçka aday firma başvurumuza (Kullanıcı No: 8300 / Başvuru Kodu: 2973908 / Firma ID: 3030 / Proje ID: 7244) istinaden; kurucu ve proje ekibi evraklarımız ile güncel tebligat/ikamet adresimiz aşağıda ve ekte eksiksiz olarak bilgilerinize sunulmuştur:

1. GÜNCEL TEBLİGAT VE İKAMET ADRESİ
• Adres: Mustafa Kemalpaşa Mah. Mutluluk Sk. No: 39, Daire: 3
• İlçe / İl: Avcılar / İstanbul, Türkiye
• Telefon: +90 532 440 83 89
• E-Posta: ercument.erden@alparai.com

2. İBRAZ EDİLEN PROJE VE ŞAHSİ BELGELER (EKTE)
1. Kurumsal Portre Fotoğrafı (Ercument_Erden_Executive_Portrait.jpg)
2. e-Devlet Barkodlu Adli Sicil Kaydı Belgesi (02_Adli_Sicil_Kaydi_Ercument_Erden.pdf — Barkod: ADB02223143386)
3. e-Devlet Barkodlu Nüfus Kayıt Örneği (01_Nufus_Kayit_Ornegi_Ercument_Erden.pdf)
4. Yargıtay Dava Dosyası Sorgulama Ekranı (Yargıtay.png)
5. Adalet Bakanlığı UYAP Dava Dosyası Sorgulama Ekranı (04_UYAP_Dava_Sorgulama.png)
6. e-Devlet İSKİ Su Aboneliği & Geçici Yerleşim Yeri / Adres Teyit Belgesi:
   (Resmî Açıklama: e-Devlet Nüfus ve Vatandaşlık İşleri [NVİ] Yerleşim Yeri Belgesi sorgulama servisinde yaşanan geçici teknik altyapı kesintisi nedeniyle, değerlendirme sürecinizi aksatmamak adına; kurucumuz Ercüment ERDEN adına kayıtlı, aktif durumdaki konut su aboneliği ve ikametgah adresimizi teyit eden e-Devlet onaylı resmî İSKİ dökümü geçici adres teyit belgesi olarak ekte sunulmuştur. NVİ servisi normale döndüğünde standart barkodlu ikametgah belgesi de ayrıca ibraz edilecektir.) (03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf — Abone No: 32753557)
7. SGK Tescil ve Hizmet Dökümü — Barkodlu 10 Sayfa (65245305662-SGK.pdf)
8. YÖK Barkodlu Mezuniyet Belgeleri (İşletme Lisans, Endüstriyel Elektronik Ön Lisans, Halkla İlişkiler Ön Lisans)
9. 01 — Hızlandırma ve Öncelikli Girişim Bilgi Tablosu (.xlsx + .pdf)
10. 02 — Proje Değerlendirme Paneli (PDP) Dokümanı (.pdf)
11. 03 — YZ Hızına Göre Kalibre Edilmiş 18 Aylık Ar-Ge İş-Zaman Çizelgesi (.pdf)
12. 04 — Kurucu Girişimci Özgeçmişi — Ercüment ERDEN (.pdf)
13. 05 — Danışma Kurulu ve Kilit Paydaş Profilleri (.pdf)

Argeportal sistemimiz üzerindeki tüm Firma (10/10), Personel (1/1) ve Proje (16/16) kartları eksiksiz yüklenmiş olup %100 Yeşil Onay durumundadır.

Proje Değerlendirme Paneli (PDP) oturumu takviminizi bekler, iyi çalışmalar dileriz.

Saygılarımızla,

Ercüment ERDEN
Kurucu Girişimci & Baş Sistem Mimarı • ALPAR AI
+90 532 440 83 89 • ercument.erden@alparai.com • https://alparai.com
ALPAR AI Bilişim ve Teknoloji • T.C. Kimlik: 65245305662 • Teknopark İstanbul Kuluçka Başvurusu`;

      const fillRes = await sendCmd(2, 'Runtime.evaluate', {
        expression: `
          (function() {
            const toInput = document.querySelector('#_to');
            const ccInput = document.querySelector('#_cc');
            const subInput = document.querySelector('#_subject');
            const bodyTxt = document.querySelector('#_message, #composebody');

            if (toInput) {
              toInput.value = 'yarvas@teknoparkistanbul.com.tr';
              toInput.dispatchEvent(new Event('input', { bubbles: true }));
              toInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (ccInput) {
              ccInput.value = 'acoskun@teknoparkistanbul.com.tr';
              ccInput.dispatchEvent(new Event('input', { bubbles: true }));
              ccInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (subInput) {
              subInput.value = 'Re: Proje Ön Değerlendirme Hk. — ALPAR AI (Başvuru: 2973908)';
              subInput.dispatchEvent(new Event('input', { bubbles: true }));
              subInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (bodyTxt) {
              bodyTxt.value = ${JSON.stringify(emailBody)};
              bodyTxt.dispatchEvent(new Event('input', { bubbles: true }));
              bodyTxt.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return {
              to: toInput?.value,
              cc: ccInput?.value,
              sub: subInput?.value,
              bodyLen: bodyTxt?.value?.length
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Fill result:', fillRes?.result?.value);

      // 3. Find file input node for DOM.setFileInputFiles
      console.log('3. Finding file input node in DOM...');
      await sendCmd(3, 'DOM.enable');
      const doc = await sendCmd(4, 'DOM.getDocument');
      const nodeRes = await sendCmd(5, 'DOM.querySelector', {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]'
      });
      console.log('File input nodeId:', nodeRes.nodeId);

      const filesToAttach = [
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\01_HIZLANDIRMA_BILGI_TABLOSU.xlsx',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\01_HIZLANDIRMA_BILGI_TABLOSU.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\02_PROJE_DEGERLENDIRME_PDP.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\03_IS_ZAMAN_CIZELGESI_18AY.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\04_KURUCU_OZGECMISI_ERCUMENT_ERDEN.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\05_DANISMA_KURULU_PROFILI.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\01_Nufus_Kayit_Ornegi_Ercument_Erden.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\02_Adli_Sicil_Kaydi_Ercument_Erden.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\04_UYAP_Dava_Sorgulama.png',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\Yargıtay.png',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662-SGK.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662_Mezun-Endüstriyel-Elektronik.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662_Mezun-İşletme.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662_Mezun-Halkla-İlişkiler.pdf',
        'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\Ercument_Erden_Executive_Portrait.jpg'
      ];

      console.log('4. Setting 16 files via DOM.setFileInputFiles...');
      await sendCmd(6, 'DOM.setFileInputFiles', {
        nodeId: nodeRes.nodeId,
        files: filesToAttach
      });

      console.log('Waiting 6 seconds for uploads to process in Roundcube...');
      await new Promise(r => setTimeout(r, 6000));

      const attachCheck = await sendCmd(7, 'Runtime.evaluate', {
        expression: `
          Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li')).map(li => ({
            id: li.id,
            name: li.innerText.trim(),
            className: li.className
          }))
        `,
        returnByValue: true
      });
      console.log('Attachments loaded in Roundcube UI:');
      console.table(attachCheck?.result?.value);

      ws.close();
    });
  });
});
