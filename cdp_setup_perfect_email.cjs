const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const mailTab = tabs.find(t => t.url && t.url.includes('purelymail.com'));
    if (!mailTab) {
      console.log('Purelymail sekmesi bulunamadı.');
      return;
    }
    console.log('[KUSURSUZ KURULUM] Purelymail sekmesine bağlanılıyor:', mailTab.id);
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
      console.log('1. Temiz compose ekranına yönlendiriliyor...');
      await sendCmd(1, 'Page.navigate', { url: 'https://inbox.purelymail.com/?_task=mail&_action=compose' });
      await new Promise(r => setTimeout(r, 3500));

      console.log('2. Alanlar dolduruluyor (To, Cc, Subject, Temiz Gövde)...');
      const emailBody = `Sayın Teknopark İstanbul Değerlendirme Kurulu,

14 Eylül ve 17 Eylül tarihli geri bildirimleriniz doğrultusunda, ALPAR AI projemizin revize edilmiş başvuru dosyaları ve ek evrakları ektedir. Argeportal üzerindeki 16 bilgi kartımız da güncellenerek eksiksiz onaya sunulmuştur.

ALPAR AI, basit bir yazılım ürünü değil; AB Yapay Zeka Yasası (EU AI Act) uyumluluğu ve otonom karar izlenebilirliği konularındaki teknik belirsizlikleri aşmayı hedefleyen, OECD Frascati Kılavuzu standartlarında bir TRL-4 Ar-Ge projesidir. Amacımız, 2027 uyumluluk penceresinde Türkiye'nin ilk yerli AI güvenilirlik ve denetim altyapısını Teknopark İstanbul ekosisteminde inşa etmektir.

Ekli Dosyalar Hakkında Önemli Notlar:
1. Proje Değerlendirme Paketi (PDP), detaylı bilgi tablosu, Gantt şeması ve ekibimizin/danışma kurulumuzun CV'leri eksiksiz eklenmiştir.
2. NVİ e-Devlet sistemindeki geçici teknik kesinti nedeniyle standart yerleşim yeri belgesi sistemden alınamamıştır. Bu geçici durum süresince, aynı adrese ait aktif İSKİ Abonelik Sözleşmesi ilgili mevzuat çerçevesinde adres teyit belgesi olarak sunulmaktadır. (Bkz: 03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf)

Tüm süreçlerin Teknopark İstanbul'un vizyonuna ve Ar-Ge misyonuna uygun şekilde tamamlandığını bilgilerinize sunarım.

Saygılarımla,

Ercüment ERDEN
Kurucu, ALPAR AI
ercument.erden@alparai.com • +90 532 440 83 89 • https://alparai.com`;

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
              subInput.value = 'Re: Proje Ön Değerlendirme Hk. — ALPAR AI (Başvuru Kodu: 2973908 / Proje ID: 7244)';
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
      console.log('Metin doldurma sonucu:', fillRes?.result?.value);

      // 3. Dosyaları bağlama
      console.log('3. input[type="file"] elementi tespit ediliyor...');
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

      console.log('4. 16 dosya (İSKİ dahil, mükerrersiz) yükleniyor...');
      await sendCmd(6, 'DOM.setFileInputFiles', {
        nodeId: nodeRes.nodeId,
        files: filesToAttach
      });

      console.log('Yüklemenin tamamlanması için 8 saniye bekleniyor...');
      await new Promise(r => setTimeout(r, 8000));

      const attachCheck = await sendCmd(7, 'Runtime.evaluate', {
        expression: `
          Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li')).map(li => ({
            name: li.innerText.replace(/\\s+/g, ' ').trim()
          }))
        `,
        returnByValue: true
      });
      console.log('Eklenen 16 Dosya Listesi (Canlı UI):');
      console.table(attachCheck?.result?.value);

      console.log('KURULUM TAMAMLANDI: E-POSTA KUSURSUZ HALE GETİRİLDİ. GÖNDER BUTONUNA BASILMADI.');
      ws.close();
    });
  });
});
