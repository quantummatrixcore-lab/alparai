const WebSocket = require('ws');

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) return;
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const curId = ++id;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === curId) {
          ws.removeListener('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.on('open', async () => {
    console.log('--- Testing AdayFirmaGenelMudurKontrol via page context ---');
    const checkRes = await send('Runtime.evaluate', {
      expression: `new Promise((resolve) => {
        try {
          helper_getData({
            namespace: "AdayFirma",
            controller: "AdayFirmaGerekliEvrak",
            action: "AdayFirmaGenelMudurKontrol",
            value: { Firma_Id: aim.user.firmid },
            onComplete: function(res) {
              resolve({ ok: true, data: res });
            },
            onError: function(err) {
              resolve({ ok: false, error: err });
            }
          });
        } catch(e) {
          resolve({ exception: e.message });
        }
      })`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('--- KONTROL RESULT ---');
    console.log(JSON.stringify(checkRes?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
