const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const apTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!apTab) {
      console.log(JSON.stringify({ error: 'Argeportal sekmesi bulunamadı' }));
      return;
    }

    const ws = new WebSocket(apTab.webSocketDebuggerUrl);
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
      // Argeportal içindeki menü linklerini ve mevcut açık sayfa içeriğini çek
      const scanResult = await sendCmd(1, 'Runtime.evaluate', {
        expression: `
          (() => {
            const currentUrl = document.location.href;
            const title = document.title;
            const fullText = document.body.innerText;

            // Kart linklerini bul
            const cardLinks = Array.from(document.querySelectorAll('a, li, span, button'))
              .filter(el => el.innerText && el.innerText.trim().length > 3)
              .map(el => el.innerText.trim())
              .filter((v, i, a) => a.indexOf(v) === i);

            // Mevcut form alanları
            const formFields = Array.from(document.querySelectorAll('input[type="text"], textarea, select'))
              .map(el => ({
                id: el.id || el.name || 'field',
                val: el.value ? el.value.substring(0, 100) : ''
              }))
              .filter(f => f.val !== '');

            return {
              currentUrl,
              title,
              textLength: fullText.length,
              hasB2BTitle: fullText.includes('Büyük Dil Modelleri İçin Deterministik Karar Güvenliği'),
              hasOldTitle: fullText.includes('Kitle Kaynaklı'),
              hasMusaAygul: fullText.includes('Musa AYGÜL') || fullText.includes('Musa Aygül'),
              hasRifatAlbuz: fullText.includes('Ahmet Rıfat') || fullText.includes('ALBUZ'),
              hasTRL6: fullText.includes('TRL 6') || fullText.includes('TRL-6'),
              hasFrascati: fullText.includes('Frascati'),
              has5M: fullText.includes('5.000.000') || fullText.includes('5000000'),
              has18Ay: fullText.includes('18 Ay') || fullText.includes('18 ay') || fullText.includes('18'),
              formFieldsCount: formFields.length,
              formFieldsSample: formFields.slice(0, 15),
              summarySnippet: fullText.substring(0, 2000)
            };
          })()
        `,
        returnByValue: true
      });

      console.log('Argeportal Derin Tarama Raporu:');
      console.log(JSON.stringify(scanResult?.result?.value, null, 2));
      ws.close();
    });
  });
});
