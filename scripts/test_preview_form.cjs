const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    console.log('--- Triggering Başvuru Formu Önizleme ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('btnOnizlemeFormuYazdir');
        if (btn) btn.click();
      })()`
    });

    await sleep(3000);

    const previewState = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.modal.in, .modal.show, .ui-dialog, #divAdayFirmaContent, iframe');
        return {
          hasIframe: !!document.querySelector('iframe'),
          iframeSrc: document.querySelector('iframe') ? document.querySelector('iframe').src : null,
          modalText: modal ? modal.innerText.slice(0, 1000) : 'No modal',
          bodyLen: document.body.innerText.length
        };
      })()`,
      returnByValue: true
    });

    console.log('--- PREVIEW RESULT ---');
    console.log(JSON.stringify(previewState?.result?.value, null, 2));
    ws.close();
  });
}

main().catch(console.error);
