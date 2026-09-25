const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const tabs = JSON.parse(data);
    const apTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    if (!apTab) return;

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
      // Proje Hedefleri linkine tıkla
      const clickRes = await sendCmd(1, 'Runtime.evaluate', {
        expression: `
          (() => {
            const links = Array.from(document.querySelectorAll('a, li, span, button'));
            const target = links.find(el => el.innerText && el.innerText.trim() === 'Proje Hedefleri');
            if (target) {
              target.click();
              return 'CLICKED_PROJE_HEDEFLERI';
            }
            return 'PROJE_HEDEFLERI_NOT_FOUND';
          })()
        `,
        returnByValue: true
      });
      console.log('Navigasyon:', clickRes?.result?.value);

      await new Promise(r => setTimeout(r, 2500));

      const dumpInputs = await sendCmd(2, 'Runtime.evaluate', {
        expression: `
          (() => {
            const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea')).map(el => ({
              id: el.id,
              name: el.name,
              value: el.value.substring(0, 100)
            })).filter(el => el.value !== '');
            return {
              url: document.location.href,
              inputs: inputs
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Form Elemanları:', JSON.stringify(dumpInputs?.result?.value, null, 2));
      ws.close();
    });
  });
});
