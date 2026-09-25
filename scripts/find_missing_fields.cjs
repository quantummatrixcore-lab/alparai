/**
 * scripts/find_missing_fields.cjs
 * Finds exactly which card/field makes DoldurulacakAlanVarMi return "True"
 */

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
    const check = await send('Runtime.evaluate', {
      expression: `(async () => {
        // Let's check card statuses from the page state or call controller actions
        // In Argeportal, each card button has an id or data attributes
        const buttons = Array.from(document.querySelectorAll('.adayfirmabutton')).map(b => ({
          id: b.id,
          text: b.innerText.trim()
        }));

        // Let's also check if there is an endpoint that returns card status list
        const cardStatus = await new Promise((res) => {
          helper_getData({
            namespace: "AdayFirma",
            controller: "AdayFirmaGenelIslem",
            action: "AdayFirmaKartDurumlari",
            value: {},
            onComplete: (r) => res(r),
            onError: (err) => res(err)
          });
        });

        // Also check AdayFirmaEksikAlanlar or similar if exists
        const eksikRes = await new Promise((res) => {
          helper_getData({
            namespace: "AdayFirma",
            controller: "AdayFirmaGenelIslem",
            action: "AdayFirmaEksikAlanGetir",
            value: {},
            onComplete: (r) => res(r),
            onError: (err) => res(err)
          });
        });

        return {
          buttonsCount: buttons.length,
          cardStatus,
          eksikRes
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log(JSON.stringify(check?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
