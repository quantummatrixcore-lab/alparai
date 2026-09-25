/**
 * scripts/run_portal_diagnostics.cjs
 * Runs exact internal portal validation functions via CDP to get 100% precise status.
 */

const WebSocket = require('ws');

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) {
    console.error('No Argeportal tab found!');
    process.exit(1);
  }

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
    console.log('--- Running Argeportal Internal Validation Diagnostics ---');
    const diag = await send('Runtime.evaluate', {
      expression: `(async () => {
        const firmId = aim.user.firmid;
        const results = {};

        // 1. Firma Zorunlu Evrak Kontrolü
        try {
          results.firmaZorunluEvraklar = await helper_modul_adayfirma_zorunlu_evrak_kontrol(1522, firmId);
        } catch(e) {
          results.firmaZorunluEvraklarErr = e.message;
        }

        // 2. Proje Id ve Proje Zorunlu Evrak Kontrolü
        try {
          const projeRes = await new Promise((res) => {
            helper_getData({
              namespace: "AdayFirma",
              controller: "AdayFirmaProjeTanimi",
              action: "ProjeAdiGetir",
              value: { Firma_Id: firmId },
              onComplete: (r) => res(r),
              onError: (err) => res({ err })
            });
          });
          results.projeBilgisi = projeRes;
          const projeId = projeRes?.data?.ProjeId;
          if (projeId) {
            results.projeZorunluEvraklar = await helper_modul_zorunlu_evrak_kontrol(1565, projeId);
          }
        } catch(e) {
          results.projeZorunluEvraklarErr = e.message;
        }

        // 3. Doldurulacak Alan Var Mı?
        try {
          results.doldurulacakAlanVarMi = await new Promise((res) => {
            helper_getData({
              namespace: "AdayFirma",
              controller: "AdayFirmaGenelIslem",
              action: "DoldurulacakAlanVarMi",
              value: {},
              onComplete: (r) => res(r),
              onError: (err) => res({ err })
            });
          });
        } catch(e) {
          results.doldurulacakAlanVarMiErr = e.message;
        }

        return results;
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('--- DIAGNOSTIC RESULTS ---');
    console.log(JSON.stringify(diag?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
