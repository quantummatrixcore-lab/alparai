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
    // Query server for Kart 15 (Proje Hedefleri) and Kart 19 (Proje Nitelikleri)
    const cardData = await send('Runtime.evaluate', {
      expression: `(async () => {
        const firmId = aim.user.firmid;
        const projeRes = await new Promise(r => helper_getData({ namespace:"AdayFirma", controller:"AdayFirmaProjeTanimi", action:"ProjeAdiGetir", value:{Firma_Id:firmId}, onComplete: r }));
        const projeId = projeRes?.data?.ProjeId;

        // Fetch Kart 15 data
        const k15 = await new Promise(r => helper_getData({ namespace:"AdayFirma", controller:"AdayFirmaProjeHedefleri", action:"KartGetir", value:{Firma_Id:firmId, Proje_Id:projeId}, onComplete: r }));

        // Fetch Kart 19 data
        const k19 = await new Promise(r => helper_getData({ namespace:"AdayFirma", controller:"AdayFirmaProjeNitelikleri", action:"KartGetir", value:{Firma_Id:firmId, Proje_Id:projeId}, onComplete: r }));

        return {
          k15: k15?.data || k15,
          k19: k19?.data || k19
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('--- CURRENT PORTAL TEXTS ---');
    console.log(JSON.stringify(cardData?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
