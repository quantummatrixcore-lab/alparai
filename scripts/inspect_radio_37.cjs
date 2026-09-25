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
    const radioInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const r37 = document.getElementById('GerekliEvrakTanimi_Id_37');
        const hiddenEvrak = document.getElementById('GerekliEvrakTanimi_Id');
        const hiddenKayit = document.getElementById('Kayit_Id');
        const hiddenFirma = document.getElementById('FirmaId');
        const hiddenModul = document.getElementById('ModulAyarlari_Id');

        return {
          r37: r37 ? { onclick: r37.getAttribute('onclick'), onchange: r37.getAttribute('onchange'), value: r37.value, outer: r37.outerHTML } : null,
          hiddenEvrakVal: hiddenEvrak ? hiddenEvrak.value : null,
          hiddenKayitVal: hiddenKayit ? hiddenKayit.value : null,
          hiddenFirmaVal: hiddenFirma ? hiddenFirma.value : null,
          hiddenModulVal: hiddenModul ? hiddenModul.value : null,
          errorRowText: document.querySelector('.template-upload, .template-download, tr.error')?.innerText || null
        };
      })()`,
      returnByValue: true
    });

    console.log(JSON.stringify(radioInfo?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
