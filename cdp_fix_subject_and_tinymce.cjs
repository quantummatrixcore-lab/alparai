const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const mailTab = tabs.find(t => t.url && t.url.includes('purelymail.com') && t.url.includes('_task=mail') && t.url.includes('_action=compose'));
    if (!mailTab) return;

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
      const emailHtml = `
<p>Sayın Teknopark İstanbul Değerlendirme Kurulu,</p>
<p>14 Eylül ve 17 Eylül tarihli geri bildirimleriniz doğrultusunda, ALPAR AI projemizin revize edilmiş başvuru dosyaları ve ek evrakları ektedir. Argeportal üzerindeki 16 bilgi kartımız da güncellenerek eksiksiz onaya sunulmuştur.</p>
<p>ALPAR AI, basit bir yazılım ürünü değil; AB Yapay Zeka Yasası (EU AI Act) uyumluluğu ve otonom karar izlenebilirliği konularındaki teknik belirsizlikleri aşmayı hedefleyen, OECD Frascati Kılavuzu standartlarında bir TRL-4 Ar-Ge projesidir. Amacımız, 2027 uyumluluk penceresinde Türkiye'nin ilk yerli AI güvenilirlik ve denetim altyapısını Teknopark İstanbul ekosisteminde inşa etmektir.</p>
<p><strong>Ekli Dosyalar Hakkında Önemli Notlar:</strong></p>
<p>1. Proje Değerlendirme Paketi (PDP), detaylı bilgi tablosu, Gantt şeması ve ekibimizin/danışma kurulumuzun CV'leri eksiksiz eklenmiştir.<br>
2. NVİ e-Devlet sistemindeki geçici teknik kesinti nedeniyle standart yerleşim yeri belgesi sistemden alınamamıştır. Bu geçici durum süresince, aynı adrese ait aktif İSKİ Abonelik Sözleşmesi ilgili mevzuat çerçevesinde adres teyit belgesi olarak sunulmaktadır. (Bkz: 03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf)</p>
<p>Tüm süreçlerin Teknopark İstanbul'un vizyonuna ve Ar-Ge misyonuna uygun şekilde tamamlandığını bilgilerinize sunarım.</p>
<p>Saygılarımla,</p>
<p><strong>Ercüment ERDEN</strong><br>
Kurucu, ALPAR AI<br>
ercument.erden@alparai.com • +90 532 440 83 89 • https://alparai.com</p>
      `.trim();

      const injectRes = await sendCmd(1, 'Runtime.evaluate', {
        expression: `
          (() => {
            // 1. Subject
            const sub = document.getElementById('compose-subject') || document.querySelector('input[name="_subject"]');
            if (sub) {
              sub.value = 'Re: Proje Ön Değerlendirme Hk. — ALPAR AI (Başvuru Kodu: 2973908 / Proje ID: 7244)';
              sub.dispatchEvent(new Event('input', { bubbles: true }));
              sub.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 2. TinyMCE
            let tinymceSet = false;
            if (window.tinymce && window.tinymce.get('composebody')) {
              window.tinymce.get('composebody').setContent(${JSON.stringify(emailHtml)});
              tinymceSet = true;
            }

            // 3. Iframe direct
            const ifr = document.getElementById('composebody_ifr');
            if (ifr && ifr.contentDocument && ifr.contentDocument.body) {
              ifr.contentDocument.body.innerHTML = ${JSON.stringify(emailHtml)};
            }

            // 4. Textarea sync
            const txt = document.getElementById('composebody');
            if (txt) {
              txt.value = ${JSON.stringify(emailHtml)};
              txt.dispatchEvent(new Event('input', { bubbles: true }));
              txt.dispatchEvent(new Event('change', { bubbles: true }));
            }

            return {
              subVal: sub?.value,
              tinymceSet: tinymceSet,
              iframeContentLen: ifr?.contentDocument?.body?.innerText?.length,
              txtLen: txt?.value?.length,
              attachCount: document.querySelectorAll('#attachment-list li, .attachmentslist li').length
            };
          })()
        `,
        returnByValue: true
      });

      console.log('Enjeksiyon Sonucu:', JSON.stringify(injectRes?.result?.value, null, 2));
      ws.close();
    });
  });
});
